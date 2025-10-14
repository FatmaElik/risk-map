// Base-aware URL helper
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, ''); // no trailing slash

export const asset = (p) => `${BASE}/${String(p).replace(/^\/+/, '')}`;

/**
 * Centralized geographic data paths configuration
 */
export const BOUNDARIES = {
  province: {
    istanbul: asset('data/boundaries/istanbul_districts.geojson'),
    ankara: asset('data/boundaries/ankara_districts.geojson'),
  },
  district: {
    istanbul: asset('data/boundaries/istanbul_districts.geojson'),
    ankara: asset('data/boundaries/ankara_districts.geojson'),
  },
};

export const NEIGHBORHOODS = {
  istanbul: asset('data/istanbul_mahalle_risk.geojson'),
  ankara: asset('data/ankara_mahalle_risk.geojson'),
};

export const RISK_CSV = {
  2025: asset('data/risk/2025.csv'),
  2026: asset('data/risk/2026.csv'),
};

