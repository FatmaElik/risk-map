import useAppStore from '../state/useAppStore';
import trTranslations from './tr.json';
import enTranslations from './en.json';

const translations = {
  tr: trTranslations,
  en: enTranslations,
};

/**
 * Get current locale
 * @returns {string} - Current locale ('tr' or 'en')
 */
export function getLocale() {
  return useAppStore.getState().locale || 'tr';
}

/**
 * Set locale and persist to localStorage
 * @param {string} locale - Locale to set ('tr' or 'en')
 */
export function setLocale(locale) {
  localStorage.setItem('locale', locale);
  useAppStore.getState().setLocale(locale);
}

/**
 * Simple i18n translation function
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
export function t(key) {
  const locale = getLocale();
  return translations[locale]?.[key] || key;
}

/**
 * Format number according to locale
 * @param {number} n - Number to format
 * @param {string} locale - Locale to use (optional)
 * @returns {string} - Formatted number
 */
export function formatNumber(n, locale = getLocale()) {
  return new Intl.NumberFormat(locale).format(n ?? 0);
}

/**
 * Get risk label for a given risk score
 * @param {number} value - Risk score (0-1 or 0-100)
 * @param {string} locale - Language ('tr' or 'en')
 * @returns {string} - Risk label
 */
export function getRiskLabel(value, locale = 'tr') {
  if (value === null || value === undefined || isNaN(value)) {
    return translations[locale]?.na || 'N/A';
  }
  
  // Normalize to 0-1 range if needed
  const normalized = value > 1 ? value / 100 : value;
  
  // 5-class equal-interval breakpoints
  if (normalized < 0.2) return translations[locale]?.risk_very_low || 'Very Low';
  if (normalized < 0.4) return translations[locale]?.risk_low || 'Low';
  if (normalized < 0.6) return translations[locale]?.risk_moderate || 'Moderate';
  if (normalized < 0.8) return translations[locale]?.risk_high || 'High';
  return translations[locale]?.risk_very_high || 'Very High';
}

export default { t, getRiskLabel };

