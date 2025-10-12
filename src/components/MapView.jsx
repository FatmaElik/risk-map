import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useAppStore from '../state/useAppStore';
import { getBins } from '../data/bins';
import { getColorExpression, getColorRamp } from '../utils/color';
import { getBounds, ensureWGS84, mergeFC } from '../utils/spatial';
import { formatMetric, getMetricLabel } from '../utils/format';
import { MAPTILER_KEY } from '../lib/env';

/**
 * Main MapLibre map view with polygon layers, popups, and highlighting
 */
export default function MapView() {
  const mapRef = useRef(null);
  const mapDivRef = useRef(null);
  const popupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const initialFitDoneRef = useRef(false);
  
  const {
    basemapStyle,
    metric,
    geojsonData,
    districtBoundaries,
    provinceBoundaries,
    selectedNeighborhood,
    setSelectedNeighborhood,
    selectedDistricts,
    selectedCities,
  } = useAppStore();
  
  // Get basemap style URL
  const getStyleUrl = (style) => {
    if (style === 'dark') {
      return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`;
    }
    return `https://api.maptiler.com/maps/bright/style.json?key=${MAPTILER_KEY}`;
  };
  
  // Initialize map
  useEffect(() => {
    if (!mapDivRef.current) return;
    
    // Guard: Check if MAPTILER_KEY is available
    if (!MAPTILER_KEY) {
      console.error('❌ VITE_MAPTILER_KEY is missing');
      // Show visible banner
      const errorBanner = document.createElement('div');
      errorBanner.style.cssText = 'position:fixed;top:8px;left:8px;padding:10px 12px;background:#fee;border:1px solid #f99;border-radius:8px;z-index:99999;font:14px/1.4 system-ui;color:#c00;';
      errorBanner.textContent = 'Map could not load: VITE_MAPTILER_KEY is missing in Production.';
      document.body.appendChild(errorBanner);
      // Skip map creation to avoid crash
      return () => {
        document.body.removeChild(errorBanner);
      };
    }
    
    // Turkey bounds to prevent zooming outside Turkey
    const TURKEY_BOUNDS = [[25.0, 35.5], [45.0, 42.5]];
    
    const map = new maplibregl.Map({
      container: mapDivRef.current,
      style: getStyleUrl(basemapStyle),
      center: [32.5, 40.8], // Center of Turkey
      zoom: 6,
      maxBounds: TURKEY_BOUNDS,
    });
    
    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: '320px',
    });
    
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    
    map.on('load', () => {
      console.log('🗺️ Map loaded, setting up initial view');
      setMapLoaded(true);
    });
    
    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []); // Only initialize once
  
  // Handle basemap style changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    const map = mapRef.current;
    const currentData = map.getSource('neighborhoods')?._data;
    
    map.setStyle(getStyleUrl(basemapStyle));
    
    // Re-add layers after style loads
    map.once('styledata', () => {
      if (currentData) {
        addMapLayers(map, currentData);
      }
    });
  }, [basemapStyle, mapLoaded]);
  
  // Add province and district boundaries when loaded
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    
    // Add province boundaries (thick lines)
    if (provinceBoundaries && !map.getSource('provinces')) {
      map.addSource('provinces', {
        type: 'geojson',
        data: provinceBoundaries,
      });
      
      map.addLayer({
        id: 'province-line',
        type: 'line',
        source: 'provinces',
        paint: {
          'line-color': '#FF0000',
          'line-width': 5,
          'line-opacity': 1.0,
        },
      }); // Add on top
    }
    
    // Add district boundaries (medium lines)
    if (districtBoundaries && !map.getSource('districts')) {
      map.addSource('districts', {
        type: 'geojson',
        data: districtBoundaries,
      });
      
      map.addLayer({
        id: 'district-line',
        type: 'line',
        source: 'districts',
        paint: {
          'line-color': '#FF8C00',
          'line-width': 3,
          'line-opacity': 0.9,
        },
      }); // Add on top, below provinces
    }
    
    // Update district and province visibility based on selected cities
    if (map.getLayer('district-line') && districtBoundaries) {
      const districtFilter = selectedCities.length === 2 ? null : [
        'in',
        ['get', 'city'],
        ['literal', selectedCities]
      ];
      if (districtFilter) {
        map.setFilter('district-line', districtFilter);
      } else {
        map.setFilter('district-line', null);
      }
    }
    
    if (map.getLayer('province-line') && provinceBoundaries) {
      const provinceFilter = selectedCities.length === 2 ? null : [
        'in',
        ['get', 'city'],
        ['literal', selectedCities]
      ];
      if (provinceFilter) {
        map.setFilter('province-line', provinceFilter);
      } else {
        map.setFilter('province-line', null);
      }
    }
  }, [provinceBoundaries, districtBoundaries, mapLoaded, selectedCities]);
  
  // Data-driven zoom to selected cities using polygon bounds only
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !geojsonData) return;
    
    const map = mapRef.current;
    
    // Filter neighborhood features by selected cities
    const cityFeatures = geojsonData.features.filter(f => {
      const city = f.properties?.city;
      return selectedCities.includes(city);
    });
    
    console.log('🔍 City zoom debug:', {
      selectedCities,
      cityFeatures: cityFeatures.length,
      totalFeatures: geojsonData.features.length
    });
    
    if (cityFeatures.length > 0) {
      try {
        // Validate coordinates are in Turkey
        const cityFC = ensureWGS84({ type: 'FeatureCollection', features: cityFeatures });
        const cityBounds = getBounds(cityFC);
        
        if (cityBounds) {
          console.log('📍 Fitting to city bounds:', cityBounds);
          map.fitBounds(cityBounds, { padding: 48, duration: 500 });
        }
      } catch (error) {
        console.error('❌ Coordinate validation failed:', error);
        // Fallback to default Turkey view
        map.fitBounds([[25.0, 35.5], [45.0, 42.5]], { padding: 40, duration: 500 });
      }
    } else {
      // No features match filter, show toast and keep current view
      console.warn('⚠️ No features match current city filter');
    }
  }, [selectedCities, geojsonData, mapLoaded]);
  
  // Add/update map layers when data changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !geojsonData) return;
    
    const map = mapRef.current;
    
    // Filter data by selected cities and districts
    let filteredData = { ...geojsonData };
    
    if (selectedCities.length < 2) {
      filteredData = {
        ...geojsonData,
        features: geojsonData.features.filter(f => {
          const city = f.properties?.city;
          return selectedCities.includes(city);
        }),
      };
    }
    
    if (selectedDistricts.length > 0) {
      filteredData = {
        ...filteredData,
        features: filteredData.features.filter(f => {
          const district = f.properties?.ilce_adi;
          return selectedDistricts.includes(district);
        }),
      };
    }
    
    // Add or update layers
    if (map.getSource('neighborhoods')) {
      map.getSource('neighborhoods').setData(filteredData);
    } else {
      addMapLayers(map, filteredData);
    }
    
    // Fit bounds to data (only on initial load)
    if (!initialFitDoneRef.current && filteredData.features.length > 0) {
      try {
        const validatedData = ensureWGS84(filteredData);
        const bounds = getBounds(validatedData);
        if (bounds) {
          console.log('📍 Initial fit bounds to Turkey data:', bounds);
          map.fitBounds(bounds, { padding: 40, duration: 0 });
          initialFitDoneRef.current = true;
        }
      } catch (error) {
        console.error('❌ Initial bounds calculation failed:', error);
        // Fallback to Turkey bounds
        map.fitBounds([[25.0, 35.5], [45.0, 42.5]], { padding: 40, duration: 0 });
        initialFitDoneRef.current = true;
      }
    }
  }, [geojsonData, mapLoaded, selectedCities, selectedDistricts]);
  
  // Update colors when metric changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !geojsonData || !metric) return;
    
    updateChoropleth(mapRef.current, metric, geojsonData);
  }, [metric, geojsonData, mapLoaded]);
  
  // Handle selection highlighting
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    const map = mapRef.current;
    
    if (map.getLayer('neighborhood-highlight')) {
      if (selectedNeighborhood) {
        // Filter to show only selected neighborhood
        map.setFilter('neighborhood-highlight', [
          '==',
          ['get', 'mah_id'],
          selectedNeighborhood.mah_id || '',
        ]);
      } else {
        // Hide highlight
        map.setFilter('neighborhood-highlight', ['==', ['get', 'mah_id'], '']);
      }
    }
  }, [selectedNeighborhood, mapLoaded]);
  
  // Add map layers
  const addMapLayers = (map, data) => {
    // Add source
    if (!map.getSource('neighborhoods')) {
      map.addSource('neighborhoods', {
        type: 'geojson',
        data,
      });
    }
    
    // Add fill layer
    if (!map.getLayer('neighborhood-fill')) {
      map.addLayer({
        id: 'neighborhood-fill',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': '#CCCCCC',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.7,
            0.55,
          ],
        },
      });
    }
    
    // Add line layer
    if (!map.getLayer('neighborhood-line')) {
      map.addLayer({
        id: 'neighborhood-line',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#333',
          'line-width': 0.6,
        },
      });
    }
    
    // Add highlight layer
    if (!map.getLayer('neighborhood-highlight')) {
      map.addLayer({
        id: 'neighborhood-highlight',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 4,
          'line-opacity': 1,
        },
        filter: ['==', ['get', 'mah_id'], ''],
      });
    }
    
    // Update choropleth
    updateChoropleth(map, metric, geojsonData);
    
    // Add interaction handlers
    setupInteractions(map);
  };
  
  // Update choropleth colors
  const updateChoropleth = (map, metric, data) => {
    if (!map.getLayer('neighborhood-fill') || !data) return;
    
    // Calculate bins
    const values = data.features
      .map(f => f.properties?.[metric])
      .filter(v => Number.isFinite(v));
    
    if (values.length === 0) return;
    
    const bins = getBins(values);
    const colors = getColorRamp(metric);
    const colorExpression = getColorExpression(metric, bins, colors);
    
    map.setPaintProperty('neighborhood-fill', 'fill-color', colorExpression);
  };
  
  // Setup click/hover interactions
  const setupInteractions = (map) => {
    let hoveredId = null;
    
    // Click handler
    map.on('click', 'neighborhood-fill', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      
      const props = feature.properties || {};
      
      const neighborhood = props.mahalle_adi || props.neighborhood || 'Unknown';
      const district = props.ilce_adi || props.district || '—';
      const city = props.city || '—';
      const population = props.toplam_nufus || props.population;
      const buildingCount = props.toplam_bina || props.building_count;
      const riskScore = props.risk_score;
      const vs30 = props.vs30_mean || props.vs30;
      
      const html = `
        <div style="font-family: system-ui, sans-serif; font-size: 13px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #1F2937;">
            ${neighborhood}
          </div>
          <div style="color: #6B7280; font-size: 11px; margin-bottom: 10px;">
            ${district} • ${city}
          </div>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; font-size: 12px;">
            <span style="color: #6B7280;">Population:</span>
            <span style="font-weight: 600; color: #374151;">${formatMetric('population', population)}</span>
            
            <span style="color: #6B7280;">Buildings:</span>
            <span style="font-weight: 600; color: #374151;">${formatMetric('building_count', buildingCount)}</span>
            
            <span style="color: #6B7280;">Risk Score:</span>
            <span style="font-weight: 600; color: #374151;">${formatMetric('risk_score', riskScore)}</span>
            
            <span style="color: #6B7280;">VS30:</span>
            <span style="font-weight: 600; color: #374151;">${formatMetric('vs30_mean', vs30)}</span>
          </div>
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button
              onclick="window.selectNeighborhood('${props.mah_id}')"
              style="flex: 1; padding: 6px 12px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;"
            >
              Select
            </button>
            <button
              onclick="window.zoomToNeighborhood('${props.mah_id}')"
              style="flex: 1; padding: 6px 12px; background: #E5E7EB; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;"
            >
              Zoom
            </button>
          </div>
        </div>
      `;
      
      popupRef.current
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
    });
    
    // Hover handlers
    map.on('mouseenter', 'neighborhood-fill', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      
      if (e.features.length > 0) {
        if (hoveredId !== null) {
          map.setFeatureState(
            { source: 'neighborhoods', id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = e.features[0].id;
        map.setFeatureState(
          { source: 'neighborhoods', id: hoveredId },
          { hover: true }
        );
      }
    });
    
    map.on('mouseleave', 'neighborhood-fill', () => {
      map.getCanvas().style.cursor = '';
      
      if (hoveredId !== null) {
        map.setFeatureState(
          { source: 'neighborhoods', id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = null;
    });
  };
  
  // Expose selection/zoom functions to window for popup buttons
  useEffect(() => {
    window.selectNeighborhood = (mahId) => {
      if (!geojsonData) return;
      const feature = geojsonData.features.find(f => String(f.properties?.mah_id) === String(mahId));
      if (feature) {
        setSelectedNeighborhood(feature.properties);
      }
    };
    
    window.zoomToNeighborhood = (mahId) => {
      if (!geojsonData || !mapRef.current) return;
      const feature = geojsonData.features.find(f => String(f.properties?.mah_id) === String(mahId));
      if (feature) {
        const bounds = getBounds({ type: 'Feature', geometry: feature.geometry });
        if (bounds) {
          mapRef.current.fitBounds(bounds, { padding: 100, duration: 600 });
        }
      }
    };
    
    return () => {
      delete window.selectNeighborhood;
      delete window.zoomToNeighborhood;
    };
  }, [geojsonData, setSelectedNeighborhood]);
  
  return (
    <div 
      ref={mapDivRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
      }} 
    />
  );
}

