/**
 * Color utilities for choropleth mapping
 */

// 5-class sequential palette (light → dark)
export const PALETTE_5 = [
  '#feedde', // Very Light
  '#fdbe85', // Light
  '#fd8d3c', // Medium
  '#e6550d', // Dark
  '#a63603', // Very Dark
];

// Risk class colors (1-5, reversed for visual clarity)
export const RISK_CLASS_COLORS = [
  '#2ECC71', // 1 - Very Low (green)
  '#A3D977', // 2 - Low (light green)
  '#F1C40F', // 3 - Medium (yellow)
  '#E67E22', // 4 - High (orange)
  '#E74C3C', // 5 - Very High (red)
];

// Gray for missing data
export const NO_DATA_COLOR = '#cccccc';

/**
 * Map a value to a class index (0-4) based on breaks
 */
export function valueToClassIndex(value: number, breaks: number[]): number {
  if (!Number.isFinite(value) || !breaks || breaks.length === 0) {
    return -1; // No data
  }

  for (let i = 0; i < breaks.length; i++) {
    if (value <= breaks[i]) {
      return i;
    }
  }

  return breaks.length - 1;
}

/**
 * Get color for a value based on breaks and palette
 */
export function getColorForValue(
  value: number | null | undefined,
  breaks: number[],
  palette: string[] = PALETTE_5
): string {
  if (value == null || !Number.isFinite(value)) {
    return NO_DATA_COLOR;
  }

  const idx = valueToClassIndex(value, breaks);

  if (idx === -1) {
    return NO_DATA_COLOR;
  }

  return palette[idx] || NO_DATA_COLOR;
}

/**
 * Get color for risk class (1-5)
 */
export function getRiskClassColor(riskClass: number | null | undefined): string {
  if (riskClass == null || !Number.isFinite(riskClass)) {
    return NO_DATA_COLOR;
  }

  const cls = Math.round(riskClass);
  if (cls < 1 || cls > 5) {
    return NO_DATA_COLOR;
  }

  return RISK_CLASS_COLORS[cls - 1];
}

/**
 * Format class label for legend
 */
export function formatClassLabel(
  classIndex: number,
  breaks: number[],
  precision: number = 0
): string {
  if (classIndex === 0) {
    return `≤ ${breaks[0].toFixed(precision)}`;
  }

  if (classIndex === breaks.length - 1) {
    return `≥ ${breaks[classIndex - 1].toFixed(precision)}`;
  }

  return `${breaks[classIndex - 1].toFixed(precision)} – ${breaks[classIndex].toFixed(precision)}`;
}

/**
 * Risk class labels in English
 */
export const RISK_CLASS_LABELS = [
  'Very Low',
  'Low',
  'Medium',
  'High',
  'Very High',
];
