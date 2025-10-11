/**
 * Normalize Turkish strings for case-insensitive matching
 * Handles Turkish-specific characters (İ, Ş, Ğ, Ü, Ö, Ç)
 * @param {string} s - String to normalize
 * @returns {string} - Normalized string
 */
const trMap = { 
  'İ': 'i', 
  'I': 'ı', 
  'Ş': 'ş', 
  'Ğ': 'ğ', 
  'Ü': 'ü', 
  'Ö': 'ö', 
  'Ç': 'ç' 
};

export function norm(s) {
  if (!s) return "";
  let x = s.trim().replace(/\s+/g, " ");
  x = x.replace(/[İIŞĞÜÖÇ]/g, (m) => trMap[m] || m).toLowerCase();
  return x;
}

/**
 * Create a join key from city, district, and neighborhood
 * @param {string} city
 * @param {string} district
 * @param {string} neighborhood
 * @returns {string} - Normalized key for joining
 */
export function makeKey(city, district, neighborhood) {
  return [norm(city), norm(district), norm(neighborhood || "")].join("|");
}

