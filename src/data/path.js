/**
 * Helper to resolve public data paths correctly with BASE_URL
 * @param {string} p - Relative path without leading slash, e.g., "data/risk/2025.csv"
 * @returns {string} - Full URL with correct base path
 * @deprecated Use asset() from config.geo.js instead
 */
export function dataUrl(p) {
  // Absolute URL passthrough
  if (/^https?:\/\//i.test(p)) {
    console.debug('[dataUrl] Absolute URL passthrough:', p);
    return p;
  }
  
  const base = import.meta.env.BASE_URL || "/";
  // Remove trailing slashes from base and leading slashes from path
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = p.replace(/^\/+/, "");
  // Combine with exactly one slash
  const url = cleanBase + "/" + cleanPath;
  
  console.debug('[dataUrl]', { base, in: p, out: url });
  return url;
}

