/**
 * Color ramps for different metrics (5 classes each)
 * Light → Dark progression for better visual hierarchy
 */

export const COLOR_RAMPS = {
  risk_score: [
    '#FEF3C7', // pale yellow
    '#FCD34D', // amber
    '#F59E0B', // orange
    '#EF4444', // red
    '#991B1B', // dark red
  ],

  vs30_mean: [
    '#DBEAFE', // pale blue
    '#93C5FD', // light blue
    '#3B82F6', // blue
    '#1D4ED8', // dark blue
    '#1E3A8A', // very dark blue
  ],

  population: [
    '#CCFBF1', // pale teal
    '#5EEAD4', // light teal
    '#14B8A6', // teal
    '#0F766E', // dark teal
    '#134E4A', // very dark teal
  ],

  toplam_nufus: [
    '#CCFBF1', // pale teal
    '#5EEAD4', // light teal
    '#14B8A6', // teal
    '#0F766E', // dark teal
    '#134E4A', // very dark teal
  ],

  building_count: [
    '#E9D5FF', // pale purple
    '#C084FC', // light purple
    '#9333EA', // purple
    '#7E22CE', // dark purple
    '#581C87', // very dark purple
  ],

  toplam_bina: [
    '#E9D5FF', // pale purple
    '#C084FC', // light purple
    '#9333EA', // purple
    '#7E22CE', // dark purple
    '#581C87', // very dark purple
  ],

  pga_scenario_mw72: [
    '#FEF3C7', // pale yellow
    '#FCD34D', // amber
    '#F59E0B', // orange
    '#EF4444', // red
    '#991B1B', // dark red
  ],

  pga_scenario_mw75: [
    '#FEF3C7', // pale yellow
    '#FCD34D', // amber
    '#F59E0B', // orange
    '#DC2626', // red
    '#7F1D1D', // very dark red
  ],

  ml_risk_score: [
    '#D1FAE5', // pale green
    '#A7F3D0', // light green
    '#FCD34D', // amber
    '#F59E0B', // orange
    '#DC2626', // red
  ],

  ml_predicted_class: [
    '#10B981', // green (class 1 - low risk)
    '#FBBF24', // yellow (class 2)
    '#F59E0B', // orange (class 3)
    '#EF4444', // red (class 4)
    '#991B1B', // dark red (class 5 - high risk)
  ],
};

/**
 * Get color ramp for a metric
 */
export function getColorRamp(metric) {
  return COLOR_RAMPS[metric] || COLOR_RAMPS.risk_score;
}

/**
 * Get MapLibre expression for interpolated color
 * @param {string} metric - The property name to color by
 * @param {number[]} bins - Array of 6 bin thresholds
 * @param {string[]} colors - Array of 5 colors
 */
export function getColorExpression(metric, bins, colors) {
  return [
    'case',
    // No data case
    ['!', ['to-boolean', ['get', metric]]],
    '#BBBBBB',
    // Interpolate between bins
    [
      'step',
      ['to-number', ['get', metric], 0],
      colors[0],
      bins[1], colors[1],
      bins[2], colors[2],
      bins[3], colors[3],
      bins[4], colors[4],
    ],
  ];
}

/**
 * Get color for a single value
 */
export function getColor(value, bins, colors) {
  if (!Number.isFinite(value)) return '#BBBBBB';
  
  for (let i = 0; i < bins.length - 1; i++) {
    if (value <= bins[i + 1]) {
      return colors[i];
    }
  }
  
  return colors[colors.length - 1];
}

/**
 * Generate CSS gradient string from color ramp
 */
export function getGradientCSS(colors, direction = 'to right') {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
}

