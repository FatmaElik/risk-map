/**
 * Helper to resolve public data paths correctly on GitHub Pages (/risk-map/) and dev (/)
 * @param {string} rel - Relative path without leading slash, e.g., "data/risk/2025.csv"
 * @returns {string} - Full URL with correct base path
 */
export function dataUrl(rel) {
  const base = import.meta.env.BASE_URL || "/";
  // Ensure no double slashes
  const cleaned = rel.replace(/^\/+/, "");
  // Combine base and path properly
  const fullPath = base.endsWith('/') ? base + cleaned : base + '/' + cleaned;
  return fullPath;
}

