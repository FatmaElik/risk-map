import useAppStore from '../state/useAppStore';
import UiSelect from './ui/UiSelect';
import { t } from '../i18n';

const getMetricOptions = () => [
  { label: t('risk_score'), value: "risk_score" },
  { label: t('vs30'), value: "vs30_mean" },
  { label: t('population'), value: "toplam_nufus" },
  { label: t('building_count'), value: "toplam_bina" },
  { label: t('pga_scenario_mw72'), value: "pga_scenario_mw72" },
  { label: t('pga_scenario_mw75'), value: "pga_scenario_mw75" },
  { label: t('ml_risk_score'), value: "ml_risk_score" },
  { label: t('ml_predicted_class'), value: "ml_predicted_class" },
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
        options={getMetricOptions()}
        value={choroplethMetric}
        onChange={setChoroplethMetric}
        aria-label={t('metric')}
      />
    </div>
  );
}
