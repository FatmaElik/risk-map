/**
 * Map highlight utilities for MapLibre GL
 */

import type { Map } from 'maplibre-gl';

/**
 * Highlight selected feature
 */
export function highlightFeature(
  map: Map | null,
  featureId: string | number | null,
  layerId: string = 'neighborhoods-fill'
): void {
  if (!map) return;

  // Update fill layer - dim non-selected features
  if (map.getLayer(layerId)) {
    if (featureId != null) {
      map.setPaintProperty(layerId, 'fill-opacity', [
        'case',
        ['==', ['get', 'mah_id'], featureId],
        0.9,
        0.3, // Dimmed
      ]);
    } else {
      // Reset opacity
      map.setPaintProperty(layerId, 'fill-opacity', 0.7);
    }
  }

  // Update outline layer - thicker border for selected
  const outlineLayerId = 'neighborhoods-outline-selected';
  if (map.getLayer(outlineLayerId)) {
    if (featureId != null) {
      map.setFilter(outlineLayerId, ['==', ['get', 'mah_id'], featureId]);
    } else {
      map.setFilter(outlineLayerId, ['==', 'mah_id', '']);
    }
  }
}

/**
 * Fly to feature bounds
 */
export function flyToFeature(
  map: Map | null,
  feature: any,
  options: { padding?: number; maxZoom?: number } = {}
): void {
  if (!map || !feature) return;

  const { padding = 50, maxZoom = 14 } = options;

  // Calculate bounds from geometry
  const geometry = feature.geometry;
  if (!geometry) return;

  let coords: number[][] = [];

  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    coords = geometry.coordinates.flat(2);
  }

  if (coords.length === 0) return;

  // Calculate bounding box
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  coords.forEach((coord) => {
    const [lng, lat] = coord;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });

  // Fly to bounds
  map.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    {
      padding,
      maxZoom,
      duration: 1000,
    }
  );
}

/**
 * Reset highlight
 */
export function resetHighlight(map: Map | null, layerId: string = 'neighborhoods-fill'): void {
  highlightFeature(map, null, layerId);
}
