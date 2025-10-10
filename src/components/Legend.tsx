/**
 * Legend component for choropleth map
 */

import { RISK_CLASS_LABELS, RISK_CLASS_COLORS } from '../utils/color';
import { formatClassLabel } from '../utils/color';

interface LegendProps {
  activeMetric: string;
  breaks: number[];
  palette: string[];
  precision?: number;
}

export default function Legend({ activeMetric, breaks, palette, precision = 0 }: LegendProps) {
  // Risk Class (1-5) - discrete
  if (activeMetric === 'risk_class') {
    return (
      <div className="legend">
        {RISK_CLASS_LABELS.map((label, idx) => (
          <div key={idx} className="legend-item">
            <div
              className="legend-swatch"
              style={{ backgroundColor: RISK_CLASS_COLORS[idx] }}
            />
            <div>
              {idx + 1} – {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Continuous variables - 5 classes
  return (
    <div className="legend">
      {breaks.map((_, idx) => (
        <div key={idx} className="legend-item">
          <div className="legend-swatch" style={{ backgroundColor: palette[idx] }} />
          <div>{formatClassLabel(idx, breaks, precision)}</div>
        </div>
      ))}
    </div>
  );
}
