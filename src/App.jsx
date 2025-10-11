import { useEffect } from 'react';
import useAppStore from './state/useAppStore';
import { loadGeoJSONs, loadCSV, joinCsvToGeojson } from './data/loadData';
import MapView from './components/MapView';
import BasemapToggle from './components/BasemapToggle';
import YearSelect from './components/YearSelect';
import MetricLegend from './components/MetricLegend';
import CityDistrictControls from './components/CityDistrictControls';
import ScatterPanel from './components/ScatterPanel';
import './App.css';

/**
 * Main application component
 * Orchestrates data loading and component composition
 */
export default function App() {
  const {
    selectedYear,
    setGeojsonData,
    setCsvData,
    setIsLoadingData,
    setAvailableDistricts,
    metric,
    setMetric,
    geojsonData,
  } = useAppStore();
  
  // Welcome message
  useEffect(() => {
    console.log('%c🗺️ Risk Map Application', 'font-size: 20px; font-weight: bold; color: #3B82F6;');
    console.log('MapTiler Key:', import.meta.env.VITE_MAPTILER_KEY ? '✅ Set' : '❌ Missing');
  }, []);
  
  // Load data when year changes
  useEffect(() => {
    let isCancelled = false;
    
    async function loadData() {
      console.log('🔄 Loading data for year:', selectedYear);
      setIsLoadingData(true);
      
      try {
        // Load GeoJSON boundaries (neighborhoods, districts, provinces)
        const neighborhoodPaths = [
          '/data/boundaries/ankara_neighborhoods.geojson',
          '/data/boundaries/istanbul_neighborhoods.geojson',
        ];
        
        const districtPaths = [
          '/data/boundaries/ankara_districts.geojson',
          '/data/boundaries/istanbul_districts.geojson',
        ];
        
        const provincePaths = [
          '/data/boundaries/ankara_province.geojson',
          '/data/boundaries/istanbul_province_polygon.geojson',
        ];
        
        // Load all boundary types
        const [neighborhoods, districtBoundaries, provinceBoundaries] = await Promise.all([
          loadGeoJSONs(neighborhoodPaths),
          loadGeoJSONs(districtPaths),
          loadGeoJSONs(provincePaths),
        ]);
        
        // Fallback to old paths if new structure doesn't exist
        let geojson = neighborhoods;
        if (!geojson || geojson.features.length === 0) {
          geojson = await loadGeoJSONs([
            '/data/ankara_mahalle_risk.geojson',
            '/data/istanbul_mahalle_risk.geojson',
          ]);
        }
        
        // Load CSV data for selected year
        const csvPath = `/data/risk/${selectedYear}.csv`;
        const csv = await loadCSV(csvPath);
        
        if (isCancelled) return;
        
        // Join CSV data with GeoJSON
        const joined = joinCsvToGeojson(geojson, csv);
        
        // Extract unique districts for filter
        const districts = new Map();
        joined?.features?.forEach(feature => {
          const district = feature.properties?.ilce_adi;
          const city = feature.properties?.city;
          if (district && city) {
            districts.set(district, { name: district, city });
          }
        });
        
        const sortedDistricts = Array.from(districts.values()).sort((a, b) => 
          a.name.localeCompare(b.name, 'tr')
        );
        
        setGeojsonData(joined);
        setCsvData(csv);
        setAvailableDistricts(sortedDistricts);
        
        // Store boundary layers in store
        useAppStore.setState({ 
          districtBoundaries,
          provinceBoundaries,
        });
        
        console.log('✅ Data loaded successfully:', {
          features: joined?.features?.length || 0,
          csvRows: csv?.length || 0,
          districts: sortedDistricts.length,
        });
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setIsLoadingData(false);
      }
    }
    
    loadData();

    return () => {
      isCancelled = true;
    };
  }, [selectedYear, setGeojsonData, setCsvData, setIsLoadingData, setAvailableDistricts]);

  const metrics = ['risk_score', 'vs30_mean', 'population', 'building_count'];

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Map View */}
      <MapView />
      
      {/* Basemap Toggle (top right) */}
      <BasemapToggle />
      
      {/* Year Selector (below basemap toggle) */}
      <YearSelect />
      
      {/* Metric Selector (below year) */}
      <div
        style={{
          position: 'absolute',
          top: 176,
          right: 16,
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          borderRadius: 12,
          padding: '10px 14px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          Metric
        </div>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            border: '1px solid #D1D5DB',
            borderRadius: 8,
          fontSize: 12,
            fontFamily: 'inherit',
            cursor: 'pointer',
            background: 'white',
          }}
        >
          <option value="risk_score">Risk Score</option>
          <option value="vs30_mean">VS30 (m/s)</option>
          <option value="population">Population</option>
          <option value="building_count">Building Count</option>
        </select>
      </div>
      
      {/* City & District Controls (top left) */}
      <CityDistrictControls />
      
      {/* Legend (bottom right) */}
      <MetricLegend />
      
      {/* Scatter Panel (bottom left) */}
      <ScatterPanel />
      
      {/* Loading Overlay */}
      <LoadingOverlay />
    </div>
  );
}

/**
 * Loading overlay component
 */
function LoadingOverlay() {
  const { isLoadingData } = useAppStore();
  
  if (!isLoadingData) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '20px 32px',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            border: '3px solid #E5E7EB',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div style={{ fontSize: 14, color: '#374151' }}>
          Loading data...
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
