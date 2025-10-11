# Risk Map Application - Setup Guide

## Overview

This is a comprehensive React + Vite + MapLibre GL risk mapping application with advanced features including:

- **Dual basemap styles** (Dark Streets / Bright)
- **Year selection** (2025/2026 datasets)
- **City filtering** (Istanbul, Ankara, or both)
- **Multi-select district filtering**
- **4 metrics with choropleth visualization** (Risk Score, VS30, Population, Building Count)
- **5-class quantile binning** with dynamic legends
- **Interactive scatter plots** with neighborhood selection
- **Popup details** with selection and zoom capabilities
- **Neighborhood highlighting** on map

## Prerequisites

- Node.js 16+ and npm
- MapTiler API key (free tier available)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd risk-map
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```bash
   VITE_MAPTILER_KEY=your_maptiler_key_here
   ```
   
   To get a free MapTiler API key:
   - Visit https://cloud.maptiler.com/
   - Sign up for a free account
   - Go to Account → Keys
   - Copy your default key or create a new one

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

## Data Structure

The application expects data files in the following structure:

```
public/data/
├── boundaries/
│   ├── ankara_neighborhoods.geojson
│   └── istanbul_neighborhoods.geojson
├── risk/
│   ├── 2025.csv
│   └── 2026.csv
```

### CSV Schema

Required columns in CSV files:

- `mah_id` - Unique neighborhood identifier
- `mahalle_adi` - Neighborhood name (Turkish)
- `ilce_adi` - District name (Turkish)
- `city` - City name ("Istanbul" or "Ankara")
- `year` - Year (2025 or 2026)
- `risk_score` - Risk score (0-1 or 0-100)
- `vs30_mean` - VS30 value (m/s)
- `toplam_nufus` - Population count
- `toplam_bina` - Building count
- `lon`, `lat` - Centroid coordinates (optional, calculated from GeoJSON if missing)

### GeoJSON Schema

Required properties in neighborhood GeoJSON features:

- `mah_id` - Must match CSV `mah_id` for data joins
- `mahalle_adi` - Neighborhood name
- `ilce_adi` - District name
- `city` - City name

## Features Guide

### Basemap Toggle (Top Right)
- Switch between "Dark Streets" and "Bright" styles
- Preference persists in localStorage

### Year Selector (Top Right)
- Switch between 2025 and 2026 datasets
- Data reloads automatically

### Metric Selector (Top Right)
- Choose visualization metric:
  - **Risk Score** - Seismic risk assessment
  - **VS30** - Soil shear wave velocity
  - **Population** - Neighborhood population
  - **Building Count** - Number of buildings
- Map colors update instantly

### City & District Controls (Top Left)
- **City Toggle**: Show Istanbul, Ankara, or both
- **District Filter**: 
  - Expand panel to see full list
  - Search districts by name
  - Multi-select to filter map and scatter
  - "Select All" / "Clear All" shortcuts

### Legend (Bottom Right)
- Shows 5-class binning for current metric
- Updates dynamically when metric or data changes
- Displays "No data" color for missing values

### Scatter Plot (Bottom Left)
- **X/Y Axis Selectors**: Choose metrics for each axis
- **Point Interaction**:
  - Hover for tooltip with full details
  - Click to select neighborhood (highlights on map)
  - Points colored by current map metric
- **Filtering**: District filter affects both map and scatter

### Map Interactions
- **Click polygon**: Opens popup with details
  - Population, Buildings, Risk Score, VS30
  - "Select" button: Highlights neighborhood
  - "Zoom" button: Fits map to neighborhood bounds
- **Hover polygon**: Increases opacity
- **Selected neighborhood**: Bold white outline

## Building for Production

```bash
npm run build
```

Output in `dist/` folder.

## Troubleshooting

### "Data file missing" messages
- Check that all required files exist in `public/data/`
- Verify file paths match exactly (case-sensitive)
- The app gracefully handles missing files and continues with available data

### Map not loading
- Verify `VITE_MAPTILER_KEY` is set in `.env`
- Check browser console for API key errors
- Ensure you haven't exceeded MapTiler API limits

### Empty map
- Check that GeoJSON files are valid
- Verify CSV has matching `mah_id` values
- Check browser console for data loading errors

### Scatter plot not showing
- Ensure CSV has `lon`/`lat` columns or GeoJSON geometries for centroids
- Verify selected metrics have valid numeric values
- Check district filter isn't excluding all data

## Architecture

### State Management
- **Zustand** for global state (`src/state/useAppStore.js`)
- Single source of truth for:
  - Selected year, cities, districts, metrics
  - Basemap style preference
  - Loaded GeoJSON and CSV data
  - Selected neighborhood for highlighting

### Data Flow
1. `App.jsx` loads data when year changes
2. `loadData.js` fetches and caches CSV/GeoJSON
3. `joinCsvToGeojson()` merges data by `mah_id`
4. Components subscribe to store and react to changes

### Component Structure
- **MapView**: MapLibre map with layers, popups, highlighting
- **BasemapToggle**: Style switcher
- **YearSelect**: Dataset selector
- **MetricLegend**: Dynamic 5-class legend
- **CityDistrictControls**: City toggle + district multi-select
- **ScatterPanel**: Canvas-based scatter with D3 scales

### Utility Modules
- **data/**: Loading, binning, field mapping
- **utils/**: Colors, spatial ops, formatting

## Performance Notes

- **CSV caching**: Data cached after first load per year
- **Canvas scatter**: Used for efficient rendering (500+ points)
- **MapLibre data-driven styling**: GPU-accelerated choropleth
- **Lazy data joins**: Only recompute when year changes

## License

[Your License]

## Support

For issues or questions, please open an issue on GitHub.

