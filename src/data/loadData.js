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
 * Turkey default bbox (safe fallback)
 * Format: [minLng, minLat, maxLng, maxLat]
 * Covers: Aegean 25°E...Eastern 45°E, Southern 35°N...Northern 43°N
 */
export const TR_FALLBACK_BBOX = [25, 35, 45, 43];

/**
 * Recursive coordinate walker for all GeoJSON geometry types
 */
function walkCoords(coords, visit) {
  if (!coords) return;
  // Point: [lng, lat]
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    visit(coords);
    return;
  }
  // Multi* and Polygon/MultiPolygon deep arrays
  for (const c of coords) walkCoords(c, visit);
}

/**
 * Calculate bounding box from GeoJSON FeatureCollection
 * @param {Object} fc - GeoJSON FeatureCollection
 * @returns {Array|null} [minLng, minLat, maxLng, maxLat] or null
 */
export function bboxFromFeatureCollection(fc) {
  if (!fc || !fc.features || fc.features.length === 0) return null;

  let minLng = +Infinity;
  let minLat = +Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const visit = (xy) => {
    // GeoJSON position: [lng, lat]
    const lng = Number(xy[0]);
    const lat = Number(xy[1]);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  };

  for (const f of fc.features) {
    const g = f && f.geometry;
    if (!g || !g.coordinates) continue;
    walkCoords(g.coordinates, visit);
  }

  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
  
  // Final validation: lng/lat ranges and size
  if (minLng >= maxLng || minLat >= maxLat) return null;
  if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) return null;

  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Combine multiple bboxes into one
 * @param {Array} list - Array of bbox arrays
 * @returns {Array|null} [minLng, minLat, maxLng, maxLat] or null
 */
export function combineBbox(list) {
  const boxes = (list || []).map(normalizeBbox).filter(Boolean);
  if (boxes.length === 0) return null;

  let minLng = +Infinity;
  let minLat = +Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  
  for (const [a, b, c, d] of boxes) {
    if (a < minLng) minLng = a;
    if (b < minLat) minLat = b;
    if (c > maxLng) maxLng = c;
    if (d > maxLat) maxLat = d;
  }
  
  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
  if (minLng >= maxLng || minLat >= maxLat) return null;
  
  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Normalize and fix swapped or inverted bbox
 * @param {Array} b - bbox array (various formats)
 * @returns {Array|null} [minLng, minLat, maxLng, maxLat] or null
 */
export function normalizeBbox(b) {
  if (!b) return null;

  // Handle nested [[lng,lat],[lng,lat]] format
  if (Array.isArray(b[0])) {
    if (!Array.isArray(b[1])) return null;
    const sw = b[0];
    const ne = b[1];
    const lng1 = Number(sw[0]);
    const lat1 = Number(sw[1]);
    const lng2 = Number(ne[0]);
    const lat2 = Number(ne[1]);
    if (![lng1, lat1, lng2, lat2].every(Number.isFinite)) return null;
    
    const minLng = Math.min(lng1, lng2);
    const minLat = Math.min(lat1, lat2);
    const maxLng = Math.max(lng1, lng2);
    const maxLat = Math.max(lat1, lat2);
    
    if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) return null;
    if (minLng >= maxLng || minLat >= maxLat) return null;
    
    return [minLng, minLat, maxLng, maxLat];
  }

  // Expect [x1,y1,x2,y2] format
  if (!Array.isArray(b) || b.length !== 4) return null;
  let [x1, y1, x2, y2] = b.map(Number);
  if (![x1, y1, x2, y2].every(Number.isFinite)) return null;

  // Heuristic: lat ∈ [-90,90], lng ∈ [-180,180]
  const looksSwapped =
    Math.abs(x1) <= 90 && Math.abs(y1) <= 180 &&
    Math.abs(x2) <= 90 && Math.abs(y2) <= 180;

  if (looksSwapped) {
    [x1, y1] = [y1, x1];
    [x2, y2] = [y2, x2];
  }

  const minLng = Math.min(x1, x2);
  const minLat = Math.min(y1, y2);
  const maxLng = Math.max(x1, x2);
  const maxLat = Math.max(y1, y2);

  // Invalid range or out-of-world → return null (no clamping to hide errors)
  if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) return null;
  if (minLng >= maxLng || minLat >= maxLat) return null;

  return [minLng, minLat, maxLng, maxLat];
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

