/**
 * Helper to resolve public data paths correctly on GitHub Pages (/risk-map/) and dev (/)
 * @param {string} p - Relative path without leading slash, e.g., "data/risk/2025.csv"
 * @returns {string} - Full URL with correct base path
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

