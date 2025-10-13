import { create } from 'zustand';

/**
 * Global application state store using Zustand
 */
const useAppStore = create((set, get) => ({
  // Locale selection
  locale: localStorage.getItem('locale') || 'tr',
  setLocale: (locale) => {
    localStorage.setItem('locale', locale);
    set({ locale });
  },
  
  // Year selection
  selectedYear: 2025,
  setSelectedYear: (year) => set({ selectedYear: year }),
  
  // Basemap style
  basemapStyle: localStorage.getItem('basemapStyle') || 'dark',
  setBasemapStyle: (style) => {
    localStorage.setItem('basemapStyle', style);
    set({ basemapStyle: style });
  },
  
  // City selection (array of 'Istanbul', 'Ankara', or both) - NO AUTO-SELECT
  selectedCities: ['Istanbul', 'Ankara'],
  setSelectedCities: (cities) => set({ selectedCities: cities }),
  toggleCity: (city) => {
    const { selectedCities } = get();
    const newCities = selectedCities.includes(city)
      ? selectedCities.filter(c => c !== city)
      : [...selectedCities, city];
    
    // Allow empty selection (will show combined bbox)
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
  
  // Choropleth metric (map coloring) - independent from scatter
  choroplethMetric: 'risk_score',
  setChoroplethMetric: (metric) => set({ choroplethMetric: metric }),
  
  // Scatter panel state (decoupled from metric)
  scatterXMetric: 'risk_score',
  scatterYMetric: 'vs30_mean',
  setScatterXMetric: (metric) => set({ scatterXMetric: metric }),
  setScatterYMetric: (metric) => set({ scatterYMetric: metric }),
  
  // UI flags
  ui: {
    scatterOpen: JSON.parse(localStorage.getItem('ui.scatterOpen') || 'true'),
  },
  setUiFlag: (key, value) => {
    localStorage.setItem(`ui.${key}`, JSON.stringify(value));
    set((state) => ({
      ui: { ...state.ui, [key]: value }
    }));
  },
  
  // Loading states
  isLoadingData: false,
  setIsLoadingData: (loading) => set({ isLoadingData: loading }),
  
  // Data & bounding boxes
  geojsonData: null,
  csvData: null,
  boundaries: {
    province: {
      istanbul: null,
      ankara: null,
    },
    district: {
      istanbul: null,
      ankara: null,
    },
  },
  bbox: {
    city: {
      istanbul: null,
      ankara: null,
    },
    combined: null,
  },
  setGeojsonData: (data) => set({ geojsonData: data }),
  setCsvData: (data) => set({ csvData: data }),
  setBoundaries: (part) => set((state) => ({
    boundaries: {
      ...state.boundaries,
      ...part,
    },
  })),
  setBbox: (bboxData) => set((state) => ({
    bbox: {
      ...state.bbox,
      ...bboxData,
    },
  })),
  
  // Available districts (computed from data)
  availableDistricts: [],
  setAvailableDistricts: (districts) => set({ availableDistricts: districts }),
}));

export default useAppStore;

