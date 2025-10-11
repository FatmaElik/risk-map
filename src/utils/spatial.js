/**
 * Spatial utility functions for geometry operations
 */

/**
 * Validate that GeoJSON is in WGS84 (longitude/latitude) format
 * @param {Object} geojson - GeoJSON object to validate
 * @returns {Object} The same GeoJSON object
 * @throws {Error} If coordinates are not in valid WGS84 range
 */
export function ensureWGS84(geojson) {
  if (!geojson || !geojson.features) return geojson;
  
  const coords = [];
  geojson.features.forEach(feature => {
    const geometry = feature.geometry;
    if (!geometry) return;
    
    if (geometry.type === 'Point') {
      coords.push(geometry.coordinates);
    } else if (geometry.type === 'Polygon') {
      coords.push(...geometry.coordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach(poly => {
        coords.push(...poly[0]);
      });
    }
  });
  
  if (coords.length === 0) return geojson;
  
  // Check coordinate ranges
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  coords.forEach(coord => {
    const [x, y] = coord;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  
  const looksLikeLonLat = minX >= -180 && maxX <= 180 && minY >= -90 && maxY <= 90;
  const looksLikeTurkey = minX >= 25 && maxX <= 45 && minY >= 35 && maxY <= 43;
  
  if (!looksLikeLonLat) {
    console.error('❌ Invalid WGS84 coordinates:', { minX, maxX, minY, maxY });
    throw new Error(`GeoJSON not in WGS84 (EPSG:4326). Range: [${minX}, ${minY}] to [${maxX}, ${maxY}]`);
  }
  
  if (!looksLikeTurkey) {
    console.warn('⚠️ Coordinates outside Turkey bounds:', { minX, maxX, minY, maxY });
  }
  
  return geojson;
}

/**
 * Merge multiple GeoJSON FeatureCollections into one
 * @param {Array} fcs - Array of FeatureCollection objects
 * @returns {Object} Merged FeatureCollection
 */
export function mergeFC(fcs) {
  const allFeatures = fcs.flatMap(fc => fc?.features ?? []);
  return {
    type: 'FeatureCollection',
    features: allFeatures
  };
}

/**
 * Convert UTM coordinates to WGS84 (longitude/latitude).
 * @param {number} x - UTM X coordinate.
 * @param {number} y - UTM Y coordinate.
 * @param {number} zone - UTM zone (default: 36 for Turkey).
 * @returns {Array} [longitude, latitude].
 */
function utmToWgs84(x, y, zone = 36) {
  // Simplified UTM to WGS84 conversion for Turkey (Zone 36)
  const a = 6378137; // WGS84 semi-major axis
  const f = 1/298.257223563; // WGS84 flattening
  const k0 = 0.9996; // UTM scale factor
  const e2 = 2*f - f*f; // First eccentricity squared
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2)); // First eccentricity
  
  const N0 = 0; // False northing
  const E0 = 500000; // False easting
  const lambda0 = (zone - 1) * 6 - 180 + 3; // Central meridian
  
  const N = y - N0;
  const E = x - E0;
  
  const M = N / k0;
  const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));
  
  const phi1 = mu + (3*e1/2 - 27*e1*e1*e1/32) * Math.sin(2*mu) +
               (21*e1*e1/16 - 55*e1*e1*e1*e1/32) * Math.sin(4*mu) +
               (151*e1*e1*e1/96) * Math.sin(6*mu);
  
  const e1sq = e2 / (1 - e2);
  const rho1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(phi1) * Math.sin(phi1), 3/2);
  const nu1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) * Math.sin(phi1));
  
  const D = E / (nu1 * k0);
  const lat = phi1 - (nu1 * Math.tan(phi1) / rho1) * (D*D/2 - (5 + 3*Math.tan(phi1)*Math.tan(phi1) + 10*e1sq - 4*e1sq*e1sq - 9*e1sq*Math.tan(phi1)*Math.tan(phi1)) * D*D*D*D/24 + (61 + 90*Math.tan(phi1)*Math.tan(phi1) + 298*e1sq + 45*Math.tan(phi1)*Math.tan(phi1)*Math.tan(phi1)*Math.tan(phi1)) * D*D*D*D*D*D/720);
  
  const lon = lambda0 + (D - (1 + 2*Math.tan(phi1)*Math.tan(phi1) + e1sq) * D*D*D/6 + (5 - 2*e1sq + 28*Math.tan(phi1)*Math.tan(phi1) - 3*e1sq*e1sq + 8*e1sq*Math.tan(phi1)*Math.tan(phi1) + 24*Math.tan(phi1)*Math.tan(phi1)*Math.tan(phi1)*Math.tan(phi1)) * D*D*D*D*D/120) / Math.cos(phi1);
  
  return [lon * 180 / Math.PI, lat * 180 / Math.PI];
}

/**
 * Calculate bounding box for a feature or feature collection
 */
export function getBounds(geojson) {
  if (!geojson) return null;
  
  const coords = [];
  const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson];
  
  features.forEach(feature => {
    const geometry = feature.geometry;
    if (!geometry) return;
    
    if (geometry.type === 'Point') {
      coords.push(geometry.coordinates);
    } else if (geometry.type === 'Polygon') {
      coords.push(...geometry.coordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach(poly => {
        coords.push(...poly[0]);
      });
    }
  });
  
  if (coords.length === 0) return null;
  
  // Check if coordinates are UTM (large numbers) and convert to WGS84
  const isUtm = coords.some(coord => Math.abs(coord[0]) > 180 || Math.abs(coord[1]) > 90);
  
  let wgs84Coords = coords;
  if (isUtm) {
    console.log('🔄 Converting UTM coordinates to WGS84...');
    wgs84Coords = coords.map(coord => utmToWgs84(coord[0], coord[1]));
  }
  
  // Use reduce instead of spread to avoid call stack overflow with large datasets
  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  
  wgs84Coords.forEach(coord => {
    const [lon, lat] = coord;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });
  
  return [
    [minLon, minLat], // southwest
    [maxLon, maxLat], // northeast
  ];
}

/**
 * Calculate centroid of a geometry
 */
export function getCentroid(geometry) {
  if (!geometry) return null;
  
  if (geometry.type === 'Point') {
    return geometry.coordinates;
  }
  
  const coords = [];
  if (geometry.type === 'Polygon') {
    coords.push(...geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(poly => {
      coords.push(...poly[0]);
    });
  }
  
  if (coords.length === 0) return null;
  
  const sumLon = coords.reduce((sum, c) => sum + c[0], 0);
  const sumLat = coords.reduce((sum, c) => sum + c[1], 0);
  
  return [sumLon / coords.length, sumLat / coords.length];
}

/**
 * Simple point-in-polygon test (ray casting algorithm)
 */
export function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Find which feature contains a point
 */
export function findFeatureAtPoint(point, geojson) {
  if (!geojson || !geojson.features) return null;
  
  for (const feature of geojson.features) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    
    if (geometry.type === 'Polygon') {
      if (pointInPolygon(point, geometry.coordinates[0])) {
        return feature;
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const poly of geometry.coordinates) {
        if (pointInPolygon(point, poly[0])) {
          return feature;
        }
      }
    }
  }
  
  return null;
}

/**
 * Filter features by city
 */
export function filterByCity(geojson, cities) {
  if (!geojson || !cities || cities.length === 0) return geojson;
  
  const citySet = new Set(cities.map(c => c.toLowerCase()));
  
  return {
    ...geojson,
    features: geojson.features.filter(f => {
      const city = f.properties?.city || f.properties?.il || '';
      return citySet.has(city.toLowerCase());
    }),
  };
}

/**
 * Filter features by districts
 */
export function filterByDistricts(geojson, districts) {
  if (!geojson || !districts || districts.length === 0) return geojson;
  
  const districtSet = new Set(districts.map(d => d.toLowerCase()));
  
  return {
    ...geojson,
    features: geojson.features.filter(f => {
      const district = f.properties?.ilce_adi || f.properties?.district || '';
      return districtSet.has(district.toLowerCase());
    }),
  };
}

