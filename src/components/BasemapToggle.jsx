import useAppStore from '../state/useAppStore';
import { t } from '../i18n';

/**
 * Toggle between Dark Streets and Bright basemap styles
 */
export default function BasemapToggle() {
  const { basemapStyle, setBasemapStyle } = useAppStore();
  
  const isDark = basemapStyle === 'dark';
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        right: 16,
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>
        {t('basemap')}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setBasemapStyle('dark')}
          style={{
            padding: '6px 12px',
            border: isDark ? '2px solid #3B82F6' : '1px solid #D1D5DB',
            borderRadius: 8,
            background: isDark ? '#EFF6FF' : 'white',
            color: isDark ? '#1E40AF' : '#6B7280',
            fontWeight: isDark ? 600 : 400,
            cursor: 'pointer',
            fontSize: 12,
            transition: 'all 0.2s',
          }}
          aria-pressed={isDark}
        >
          {t('dark_streets')}
        </button>
        <button
          onClick={() => setBasemapStyle('bright')}
          style={{
            padding: '6px 12px',
            border: !isDark ? '2px solid #3B82F6' : '1px solid #D1D5DB',
            borderRadius: 8,
            background: !isDark ? '#EFF6FF' : 'white',
            color: !isDark ? '#1E40AF' : '#6B7280',
            fontWeight: !isDark ? 600 : 400,
            cursor: 'pointer',
            fontSize: 12,
            transition: 'all 0.2s',
          }}
          aria-pressed={!isDark}
        >
          {t('bright')}
        </button>
      </div>
    </div>
  );
}

