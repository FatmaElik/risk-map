# Risk Map - Quick Reference

## 🚀 Quick Start (5 Minutes)

1. **Set MapTiler Key:**
   ```bash
   # Create .env file
   echo VITE_MAPTILER_KEY=your_key_here > .env
   ```
   Get free key at: https://cloud.maptiler.com/

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```

3. **Open Browser:**
   - Go to http://localhost:5173
   - You should see a map with Istanbul and Ankara

## 🎮 Controls Layout

```
┌────────────────────────────────────────────────────┐
│ [City & District]              [Basemap] [Year]    │
│ Controls                       Toggle    Select    │
│                                                     │
│                                          [Metric]  │
│                                          Dropdown   │
│                                                     │
│                      MAP                            │
│                                                     │
│                                          [Legend]   │
│ [Scatter Plot]                                     │
└────────────────────────────────────────────────────┘
```

## 📍 Key Features

### 1. Basemap Toggle (Top Right)
- **Dark Streets** (default) - For data visualization
- **Bright** - For general viewing
- Persists on page reload

### 2. Year Selector (Top Right, below basemap)
- **2025** - Current risk data
- **2026** - Projected data (dummy)
- Instantly reloads dataset

### 3. Metric Selector (Top Right, below year)
- **Risk Score** - Yellow to dark red
- **VS30** - Blue gradient (soil strength)
- **Population** - Teal gradient
- **Building Count** - Purple gradient

### 4. City & District Controls (Top Left)
- Toggle **Istanbul** / **Ankara**
- Expand to see **district list**
- Search and multi-select districts
- Affects both map and scatter

### 5. Legend (Bottom Right)
- Shows 5 color classes
- Updates with metric
- Displays value ranges

### 6. Scatter Plot (Bottom Left)
- Choose X and Y metrics
- Hover for details
- Click to select neighborhood on map
- Filtered by district selection

## 🗺️ Map Interactions

| Action | Result |
|--------|--------|
| **Hover** polygon | Cursor → pointer, opacity increases |
| **Click** polygon | Opens popup with details |
| Click **"Select"** in popup | Highlights with white outline |
| Click **"Zoom"** in popup | Fits map to neighborhood |
| **Hover** scatter point | Shows tooltip |
| **Click** scatter point | Highlights on map + zooms |

## 📊 Data Structure

```
public/data/
├── boundaries/          # GeoJSON polygons
│   ├── ankara_neighborhoods.geojson
│   └── istanbul_neighborhoods.geojson
└── risk/                # CSV with metrics
    ├── 2025.csv         # Current year
    └── 2026.csv         # Projected year
```

### CSV Columns Required
- `mah_id` - Neighborhood ID
- `mahalle_adi` - Neighborhood name
- `ilce_adi` - District name
- `city` - "Istanbul" or "Ankara"
- `year` - 2025 or 2026
- `risk_score` - Risk value
- `vs30_mean` - VS30 value
- `toplam_nufus` - Population
- `toplam_bina` - Building count

## 🎨 Color Schemes

| Metric | Color Ramp | Interpretation |
|--------|------------|----------------|
| Risk Score | 🟡→🟠→🔴 | Low → High risk |
| VS30 | 🔵→💙→🌀 | Weak → Strong soil |
| Population | 🟢→💚→🌿 | Few → Many people |
| Buildings | 🟣→💜→🔮 | Few → Many buildings |

## 🔧 Common Tasks

### Change Visualization
1. Click **Metric** dropdown (top right)
2. Select: Risk Score / VS30 / Population / Buildings
3. Legend updates automatically

### Filter by District
1. Click **▼** next to Districts (top left)
2. Search or scroll to find district
3. Check/uncheck districts
4. Both map and scatter update

### Explore Neighborhood Details
1. Click any polygon on map
2. Read popup details
3. Click **"Select"** to highlight
4. Click **"Zoom"** to focus

### Compare Metrics in Scatter
1. Bottom-left scatter panel
2. Set **X axis** = Risk Score
3. Set **Y axis** = VS30
4. Hover points for details

### Compare Years
1. Click **2025** (top right)
2. Note metric values
3. Click **2026**
4. Observe changes (5% higher risk, slight population growth)

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Map doesn't load | Check `.env` has `VITE_MAPTILER_KEY` |
| "Data file missing" | Verify files in `public/data/` |
| Scatter empty | Check district filter isn't excluding all |
| Console errors | Run `npm install` again |
| Build fails | Delete `node_modules` and `package-lock.json`, reinstall |

## 📚 Documentation Files

- **SETUP_GUIDE.md** - Detailed setup instructions
- **IMPLEMENTATION_SUMMARY.md** - Technical overview
- **VERIFICATION_CHECKLIST.md** - Testing checklist
- **QUICK_REFERENCE.md** - This file

## 🎯 What's New vs. Old Version

### ✅ Fixed
- **Istanbul choropleth now works** (was broken before)
- Both cities render with proper risk coloring

### ➕ Added
- Basemap switching (Dark/Bright)
- Year selection (2025/2026)
- 2 additional metrics (Population, Buildings)
- Scatter plot with district filtering
- Neighborhood selection/highlighting
- District multi-select with search
- 5-class quantile binning
- Dynamic legends
- Loading states

### 🚀 Improved
- Modular component architecture
- Centralized state management (Zustand)
- Better error handling
- Graceful degradation
- Performance optimizations
- Professional UI/UX

## 💡 Pro Tips

1. **Use Dark Streets** for data visualization (better contrast)
2. **Filter districts** to focus on specific areas
3. **Click scatter points** for quick neighborhood lookup
4. **Toggle cities** to compare Istanbul vs Ankara
5. **Check 2026** to see projected changes
6. **Use VS30 vs Risk** scatter to identify vulnerable areas with weak soil

## 🔗 Useful Links

- MapTiler: https://cloud.maptiler.com/
- MapLibre Docs: https://maplibre.org/maplibre-gl-js/docs/
- Zustand Docs: https://github.com/pmndrs/zustand
- Vite Docs: https://vitejs.dev/

---

**Version**: 2.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 2025

