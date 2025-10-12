import Papa from 'papaparse';
import { normalizeProperties, getCityFromPath } from './fieldMap';
import { dataUrl } from './path';
import { makeKey } from './normalize';

// Cache for loaded data
const cache = {
  geojson: new Map(),
  csv: new Map(),
};

/**
 * Show a toast notification (non-blocking)
 */
function showToast(message, type = 'info') {
  const emoji = type === 'error' ? '❌' : 'ℹ️';
  console[type === 'error' ? 'error' : 'log'](`${emoji} ${message}`);
  // TODO: Add actual toast UI component if desired
}

/**
 * Safe fetch with better error messages and logging
 */
async function safeFetch(path) {
  const url = dataUrl(path);
  console.debug('[safeFetch] Fetching:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorMsg = `Fetch failed ${response.status} ${response.statusText} for ${url}`;
    console.error('❌ [safeFetch]', {
      url,
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(errorMsg);
  }
  
  console.debug('[safeFetch] Success:', url, response.status);
  return response;
}

/**
 * Load GeoJSON with graceful error handling
 */
export async function loadGeoJSON(path) {
  if (cache.geojson.has(path)) {
    return cache.geojson.get(path);
  }
  
  try {
    const response = await safeFetch(path);
    const data = await response.json();
    
    // Normalize properties and add city if missing
    const city = getCityFromPath(path);
    if (data.features) {
      data.features = data.features.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          city: feature.properties.city || city,
        },
      }));
    }
    
    cache.geojson.set(path, data);
    return data;
  } catch (error) {
    showToast(`Data file missing: ${path}. Rendering available layers only.`, 'error');
    return null;
  }
}

/**
 * Load multiple GeoJSONs and merge them
 */
export async function loadGeoJSONs(paths) {
  const results = await Promise.all(paths.map(path => loadGeoJSON(path)));
  const validResults = results.filter(Boolean);
  
  if (validResults.length === 0) {
    return null;
  }
  
  return {
    type: 'FeatureCollection',
    features: validResults.flatMap(fc => fc.features || []),
  };
}

/**
 * Load CSV with PapaParse
 */
export async function loadCSV(path) {
  if (cache.csv.has(path)) {
    return cache.csv.get(path);
  }
  
  try {
    const response = await safeFetch(path);
    const text = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          cache.csv.set(path, results.data);
          resolve(results.data);
        },
        error: (error) => {
          showToast(`Error parsing CSV: ${path}. ${error.message}`, 'error');
          resolve([]);
        },
      });
    });
  } catch (error) {
    showToast(`Data file missing: ${path}. Please provide it.`, 'error');
    return [];
  }
}

/**
 * Calculate centroid for a polygon/multipolygon
 */
function getCentroid(geometry) {
  if (!geometry) return null;
  
  const coords = [];
  if (geometry.type === 'Polygon') {
    coords.push(...geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) {
      coords.push(...poly[0]);
    }
  }
  
  if (coords.length === 0) return null;
  
  const sumLon = coords.reduce((sum, c) => sum + c[0], 0);
  const sumLat = coords.reduce((sum, c) => sum + c[1], 0);
  
  return {
    lon: sumLon / coords.length,
    lat: sumLat / coords.length,
  };
}

/**
 * Join CSV data with GeoJSON features
 * Returns enhanced GeoJSON with CSV properties
 */
export function joinCsvToGeojson(geojson, csvData) {
  if (!geojson || !csvData || csvData.length === 0) {
    return geojson;
  }
  
  // Create lookup map: mah_id -> CSV row
  const csvMap = new Map();
  csvData.forEach(row => {
    const key = row.mah_id || `${row.ilce_adi}_${row.mahalle_adi}`;
    csvMap.set(String(key), row);
  });
  
  // Join features with CSV data
  const enhancedFeatures = geojson.features.map(feature => {
    const props = feature.properties || {};
    const key = props.mah_id || `${props.ilce_adi}_${props.mahalle_adi}`;
    const csvRow = csvMap.get(String(key));
    
    if (csvRow) {
      return {
        ...feature,
        properties: {
          ...props,
          ...csvRow,
          // Add centroid if not present
          lon: csvRow.lon || props.lon,
          lat: csvRow.lat || props.lat,
        },
      };
    }
    
    return feature;
  });
  
  return {
    ...geojson,
    features: enhancedFeatures,
  };
}

/**
 * Extract scatter data from CSV or joined GeoJSON
 */
export function extractScatterData(csvData, geojson = null) {
  const points = [];
  
  // If we have joined GeoJSON, use it to get centroids
  if (geojson && geojson.features) {
    geojson.features.forEach(feature => {
      const props = feature.properties || {};
      const centroid = getCentroid(feature.geometry) || { lon: props.lon, lat: props.lat };
      
      if (centroid.lon && centroid.lat) {
        points.push({
          ...normalizeProperties(props),
          lon: centroid.lon,
          lat: centroid.lat,
        });
      }
    });
  } else if (csvData) {
    // Fallback to CSV data with lon/lat
    csvData.forEach(row => {
      if (row.lon && row.lat) {
        points.push(normalizeProperties(row));
      }
    });
  }
  
  return points;
}

/**
 * Calculate bounding box from GeoJSON FeatureCollection
 * @returns {Array|null} [minLng, minLat, maxLng, maxLat] or null
 */
export function bboxFromFeatureCollection(fc) {
  if (!fc || !fc.features || fc.features.length === 0) return null;

  let minLng = +Infinity;
  let minLat = +Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const visitCoord = (c) => {
    // GeoJSON: [lng, lat]
    const lng = c[0];
    const lat = c[1];
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
  };

  const visitGeom = (geom) => {
    if (!geom) return;
    const { type, coordinates } = geom;
    if (!coordinates) return;
    if (type === 'Point') visitCoord(coordinates);
    else if (type === 'MultiPoint' || type === 'LineString') coordinates.forEach(visitCoord);
    else if (type === 'MultiLineString' || type === 'Polygon') coordinates.flat(1).forEach(visitCoord);
    else if (type === 'MultiPolygon') coordinates.flat(2).forEach(visitCoord);
  };

  for (const f of fc.features) {
    visitGeom(f.geometry);
  }

  if (!Number.isFinite(minLng) || !Number.isFinite(minLat) || !Number.isFinite(maxLng) || !Number.isFinite(maxLat)) {
    return null;
  }
  
  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Combine multiple bboxes into one
 * @param {Array} list - Array of bbox arrays
 * @returns {Array|null} [minLng, minLat, maxLng, maxLat] or null
 */
export function combineBbox(list) {
  const valid = (list || []).filter(Boolean);
  if (valid.length === 0) return null;

  let minLng = +Infinity;
  let minLat = +Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  
  for (const b of valid) {
    const normalized = normalizeBbox(b);
    if (!normalized) continue;
    
    const [lng1, lat1, lng2, lat2] = normalized;
    if (lng1 < minLng) minLng = lng1;
    if (lat1 < minLat) minLat = lat1;
    if (lng2 > maxLng) maxLng = lng2;
    if (lat2 > maxLat) maxLat = lat2;
  }
  
  if (!Number.isFinite(minLng)) return null;
  
  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Normalize and fix swapped or inverted bbox
 * @param {Array} b - bbox array (various formats)
 * @returns {Array|null} [minLng, minLat, maxLng, maxLat] or null
 */
export function normalizeBbox(b) {
  if (!b || b.length < 4) return null;
  
  // Handle nested [[lng,lat],[lng,lat]] format
  if (Array.isArray(b[0])) {
    const [sw, ne] = b;
    return normalizeBbox([sw[0], sw[1], ne[0], ne[1]]);
  }
  
  let [x1, y1, x2, y2] = b.map(Number);

  // If it looks like [lat,lng,lat,lng], swap pairs by heuristic
  // lat must be [-90,90], lng must be [-180,180]
  const looksSwapped =
    Math.abs(x1) <= 90 && Math.abs(y1) <= 180 && Math.abs(x2) <= 90 && Math.abs(y2) <= 180;

  if (looksSwapped) {
    // swap each pair
    [x1, y1] = [y1, x1];
    [x2, y2] = [y2, x2];
  }

  // Ensure min/max order
  const minLng = Math.min(x1, x2);
  const minLat = Math.min(y1, y2);
  const maxLng = Math.max(x1, x2);
  const maxLat = Math.max(y1, y2);

  // Clamp to valid ranges
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  return [
    clamp(minLng, -180, 180),
    clamp(minLat,  -90,  90),
    clamp(maxLng, -180, 180),
    clamp(maxLat,  -90,  90),
  ];
}

// Legacy alias for compatibility
export const calculateBbox = bboxFromFeatureCollection;

/**
 * Clear all caches
 */
export function clearCache() {
  cache.geojson.clear();
  cache.csv.clear();
}

