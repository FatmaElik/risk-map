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
 * Safe fetch with better error messages
 */
async function safeFetch(path) {
  const url = dataUrl(path);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
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
 * Clear all caches
 */
export function clearCache() {
  cache.geojson.clear();
  cache.csv.clear();
}

