/**
 * Main Dashboard component
 */

import { useState, useEffect, useMemo } from 'react';
import Map from './Map';
import Legend from './Legend';
import Popup from './Popup';
import Controls from './Controls';
import { loadCityData, Feature } from '../utils/dataJoin';
import { chooseBreaks } from '../utils/classify';
import { PALETTE_5, RISK_CLASS_COLORS, valueToClassIndex, formatClassLabel } from '../utils/color';
import { buildCsvFromFeatures, downloadCSV } from '../utils/exportCsv';

export default function Dashboard() {
  const [city, setCity] = useState<'istanbul' | 'ankara'>('istanbul');
  const [istanbulData, setIstanbulData] = useState<Feature[]>([]);
  const [ankaraData, setAnkaraData] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('risk_class');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const [istanbul, ankara] = await Promise.all([
        loadCityData(
          'istanbul',
          '/data/istanbul_mahalle_risk.geojson',
          '/data/istanbul_risk_data.csv'
        ),
        loadCityData(
          'ankara',
          '/data/ankara_mahalle_risk.geojson',
          '/data/ankara_risk_data.csv'
        ),
      ]);

      setIstanbulData(istanbul.features);
      setAnkaraData(ankara.features);
      setLoading(false);
    };

    loadData();
  }, []);

  // Current city data
  const currentData = city === 'istanbul' ? istanbulData : ankaraData;

  // Compute breaks and palette based on active metric and city
  const { breaks, palette, precision } = useMemo(() => {
    if (activeMetric === 'risk_class') {
      // Fixed 5 classes for risk_class
      return {
        breaks: [1, 2, 3, 4, 5],
        palette: RISK_CLASS_COLORS,
        precision: 0,
      };
    }

    // Continuous variables - compute breaks from current city data
    const values = currentData
      .map((f) => f.properties[activeMetric])
      .filter((v) => v != null && Number.isFinite(v)) as number[];

    if (values.length < 5) {
      return { breaks: [], palette: PALETTE_5, precision: 2 };
    }

    const classBreaks = chooseBreaks(values, 5);

    // Determine precision based on metric
    let prec = 0;
    if (activeMetric === 'scenario_7_5') prec = 4;
    else if (activeMetric === 'vs30') prec = 0;
    else prec = 2;

    return {
      breaks: classBreaks,
      palette: PALETTE_5,
      precision: prec,
    };
  }, [activeMetric, currentData]);

  // Get class label for selected feature
  const selectedClassLabel = useMemo(() => {
    if (!selectedFeature) return '';

    if (activeMetric === 'risk_class') {
      const rc = selectedFeature.properties.risk_class;
      if (rc != null && rc >= 1 && rc <= 5) {
        return `${rc} – ${['Very Low', 'Low', 'Medium', 'High', 'Very High'][rc - 1]}`;
      }
      return 'No Data';
    }

    const value = selectedFeature.properties[activeMetric];
    if (value == null || !Number.isFinite(value)) {
      return 'No Data';
    }

    const classIdx = valueToClassIndex(value, breaks);
    if (classIdx === -1) return 'No Data';

    return formatClassLabel(classIdx, breaks, precision);
  }, [selectedFeature, activeMetric, breaks, precision]);

  // Handle CSV export
  const handleExportCSV = () => {
    const classLabels = breaks.map((_, idx) => formatClassLabel(idx, breaks, precision));

    const csvContent = buildCsvFromFeatures(currentData, {
      activeMetric,
      breaks,
      classLabels,
    });

    const filename = `${city}_neighborhoods_${activeMetric}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  // Handle feature click
  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
  };

  // Handle city change
  const handleCityChange = (newCity: string) => {
    setCity(newCity as 'istanbul' | 'ankara');
    setSelectedFeature(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <div>Loading data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h1 className="dashboard-title">Risk Map Dashboard</h1>

        <Controls
          city={city}
          onCityChange={handleCityChange}
          activeMetric={activeMetric}
          onMetricChange={setActiveMetric}
          onExportCSV={handleExportCSV}
        />

        <div className="legend-section">
          <h3>Legend</h3>
          <Legend
            activeMetric={activeMetric}
            breaks={breaks}
            palette={palette}
            precision={precision}
          />
        </div>

        <div className="stats-section">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{currentData.length}</div>
              <div className="stat-label">Neighborhoods</div>
            </div>
          </div>
        </div>
      </div>

      <div className="map-container">
        <Map
          data={currentData}
          activeMetric={activeMetric}
          breaks={breaks}
          palette={palette}
          onFeatureClick={handleFeatureClick}
          selectedFeatureId={selectedFeature?.properties.mah_id || null}
        />
      </div>

      {selectedFeature && (
        <Popup
          feature={selectedFeature}
          activeMetric={activeMetric}
          classLabel={selectedClassLabel}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  );
}
