import { create } from 'zustand';

/**
 * Global application state store using Zustand
 */
const useAppStore = create((set, get) => ({
  // Year selection
  selectedYear: 2025,
  setSelectedYear: (year) => set({ selectedYear: year }),
  
  // Basemap style
  basemapStyle: localStorage.getItem('basemapStyle') || 'dark',
  setBasemapStyle: (style) => {
    localStorage.setItem('basemapStyle', style);
    set({ basemapStyle: style });
  },
  
  // City selection (array of 'Istanbul', 'Ankara', or both)
  selectedCities: ['Istanbul', 'Ankara'],
  setSelectedCities: (cities) => set({ selectedCities: cities }),
  toggleCity: (city) => {
    const { selectedCities } = get();
    const newCities = selectedCities.includes(city)
      ? selectedCities.filter(c => c !== city)
      : [...selectedCities, city];
    
    // Ensure at least one city is selected
    if (newCities.length === 0) return;
    
    set({ selectedCities: newCities });
  },
  
  // District filter (multi-select)
  selectedDistricts: [],
  setSelectedDistricts: (districts) => set({ selectedDistricts: districts }),
  toggleDistrict: (district) => {
    const { selectedDistricts } = get();
    const newDistricts = selectedDistricts.includes(district)
      ? selectedDistricts.filter(d => d !== district)
      : [...selectedDistricts, district];
    set({ selectedDistricts: newDistricts });
  },
  clearDistrictFilter: () => set({ selectedDistricts: [] }),
  
  // Selected neighborhood (single selection for highlighting)
  selectedNeighborhood: null,
  setSelectedNeighborhood: (neighborhood) => set({ selectedNeighborhood: neighborhood }),
  
  // Metric selection
  metric: 'risk_score',
  setMetric: (metric) => set({ metric }),
  
  // Scatter panel state
  scatterXMetric: 'risk_score',
  scatterYMetric: 'vs30_mean',
  setScatterXMetric: (metric) => set({ scatterXMetric: metric }),
  setScatterYMetric: (metric) => set({ scatterYMetric: metric }),
  
  // Loading states
  isLoadingData: false,
  setIsLoadingData: (loading) => set({ isLoadingData: loading }),
  
  // Data
  geojsonData: null,
  csvData: null,
  setGeojsonData: (data) => set({ geojsonData: data }),
  setCsvData: (data) => set({ csvData: data }),
  
  // Available districts (computed from data)
  availableDistricts: [],
  setAvailableDistricts: (districts) => set({ availableDistricts: districts }),
}));

export default useAppStore;

