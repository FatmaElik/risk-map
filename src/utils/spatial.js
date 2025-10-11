/**
 * Spatial utility functions for geometry operations
 */

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
  
  // Use reduce instead of spread to avoid call stack overflow with large datasets
  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  
  coords.forEach(coord => {
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

