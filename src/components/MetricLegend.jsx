import { useMemo } from 'react';
import { getBins, getLegend } from '../data/bins';
import { getColorRamp } from '../utils/color';
import { formatNumber, getMetricLabel } from '../utils/format';
import useAppStore from '../state/useAppStore';
import { RISK_BINS, RISK_COLORS, RISK_LABELS_TR, RISK_LABELS_EN } from '../lib/riskScale';
import { t } from '../i18n';

/**
 * 5-class legend for the current choropleth metric
 */
export default function MetricLegend() {
  const { choroplethMetric, geojsonData, locale } = useAppStore();
  
  // Use centralized risk scale for risk_score, fallback to dynamic for other metrics
  const { bins, colors, legend, metric } = useMemo(() => {
    const metric = choroplethMetric || 'risk_score';
    
    // For risk_score, use centralized scale
    if (metric === 'risk_score') {
      const labels = locale === 'tr' ? RISK_LABELS_TR : RISK_LABELS_EN;
      const legend = RISK_COLORS.map((color, i) => ({
        range: `${RISK_BINS[i].toFixed(2)} – ${RISK_BINS[i+1].toFixed(2)} · ${labels[i]}`,
        color
      }));
      return { bins: RISK_BINS, colors: RISK_COLORS, legend, metric };
    }
    
    // For other metrics, use dynamic calculation
    if (!geojsonData || !geojsonData.features) {
      return { bins: [0, 0.2, 0.4, 0.6, 0.8, 1], colors: [], legend: [], metric };
    }
    
    // Extract values for current metric
    const values = geojsonData.features
      .map(f => f.properties?.[metric])
      .filter(v => Number.isFinite(v));
    
    if (values.length === 0) {
      return { bins: [0, 0.2, 0.4, 0.6, 0.8, 1], colors: [], legend: [], metric };
    }
    
    const bins = getBins(values);
    const colors = getColorRamp(metric);
    
    // Determine precision based on value range
    const range = bins[bins.length - 1] - bins[0];
    const decimals = range < 10 ? 2 : range < 100 ? 1 : 0;
    
    const legend = getLegend(bins, (v) => formatNumber(v, decimals));
    
    return { bins, colors, legend, metric };
  }, [geojsonData, choroplethMetric, locale]);
  
  if (legend.length === 0) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 32,
        right: 16,
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12,
        minWidth: 180,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 10, color: '#374151' }}>
        {getMetricLabel(metric)}
      </div>
      
      {legend.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 24,
              height: 16,
              borderRadius: 4,
              background: item.color || colors[idx],
              border: '1px solid rgba(0, 0, 0, 0.1)',
              flexShrink: 0,
            }}
          />
          <div style={{ color: '#6B7280', fontSize: 11 }}>
            {item.range}
          </div>
        </div>
      ))}
      
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <div
          style={{
            width: 24,
            height: 16,
            borderRadius: 4,
            background: '#BBBBBB',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            flexShrink: 0,
          }}
        />
        <div style={{ color: '#6B7280', fontSize: 11 }}>
          No data
        </div>
      </div>
    </div>
  );
}

