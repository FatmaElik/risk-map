import useAppStore from '../state/useAppStore';
import UiSelect from './ui/UiSelect';
import { t } from '../i18n';

const metricOptions = [
  { label: "Risk Score", value: "risk_score" },
  { label: "VS30 (m/s)", value: "vs30_mean" },
  { label: "Population", value: "toplam_nufus" },
  { label: "Building Count", value: "toplam_bina" },
  { label: "PGA Scenario MW 7.2", value: "pga_scenario_mw72" },
  { label: "PGA Scenario MW 7.5", value: "pga_scenario_mw75" },
  { label: "ML Risk Score", value: "ml_risk_score" },
  { label: "ML Predicted Class", value: "ml_predicted_class" },
];

/**
 * Choropleth metric selector (map coloring) - does NOT affect scatter shapes
 */
export default function MetricSelect() {
  const choroplethMetric = useAppStore((s) => s.choroplethMetric || 'risk_score');
  const setChoroplethMetric = useAppStore((s) => s.setChoroplethMetric);

  return (
    <div className="space-y-2">
      <UiSelect
        options={metricOptions}
        value={choroplethMetric}
        onChange={setChoroplethMetric}
        aria-label={t('metric')}
      />
    </div>
  );
}
