/**
 * Centralized environment variable access
 * Ensures type safety and provides fallbacks for missing variables
 */

export const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || "";

/**
 * Check if all required environment variables are present
 * @returns {boolean} - True if all required env vars are set
 */
export function checkEnv() {
  const missing = [];
  
  if (!MAPTILER_KEY) {
    missing.push("VITE_MAPTILER_KEY");
  }
  
  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "));
    return false;
  }
  
  console.log("✅ All required environment variables are set");
  return true;
}

