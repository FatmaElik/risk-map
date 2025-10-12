import { dataUrl } from './path';

/**
 * Centralized geographic data paths configuration
 */
export const BOUNDARIES = {
  province: {
    istanbul: dataUrl('data/boundaries/istanbul_districts.geojson'),
    ankara: dataUrl('data/boundaries/ankara_districts.geojson'),
  },
  district: {
    istanbul: dataUrl('data/boundaries/istanbul_districts.geojson'),
    ankara: dataUrl('data/boundaries/ankara_districts.geojson'),
  },
};

export const NEIGHBORHOODS = {
  istanbul: dataUrl('data/istanbul_mahalle_risk.geojson'),
  ankara: dataUrl('data/ankara_mahalle_risk.geojson'),
};

export const RISK_CSV = {
  2025: dataUrl('data/risk/2025.csv'),
  2026: dataUrl('data/risk/2026.csv'),
};

