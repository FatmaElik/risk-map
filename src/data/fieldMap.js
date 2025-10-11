/**
 * Field mapping between Turkish column names and standardized English names.
 * Use these constants throughout the app to avoid magic strings.
 */

export const FIELD = {
  // Core identifiers
  city: 'city',
  district: 'ilce_adi',
  neighborhood: 'mahalle_adi',
  mah_id: 'mah_id',
  
  // Metrics
  risk_score: 'risk_score',
  vs30_mean: 'vs30_mean',
  population: 'toplam_nufus',
  building_count: 'toplam_bina',
  
  // Coordinates
  lon: 'lon',
  lat: 'lat',
  
  // Year
  year: 'year',
};

/**
 * Normalize property names from GeoJSON or CSV to standard field names
 */
export function normalizeProperties(props) {
  if (!props) return {};
  
  return {
    city: props.city || props.il || props.City || null,
    district: props.ilce_adi || props.district || props.ilce || props.District || null,
    neighborhood: props.mahalle_adi || props.mahalle || props.name || props.Name || props.clean_name || null,
    mah_id: props.mah_id || props.id || null,
    risk_score: props.risk_score !== undefined ? Number(props.risk_score) : null,
    vs30_mean: props.vs30_mean !== undefined ? Number(props.vs30_mean) : (props.vs30 !== undefined ? Number(props.vs30) : null),
    population: props.toplam_nufus !== undefined ? Number(props.toplam_nufus) : (props.population !== undefined ? Number(props.population) : null),
    building_count: props.toplam_bina !== undefined ? Number(props.toplam_bina) : (props.building_count !== undefined ? Number(props.building_count) : null),
    lon: props.lon !== undefined ? Number(props.lon) : null,
    lat: props.lat !== undefined ? Number(props.lat) : null,
    year: props.year !== undefined ? Number(props.year) : null,
  };
}

/**
 * Get city name from GeoJSON path or properties
 */
export function getCityFromPath(path) {
  if (path.includes('ankara')) return 'Ankara';
  if (path.includes('istanbul')) return 'Istanbul';
  return null;
}

