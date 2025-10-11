/**
 * Popup component for neighborhood details
 */

import { getRiskClassColor, RISK_CLASS_LABELS } from '../utils/color';
import type { Feature } from '../utils/dataJoin';

interface PopupProps {
  feature: Feature | null;
  activeMetric: string;
  classLabel: string;
  onClose: () => void;
}

export default function Popup({ feature, activeMetric, classLabel, onClose }: PopupProps) {
  if (!feature) return null;

  const props = feature.properties;

  const neighborhood = props.mahalle || 'N/A';
  const district = props.ilce || 'N/A';
  const riskClass = props.risk_class;
  const population = props.total_population;
  const buildings = props.total_buildings;

  const activeValue = props[activeMetric];

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          ×
        </button>

        <div className="popup-header">
          <h3>{neighborhood}</h3>
        </div>

        <div className="popup-body">
          <div className="popup-field">
            <span className="popup-label">District:</span>
            <span className="popup-value">{district}</span>
          </div>

          {riskClass != null && (
            <div
              className="popup-field popup-risk"
              style={{ backgroundColor: getRiskClassColor(riskClass) }}
            >
              <span className="popup-label">Risk Class:</span>
              <span className="popup-value">
                {riskClass} – {RISK_CLASS_LABELS[riskClass - 1] || ''}
              </span>
            </div>
          )}

          {population != null && (
            <div className="popup-field">
              <span className="popup-label">Population:</span>
              <span className="popup-value">{population.toLocaleString()}</span>
            </div>
          )}

          {buildings != null && (
            <div className="popup-field">
              <span className="popup-label">Buildings:</span>
              <span className="popup-value">{buildings.toLocaleString()}</span>
            </div>
          )}

          <div className="popup-divider" />

          <div className="popup-field">
            <span className="popup-label">Active Variable:</span>
            <span className="popup-value">
              {activeValue != null && Number.isFinite(activeValue)
                ? activeValue.toFixed(2)
                : 'No Data'}
            </span>
          </div>

          {classLabel && (
            <div className="popup-field">
              <span className="popup-label">Class:</span>
              <span className="popup-value">{classLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
