import useAppStore from '../state/useAppStore';
import UiSelect from './ui/UiSelect';

const metricOptions = [
  { label: "Risk Score", value: "risk_score" },
  { label: "VS30 (m/s)", value: "vs30_mean" },
  { label: "Population", value: "population" },
  { label: "Building Count", value: "building_count" },
];

/**
 * Metric selector with dark themed dropdown
 */
export default function MetricSelect() {
  const metric = useAppStore((s) => s.metric);
  const setMetric = useAppStore((s) => s.setMetric);

  return (
    <div className="space-y-2">
      <UiSelect
        options={metricOptions}
        value={metric}
        onChange={setMetric}
        aria-label="Metric"
      />
    </div>
  );
}
