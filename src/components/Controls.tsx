/**
 * Control panel component
 */

interface ControlsProps {
  city: string;
  onCityChange: (city: string) => void;
  activeMetric: string;
  onMetricChange: (metric: string) => void;
  onExportCSV: () => void;
}

const METRICS = [
  { value: 'risk_class', label: 'Risk Class (1–5)' },
  { value: 'vs30', label: 'VS30' },
  { value: 'scenario_7_5', label: '7.5 Scenario' },
  { value: 'total_population', label: 'Total Population' },
  { value: 'total_buildings', label: 'Total Buildings' },
];

export default function Controls({
  city,
  onCityChange,
  activeMetric,
  onMetricChange,
  onExportCSV,
}: ControlsProps) {
  return (
    <div className="controls-panel">
      <div className="controls-section">
        <h3>City Selection</h3>
        <div className="button-group">
          <button
            className={`btn ${city === 'istanbul' ? 'active' : ''}`}
            onClick={() => onCityChange('istanbul')}
          >
            Istanbul
          </button>
          <button
            className={`btn ${city === 'ankara' ? 'active' : ''}`}
            onClick={() => onCityChange('ankara')}
          >
            Ankara
          </button>
        </div>
      </div>

      <div className="controls-section">
        <h3>Visualization Variable</h3>
        <select
          className="select-input"
          value={activeMetric}
          onChange={(e) => onMetricChange(e.target.value)}
        >
          {METRICS.map((metric) => (
            <option key={metric.value} value={metric.value}>
              {metric.label}
            </option>
          ))}
        </select>
      </div>

      <div className="controls-section">
        <button className="btn btn-export" onClick={onExportCSV}>
          Download CSV
        </button>
      </div>
    </div>
  );
}
