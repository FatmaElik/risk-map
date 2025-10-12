import { useMemo, useState } from 'react';
import useAppStore from '../state/useAppStore';
import { t } from '../i18n';

/**
 * City toggle and district multi-select filter
 */
export default function CityDistrictControls() {
  const {
    selectedCities,
    toggleCity,
    availableDistricts,
    selectedDistricts,
    setSelectedDistricts,
    clearDistrictFilter,
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filter districts by search query
  const filteredDistricts = useMemo(() => {
    if (!searchQuery) return availableDistricts;
    const query = searchQuery.toLowerCase();
    return availableDistricts.filter(d => 
      d.name.toLowerCase().includes(query)
    );
  }, [availableDistricts, searchQuery]);
  
  const isAllSelected = selectedDistricts.length === availableDistricts.length;
  const hasSelection = selectedDistricts.length > 0;
  
  const handleSelectAll = () => {
    if (isAllSelected) {
      clearDistrictFilter();
    } else {
      setSelectedDistricts(availableDistricts.map(d => d.name));
    }
  };
  
  const handleToggleDistrict = (district) => {
    const newSelection = selectedDistricts.includes(district)
      ? selectedDistricts.filter(d => d !== district)
      : [...selectedDistricts, district];
    setSelectedDistricts(newSelection);
  };
  
  return (
    <div
      className="left-drawer"
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 13,
        maxWidth: 280,
      }}
    >
      {/* City Toggle */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('select_city')}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Istanbul', 'Ankara'].map(city => {
            const isSelected = selectedCities.includes(city);
            const cityKey = city.toLowerCase();
            
            return (
              <button
                key={city}
                onClick={() => toggleCity(city)}
                style={{
                  padding: '6px 12px',
                  border: isSelected ? '2px solid #3B82F6' : '1px solid #D1D5DB',
                  borderRadius: 8,
                  background: isSelected ? '#EFF6FF' : 'white',
                  color: isSelected ? '#1E40AF' : '#6B7280',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: 12,
                  transition: 'all 0.2s',
                }}
                aria-pressed={isSelected}
              >
                {t(cityKey)}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* District Filter */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <div style={{ fontWeight: 600, color: '#374151' }}>
            {t('select_district')}
            {hasSelection && (
              <span style={{ 
                marginLeft: 6, 
                fontSize: 11, 
                color: '#6B7280',
                fontWeight: 400,
              }}>
                ({selectedDistricts.length})
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3B82F6',
              cursor: 'pointer',
              fontSize: 11,
              padding: 4,
            }}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
        
        {isExpanded && (
          <>
            {/* Search */}
            <input
              type="text"
              placeholder="Search districts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #D1D5DB',
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 8,
                fontFamily: 'inherit',
              }}
            />
            
            {/* Select All / Clear */}
            <div style={{ marginBottom: 8 }}>
              <button
                onClick={handleSelectAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3B82F6',
                  cursor: 'pointer',
                  fontSize: 11,
                  padding: '4px 0',
                  textDecoration: 'underline',
                }}
              >
                {isAllSelected ? 'Clear All' : 'Select All'}
              </button>
            </div>
            
            {/* District List */}
            <div style={{
              maxHeight: 240,
              overflowY: 'auto',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              padding: 8,
            }}>
              {filteredDistricts.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#9CA3AF', 
                  fontSize: 11,
                  padding: 8,
                }}>
                  No districts found
                </div>
              ) : (
                filteredDistricts.map(district => (
                  <label
                    key={district.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 0',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDistricts.includes(district.name)}
                      onChange={() => handleToggleDistrict(district.name)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: '#374151' }}>
                      {district.name}
                      <span style={{ color: '#9CA3AF', fontSize: 10, marginLeft: 4 }}>
                        ({district.city})
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

