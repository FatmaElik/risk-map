import { quantile } from 'd3-array';

/**
 * Calculate 5-class bins using quantile method
 * Returns 6 values: [min, q20, q40, q60, q80, max]
 */
export function getBins(values) {
  const validValues = values.filter(v => Number.isFinite(v) && v !== null);
  
  if (validValues.length === 0) {
    return [0, 0.2, 0.4, 0.6, 0.8, 1];
  }
  
  const sorted = validValues.sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  // If too few unique values, use equal interval
  const uniqueValues = [...new Set(sorted)];
  if (uniqueValues.length <= 10) {
    const range = max - min;
    return [
      min,
      min + range * 0.2,
      min + range * 0.4,
      min + range * 0.6,
      min + range * 0.8,
      max,
    ];
  }
  
  // Use quantiles for 5 classes
  return [
    min,
    quantile(sorted, 0.2),
    quantile(sorted, 0.4),
    quantile(sorted, 0.6),
    quantile(sorted, 0.8),
    max,
  ];
}

/**
 * Generate legend items from bins
 * @param {number[]} bins - Array of 6 bin thresholds
 * @param {function} formatter - Function to format numbers
 * @returns {Array<{range: string, color: string, min: number, max: number}>}
 */
export function getLegend(bins, formatter = (v) => v.toFixed(1)) {
  const items = [];
  
  for (let i = 0; i < bins.length - 1; i++) {
    items.push({
      range: `${formatter(bins[i])} – ${formatter(bins[i + 1])}`,
      min: bins[i],
      max: bins[i + 1],
      classIndex: i + 1, // 1-5
    });
  }
  
  return items;
}

/**
 * Get color for a value based on bins and color ramp
 */
export function getColorForValue(value, bins, colors) {
  if (!Number.isFinite(value)) return '#BBBBBB';
  
  for (let i = 0; i < bins.length - 1; i++) {
    if (value >= bins[i] && value <= bins[i + 1]) {
      return colors[i];
    }
  }
  
  // Fallback to last color if value exceeds max
  return colors[colors.length - 1];
}

/**
 * Calculate bin index for a value (1-5, or 0 for no data)
 */
export function getBinIndex(value, bins) {
  if (!Number.isFinite(value)) return 0;
  
  for (let i = 0; i < bins.length - 1; i++) {
    if (value >= bins[i] && value <= bins[i + 1]) {
      return i + 1;
    }
  }
  
  return bins.length - 1;
}

