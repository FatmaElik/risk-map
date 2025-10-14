/**
 * Data joining utilities for GeoJSON + CSV
 */

export interface FeatureProperties {
  mah_id: string | number;
  il?: string;
  ilce?: string;
  mahalle?: string;
  risk_class?: number;
  vs30?: number;
  scenario_7_5?: number;
  total_population?: number;
  total_buildings?: number;
  [key: string]: any;
}

export interface Feature {
  type: string;
  geometry: any;
  properties: FeatureProperties;
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
}

/**
 * Parse CSV to array of objects
 */
export function parseCSV(csvText: string): Record<string, any>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, any> = {};

    headers.forEach((header, idx) => {
      const value = values[idx]?.trim();

      // Try to parse as number
      const num = Number(value);
      row[header] = !isNaN(num) && value !== '' ? num : value;
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Join GeoJSON with CSV data by mah_id
 * Priority: mah_id matching only (no fuzzy name matching)
 */
export function joinGeoJSONWithCSV(
  geojson: FeatureCollection,
  csvData: Record<string, any>[],
  city: string
): FeatureCollection {
  // Create lookup map by mah_id
  const csvMap = new Map<string, Record<string, any>>();

  csvData.forEach((row) => {
    const mahId = String(row.mah_id || '').trim();
    if (mahId) {
      csvMap.set(mahId, row);
    }
  });

  // Join features
  const features = geojson.features.map((feature) => {
    const props = feature.properties || {};
    const mahId = String(props.mah_id || props.MAH_ID || '').trim();

    if (!mahId) {
      console.warn('Feature missing mah_id:', props);
      return feature;
    }

    const csvRow = csvMap.get(mahId);

    if (!csvRow) {
      console.warn(`No CSV match for mah_id: ${mahId}`, props);
      return feature;
    }

    // Merge properties with standardized names
    const merged: FeatureProperties = {
      ...props,
      ...csvRow,
      mah_id: mahId,
      il: city,
      ilce: csvRow.ilce_adi || props.ilce_adi || props.ilce || '',
      mahalle: csvRow.mahalle_adi || props.mahalle_adi || props.mahalle || props.Name || '',
      risk_class: csvRow.risk_class_5 || props.risk_class_5 || null,
      vs30: csvRow.vs30_mean || props.vs30_mean || props.vs30 || null,
      scenario_7_5: csvRow.pga_scenario_mw75 || props.pga_scenario_mw75 || null,
      total_population: csvRow.toplam_nufus || props.toplam_nufus || null,
      total_buildings: csvRow.toplam_bina || props.toplam_bina || null,
    };

    return {
      ...feature,
      properties: merged,
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Load and join city data
 */
export async function loadCityData(
  city: string,
  geojsonUrl: string,
  csvUrl: string
): Promise<FeatureCollection> {
  try {
    const [geojsonRes, csvRes] = await Promise.all([
      fetch(geojsonUrl),
      fetch(csvUrl),
    ]);

    if (!geojsonRes.ok || !csvRes.ok) {
      throw new Error(`Failed to load data for ${city}`);
    }

    const geojson = await geojsonRes.json();
    const csvText = await csvRes.text();
    const csvData = parseCSV(csvText);

    return joinGeoJSONWithCSV(geojson, csvData, city);
  } catch (error) {
    console.error(`Error loading ${city} data:`, error);
    return { type: 'FeatureCollection', features: [] };
  }
}
