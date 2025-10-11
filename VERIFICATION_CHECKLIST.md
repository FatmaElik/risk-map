# Verification Checklist

Use this checklist to verify all features are working correctly.

## 🚀 Setup Verification

- [ ] `.env` file created with valid `VITE_MAPTILER_KEY`
- [ ] `npm install` completed without errors
- [ ] `npm run dev` starts successfully
- [ ] Browser opens to `http://localhost:5173`
- [ ] Map loads and displays both Istanbul and Ankara

## 🗺️ Map Functionality

### Basemap Toggle
- [ ] "Dark Streets" button switches to dark style
- [ ] "Bright" button switches to bright style
- [ ] Style persists after page reload
- [ ] Layers remain visible after style change

### Year Selector
- [ ] "2025" button loads 2025 dataset
- [ ] "2026" button loads 2026 dataset
- [ ] Map updates when year changes
- [ ] No page reload required
- [ ] Loading indicator appears during data fetch

### Metric Selector
- [ ] Dropdown shows 4 options (Risk Score, VS30, Population, Building Count)
- [ ] Selecting different metrics changes map colors
- [ ] Changes are instant (no reload)
- [ ] Legend updates to match selected metric

### Map Interactions
- [ ] Hover over neighborhood changes cursor to pointer
- [ ] Hover increases polygon opacity
- [ ] Click opens popup with:
  - [ ] Neighborhood name
  - [ ] District and city
  - [ ] Population
  - [ ] Building count
  - [ ] Risk score
  - [ ] VS30 value
- [ ] "Select" button highlights neighborhood with white outline
- [ ] "Zoom" button fits map to neighborhood bounds
- [ ] Popup can be closed with X button

## 🎨 City & District Controls

### City Toggle
- [ ] "Istanbul" button toggles Istanbul visibility
- [ ] "Ankara" button toggles Ankara visibility
- [ ] Both cities show by default
- [ ] Map zooms to fit visible cities
- [ ] At least one city always selected (can't deselect both)

### District Filter
- [ ] Expand button (▼) shows district list
- [ ] Search box filters districts by name
- [ ] Checkboxes toggle individual districts
- [ ] "Select All" selects all districts
- [ ] "Clear All" clears selection
- [ ] District count shows next to "Districts" label
- [ ] Filtered districts dim non-matching neighborhoods on map

## 📊 Legend

- [ ] Legend appears in bottom-right corner
- [ ] Shows metric name (e.g., "Risk Score")
- [ ] Displays 5 color classes
- [ ] Shows numeric range for each class
- [ ] Includes "No data" gray color
- [ ] Updates when metric changes
- [ ] Updates when year changes

## 📈 Scatter Plot

### Basic Functionality
- [ ] Scatter panel appears in bottom-left corner
- [ ] Shows neighborhood count
- [ ] X-axis dropdown selects X metric
- [ ] Y-axis dropdown selects Y metric
- [ ] Points render on canvas
- [ ] Axes have labels
- [ ] Grid lines visible

### Interactions
- [ ] Hover over point shows tooltip with:
  - [ ] Neighborhood name
  - [ ] District and city
  - [ ] Risk score
  - [ ] VS30
  - [ ] Population
  - [ ] Building count
- [ ] Tooltip follows cursor
- [ ] Click point highlights neighborhood on map
- [ ] Click point zooms map to neighborhood
- [ ] Cursor changes to pointer on hover

### Filtering
- [ ] District filter affects scatter points
- [ ] City filter affects scatter points
- [ ] Point count updates with filters
- [ ] "No data available" message when all filtered out

## 🔗 Synchronization

- [ ] Selecting neighborhood in popup highlights it on map
- [ ] Clicking scatter point highlights neighborhood on map
- [ ] Clicking scatter point zooms map to neighborhood
- [ ] District filter affects both map and scatter
- [ ] City filter affects both map and scatter
- [ ] Highlighted neighborhood has persistent white outline

## 🎯 Both Cities Working

### Istanbul
- [ ] Istanbul neighborhoods render on map
- [ ] Istanbul neighborhoods colored by risk_score
- [ ] Istanbul neighborhoods colored by vs30_mean
- [ ] Istanbul neighborhoods colored by population
- [ ] Istanbul neighborhoods colored by building_count
- [ ] Istanbul neighborhoods appear in scatter
- [ ] Istanbul districts appear in filter list

### Ankara
- [ ] Ankara neighborhoods render on map
- [ ] Ankara neighborhoods colored by risk_score
- [ ] Ankara neighborhoods colored by vs30_mean
- [ ] Ankara neighborhoods colored by population
- [ ] Ankara neighborhoods colored by building_count
- [ ] Ankara neighborhoods appear in scatter
- [ ] Ankara districts appear in filter list

## 📱 UX & Polish

- [ ] All controls have consistent styling (rounded corners, shadows)
- [ ] Loading spinner appears when loading data
- [ ] No console errors in browser
- [ ] Controls don't overlap at default window size
- [ ] Text is readable on both basemap styles
- [ ] Colors are visually distinct in legend
- [ ] Hover states work on all interactive elements

## 🔧 Data & Performance

- [ ] 2025 data loads successfully
- [ ] 2026 data loads successfully
- [ ] Data switches without page reload
- [ ] Scatter renders smoothly with 1000+ points
- [ ] Map panning/zooming is responsive
- [ ] No lag when switching metrics
- [ ] District filter updates instantly

## 🏗️ Build

- [ ] `npm run build` succeeds without errors
- [ ] `dist/` folder created
- [ ] `dist/index.html` exists
- [ ] Built app works when served (test with `npm run preview`)

## 🐛 Edge Cases

- [ ] App handles missing GeoJSON files gracefully
- [ ] App handles missing CSV files gracefully
- [ ] Console shows helpful error messages if data missing
- [ ] Map still renders with partial data
- [ ] Empty search results show "No districts found"
- [ ] Deselecting all districts shows all data again

## 📦 Files Verification

Verify these files exist:

Data files:
- [ ] `public/data/boundaries/ankara_neighborhoods.geojson`
- [ ] `public/data/boundaries/istanbul_neighborhoods.geojson`
- [ ] `public/data/risk/2025.csv`
- [ ] `public/data/risk/2026.csv`

Component files:
- [ ] `src/components/MapView.jsx`
- [ ] `src/components/BasemapToggle.jsx`
- [ ] `src/components/YearSelect.jsx`
- [ ] `src/components/MetricLegend.jsx`
- [ ] `src/components/CityDistrictControls.jsx`
- [ ] `src/components/ScatterPanel.jsx`

Utility files:
- [ ] `src/data/loadData.js`
- [ ] `src/data/bins.js`
- [ ] `src/data/fieldMap.js`
- [ ] `src/utils/color.js`
- [ ] `src/utils/spatial.js`
- [ ] `src/utils/format.js`
- [ ] `src/state/useAppStore.js`

---

## 🎉 Success Criteria

All checkboxes above should be checked for full verification.

**Key Requirements:**
1. ✅ Istanbul risk choropleth works (was broken before)
2. ✅ Both basemap styles available
3. ✅ Year switching works
4. ✅ 4 metrics with proper choropleth
5. ✅ 5-class legend
6. ✅ Scatter with district filtering
7. ✅ Neighborhood selection and highlighting
8. ✅ Popups with population and building count

If any items fail, check:
- Browser console for errors
- Network tab for failed requests
- `.env` file for MapTiler key
- Data file paths and formats

