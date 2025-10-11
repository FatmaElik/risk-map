import useAppStore from '../state/useAppStore';

/**
 * Year selector for switching between 2025 and 2026 datasets
 */
export default function YearSelect() {
  const { selectedYear, setSelectedYear } = useAppStore();
  
  const years = [2025, 2026];
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 96,
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
        Year
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {years.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            style={{
              padding: '6px 16px',
              border: selectedYear === year ? '2px solid #3B82F6' : '1px solid #D1D5DB',
              borderRadius: 8,
              background: selectedYear === year ? '#EFF6FF' : 'white',
              color: selectedYear === year ? '#1E40AF' : '#6B7280',
              fontWeight: selectedYear === year ? 600 : 400,
              cursor: 'pointer',
              fontSize: 12,
              transition: 'all 0.2s',
            }}
            aria-pressed={selectedYear === year}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}

