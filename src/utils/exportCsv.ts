/**
 * CSV export utilities
 */

import { Feature } from './dataJoin';

export interface ExportOptions {
  activeMetric: string;
  breaks: number[];
  classLabels: string[];
}

/**
 * Build CSV from features
 */
export function buildCsvFromFeatures(
  features: Feature[],
  options: ExportOptions
): string {
  const { activeMetric, breaks, classLabels } = options;

  // CSV headers
  const headers = [
    'mah_id',
    'il',
    'ilce',
    'mahalle',
    'risk_class',
    'vs30',
    'scenario_7_5',
    'total_population',
    'total_buildings',
    `${activeMetric}_class_index`,
    `${activeMetric}_class_label`,
  ];

  // Build rows
  const rows = features.map((feature) => {
    const props = feature.properties || {};

    // Get value and class for active metric
    const value = props[activeMetric];
    let classIndex = '';
    let classLabel = '';

    if (value != null && Number.isFinite(value)) {
      // Find class index
      for (let i = 0; i < breaks.length; i++) {
        if (value <= breaks[i]) {
          classIndex = String(i + 1);
          classLabel = classLabels[i] || '';
          break;
        }
      }

      if (!classIndex && breaks.length > 0) {
        classIndex = String(breaks.length);
        classLabel = classLabels[breaks.length - 1] || '';
      }
    }

    return [
      props.mah_id || '',
      props.il || '',
      props.ilce || '',
      props.mahalle || '',
      props.risk_class || '',
      props.vs30 || '',
      props.scenario_7_5 || '',
      props.total_population || '',
      props.total_buildings || '',
      classIndex,
      classLabel,
    ];
  });

  // Build CSV content
  const csvLines = [headers.join(',')];
  rows.forEach((row) => {
    csvLines.push(row.map((val) => `"${val}"`).join(','));
  });

  return csvLines.join('\n');
}

/**
 * Download CSV file with UTF-8 BOM
 */
export function downloadCSV(content: string, filename: string = 'export.csv'): void {
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
