/**
 * Number and text formatting utilities
 */

/**
 * Format number with appropriate precision
 */
export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  
  return value.toLocaleString('en-US', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format metric value with appropriate unit and precision
 */
export function formatMetric(metric, value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  
  switch (metric) {
    case 'risk_score':
      return formatNumber(value, 2);
    
    case 'vs30_mean':
      return `${formatNumber(value, 0)} m/s`;
    
    case 'population':
      return formatNumber(value, 0);
    
    case 'building_count':
      return formatNumber(value, 0);
    
    default:
      return formatNumber(value, 1);
  }
}

/**
 * Get display name for a metric
 */
export function getMetricLabel(metric) {
  const labels = {
    risk_score: 'Risk Score',
    vs30_mean: 'VS30 (m/s)',
    population: 'Population',
    building_count: 'Building Count',
  };
  
  return labels[metric] || metric;
}

/**
 * Get short label for metric (for axes)
 */
export function getMetricShortLabel(metric) {
  const labels = {
    risk_score: 'Risk',
    vs30_mean: 'VS30',
    population: 'Pop.',
    building_count: 'Bldgs',
  };
  
  return labels[metric] || metric;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

