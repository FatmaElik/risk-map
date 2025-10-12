import useAppStore from '../state/useAppStore';
import UiSelect from './ui/UiSelect';
import { t } from '../i18n';

const metricOptions = [
  { label: "Risk Score", value: "risk_score" },
  { label: "VS30 (m/s)", value: "vs30_mean" },
  { label: "Population", value: "population" },
  { label: "Building Count", value: "building_count" },
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
