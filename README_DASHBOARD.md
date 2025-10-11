# Multi-City Choropleth Dashboard

React + Vite + MapLibre GL dashboard for visualizing Istanbul and Ankara neighborhood risk data.

## Features

- **Multi-City Support**: Switch between Istanbul and Ankara datasets
- **5-Class Classification**: All variables classified into exactly 5 classes
- **Multiple Variables**:
  - Risk Class (1–5) – Discrete, fixed classes
  - VS30 – Continuous, Jenks/Quantile
  - 7.5 Scenario – Continuous, Jenks/Quantile
  - Total Population – Continuous, Jenks/Quantile
  - Total Buildings – Continuous, Jenks/Quantile
- **Interactive Map**:
  - Choropleth coloring based on selected variable
  - Click neighborhoods to view details in popup
  - Selected neighborhood highlighted with thick border
  - Non-selected neighborhoods dimmed to 50% opacity
  - Zoom to selected neighborhood bounds
- **Dynamic Legend**: 5-class legend updates based on active variable and city
- **CSV Export**: Download all neighborhoods with classification data

## Classification Logic

### Risk Class (1–5)
- Fixed 5 classes with predefined labels: Very Low, Low, Medium, High, Very High
- Direct mapping: value 1–5 → class 1–5
- Colors: Green (low) → Red (high)

### Continuous Variables (VS30, 7.5 Scenario, Population, Buildings)
- **Primary Method**: Jenks Natural Breaks (k=5)
- **Fallback**: Quantile classification (if < 20 unique values)
- **City-Based**: Class boundaries calculated per city (Istanbul vs Ankara)
- **Color Palette**: Sequential light → dark (5 colors)

## Data Joining

- **Join Key**: `mah_id` (priority)
- **CSV + GeoJSON**: Merged by `mah_id`
- **No Fuzzy Matching**: Only exact `mah_id` matches
- **Missing Data**: Gray color, "No Data" in popup

## File Structure

```
src/
├── components/
│   ├── Dashboard.tsx       # Main dashboard component
│   ├── Map.tsx             # MapLibre GL map with choropleth
│   ├── Legend.tsx          # 5-class legend
│   ├── Popup.tsx           # Neighborhood details popup
│   └── Controls.tsx        # City/variable selection controls
├── utils/
│   ├── classify.ts         # Jenks & Quantile classification
│   ├── color.ts            # Color palettes & mapping
│   ├── dataJoin.ts         # GeoJSON + CSV joining
│   ├── exportCsv.ts        # CSV export with UTF-8 BOM
│   └── highlight.ts        # Map highlight utilities
├── App.tsx                 # App entry
└── App.css                 # Styles
```

## Key Components

### Dashboard.tsx
- Main state management (city, metric, selection)
- Data loading (Istanbul + Ankara)
- Computes breaks per city and metric (useMemo)
- Handles CSV export

### Map.tsx
- MapLibre GL initialization
- Choropleth coloring via paint properties
- Feature click → popup
- Highlight selected feature (thick border + dim others)
- Fly to selected feature bounds

### Legend.tsx
- Risk Class: Fixed 1–5 labels
- Continuous: Graduated intervals (≤ a, a–b, ≥ z)

### Popup.tsx
- Neighborhood name, district
- Risk class (if available)
- Population, buildings
- Active variable value + class label

### Controls.tsx
- City selection (Istanbul / Ankara)
- Variable selection dropdown
- CSV export button

## Classification Strategy

```typescript
// utils/classify.ts
chooseBreaks(values, k=5):
  if unique(values) >= 20:
    return jenksBreaks(values, 5)
  else:
    return quantileBreaks(values, 5)
```

## Color Mapping

```typescript
// utils/color.ts
PALETTE_5 = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']
RISK_CLASS_COLORS = ['#2ECC71', '#A3D977', '#F1C40F', '#E67E22', '#E74C3C']

getColorForValue(value, breaks, palette):
  idx = valueToClassIndex(value, breaks)  // 0–4
  return palette[idx]
```

## CSV Export Format

Columns:
- `mah_id`, `il`, `ilce`, `mahalle`
- `risk_class`, `vs30`, `scenario_7_5`, `total_population`, `total_buildings`
- `{activeMetric}_class_index` (1–5)
- `{activeMetric}_class_label` ("≤ a", "a–b", etc.)

UTF-8 BOM included for Excel compatibility.

## Testing

1. **Istanbul + Risk Class**:
   - Select Istanbul → Risk Class (1–5)
   - Verify 5 colors on map
   - Legend shows 5 classes: Very Low … Very High

2. **Ankara + VS30**:
   - Select Ankara → VS30
   - Verify classes recalculated from Ankara distribution
   - Click neighborhood → popup shows VS30 + class

3. **Highlight**:
   - Click neighborhood → thick border, others dimmed
   - Map zooms to feature bounds

4. **CSV Export**:
   - Click "Download CSV"
   - Verify file has all neighborhoods + class columns
   - Open in Excel (UTF-8 BOM should work)

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Acceptance Criteria ✓

- [x] Istanbul + Risk Class (1–5): 5 colors, correct legend
- [x] Ankara dataset: loads, 5 classes recalculated
- [x] VS30 / 7.5 Scenario / Population / Buildings: 5 classes (Jenks/Quantile)
- [x] Popup: neighborhood, district, risk_class, population, buildings, active var + class
- [x] Highlight: zoom, thick border, dim others
- [x] CSV export: all neighborhoods, UTF-8 BOM, class index + label
- [x] No data: gray color, "No Data" in popup
