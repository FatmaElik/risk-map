import useAppStore from '../state/useAppStore';
import { setLocale } from '../i18n';

/**
 * Language toggle component (TR/EN)
 */
export default function LanguageToggle() {
  const { locale, setLocale } = useAppStore();

  const handleChange = (e) => {
    setLocale(e.target.value);
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        borderRadius: 12,
        padding: '8px 12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 13,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <span style={{ fontWeight: 500, color: '#6B7280' }}>🌐</span>
      <select
        value={locale}
        onChange={handleChange}
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          color: '#111827',
          fontSize: 13,
        }}
      >
        <option value="tr">TR</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}

