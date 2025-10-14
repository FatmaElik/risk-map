/**
 * MapLibre GL choropleth map component
 */

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getColorForValue, getRiskClassColor, NO_DATA_COLOR } from '../utils/color';
import { highlightFeature, flyToFeature } from '../utils/highlight';
import type { Feature } from '../utils/dataJoin';

interface MapProps {
  data: Feature[];
  activeMetric: string;
  breaks: number[];
  palette: string[];
  onFeatureClick: (feature: Feature) => void;
  selectedFeatureId: string | null;
}

export default function Map({
  data,
  activeMetric,
  breaks,
  palette,
  onFeatureClick,
  selectedFeatureId,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [35.0, 39.0],
      zoom: 6,
    });

    map.on('load', () => {
      setIsMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update data source
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || !data) return;

    const geojson: any = {
      type: 'FeatureCollection',
      features: data.map((f) => ({
        ...f,
        id: f.properties.mah_id,
      })),
    };

    if (map.getSource('neighborhoods')) {
      (map.getSource('neighborhoods') as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource('neighborhoods', {
        type: 'geojson',
        data: geojson,
      });
    }

    // Add layers if not exists
    if (!map.getLayer('neighborhoods-fill')) {
      map.addLayer({
        id: 'neighborhoods-fill',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': '#cccccc',
          'fill-opacity': 0.7,
        },
      });
    }

    if (!map.getLayer('neighborhoods-outline')) {
      map.addLayer({
        id: 'neighborhoods-outline',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#555',
          'line-width': 1,
        },
      });
    }

    if (!map.getLayer('neighborhoods-outline-selected')) {
      map.addLayer({
        id: 'neighborhoods-outline-selected',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#000',
          'line-width': 3,
        },
        filter: ['==', 'mah_id', ''],
      });
    }

    // Fit bounds
    if (data.length > 0) {
      const coords: number[][] = [];

      data.forEach((feature) => {
        const geometry = feature.geometry;
        if (geometry.type === 'Polygon') {
          coords.push(...geometry.coordinates[0]);
        } else if (geometry.type === 'MultiPolygon') {
          geometry.coordinates.forEach((poly: number[][][]) => {
            coords.push(...poly[0]);
          });
        }
      });

      if (coords.length > 0) {
        let minLng = Infinity,
          maxLng = -Infinity,
          minLat = Infinity,
          maxLat = -Infinity;

        coords.forEach(([lng, lat]) => {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        });

        map.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 30 }
        );
      }
    }
  }, [data, isMapLoaded]);

  // Update colors
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || !data) return;

    const colorExpression: any[] = ['case'];

    data.forEach((feature) => {
      const props = feature.properties;
      const mahId = props.mah_id;

      let color = NO_DATA_COLOR;

      if (activeMetric === 'risk_class') {
        color = getRiskClassColor(props.risk_class);
      } else {
        const value = props[activeMetric];
        color = getColorForValue(value, breaks, palette);
      }

      colorExpression.push(['==', ['get', 'mah_id'], mahId], color);
    });

    colorExpression.push(NO_DATA_COLOR);

    if (map.getLayer('neighborhoods-fill')) {
      map.setPaintProperty('neighborhoods-fill', 'fill-color', colorExpression);
    }
  }, [data, activeMetric, breaks, palette, isMapLoaded]);

  // Handle click events
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['neighborhoods-fill'],
      });

      if (features.length > 0) {
        const feature = features[0];
        const mahId = feature.properties?.mah_id;

        // Find full feature data
        const fullFeature = data.find((f) => f.properties.mah_id === mahId);

        if (fullFeature) {
          onFeatureClick(fullFeature);
        }
      }
    };

    map.on('click', 'neighborhoods-fill', handleClick);

    // Cursor
    map.on('mouseenter', 'neighborhoods-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'neighborhoods-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.off('click', 'neighborhoods-fill', handleClick);
    };
  }, [data, isMapLoaded, onFeatureClick]);

  // Handle selection highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    highlightFeature(map, selectedFeatureId);

    // Fly to selected feature
    if (selectedFeatureId) {
      const feature = data.find((f) => f.properties.mah_id === selectedFeatureId);
      if (feature) {
        flyToFeature(map, feature);
      }
    }
  }, [selectedFeatureId, isMapLoaded, data]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}
