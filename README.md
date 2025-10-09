# 🗺️ Risk Map Web Application

Interactive seismic risk visualization dashboard for Istanbul and Ankara neighborhoods.

> **Status**: ✅ Deployed and working!

## 🎯 Features

- **Choropleth Maps**: Color-coded risk visualization using MapLibre GL and Leaflet
- **Dual Datasets**: Istanbul (955 neighborhoods) + Ankara (786 neighborhoods)
- **Risk Analytics**: Risk scores, VS30 soil values, PGA scenarios
- **Interactive Dashboard**: Charts, scatter plots, correlation analysis
- **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

See **[QUICK_START.md](QUICK_START.md)** for immediate deployment steps.

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get deployed in 3 steps (5 minutes)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide and troubleshooting

## 🛠️ Tech Stack

### React App (`/`)
- **Frontend**: React 19 + Vite
- **Mapping**: MapLibre GL
- **Basemap**: MapTiler (requires API key)
- **Data**: GeoJSON overlays

### Dashboard (`/dashboard`)
- **Frontend**: Vanilla JavaScript + HTML
- **Mapping**: Leaflet
- **Basemap**: OpenStreetMap (free, no API key)
- **Charts**: Chart.js
- **Data**: Same GeoJSON files

## 📊 Data

### Istanbul Dataset
- **File**: `public/data/istanbul_mahalle_risk.geojson`
- **Size**: 6.00 MB
- **Features**: 955 neighborhoods
- **Properties**: 67 fields (risk, demographics, seismic data)

### Ankara Dataset  
- **File**: `public/data/ankara_mahalle_risk.geojson`
- **Size**: 3.21 MB
- **Features**: 786 neighborhoods
- **Properties**: 58 fields (risk, demographics, seismic data)

### Key Data Fields
- `mahalle_adi` - Neighborhood name
- `ilce_adi` - District name
- `risk_score` / `combined_risk_index` - Risk assessment (0-100)
- `risk_class_5` - Risk classification (1-5)
- `vs30_mean` - Average soil shear wave velocity (m/s)
- `pga_scenario_mw75` - Peak ground acceleration for Mw 7.5 scenario
- `toplam_nufus` - Total population
- `toplam_bina` - Total building count

## 🏗️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Visit:
- React app: http://localhost:5173/
- Dashboard: http://localhost:5173/dashboard.html

### Build for Production
```bash
npm run build
```

Output in `dist/` folder.

## 🌍 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variable: `VITE_MAPTILER_KEY`
3. Deploy automatically on push

### Other Platforms
1. Build: `npm run build`
2. Serve `dist/` folder
3. Set environment variable: `VITE_MAPTILER_KEY`

## 🔧 Configuration

### Environment Variables
- `VITE_MAPTILER_KEY` - MapTiler API key (required for React app)
- `VITE_MAP_STYLE` - Custom map style URL (optional)

Get a free MapTiler key: https://www.maptiler.com/

### Routing (`vercel.json`)
```json
{
  "rewrites": [
    { "source": "/dashboard", "destination": "/dashboard.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🧪 Testing & Verification

### Verify Deployment Readiness
```bash
node scripts/verify-deployment.js
```

### Check GeoJSON Data
```bash
# View first feature properties
node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('public/data/ankara_mahalle_risk.geojson')); console.log(Object.keys(data.features[0].properties));"
```

## 📁 Project Structure

```
risk-map/
├── public/
│   ├── data/
│   │   ├── ankara_mahalle_risk.geojson      # Ankara neighborhoods
│   │   ├── istanbul_mahalle_risk.geojson    # Istanbul neighborhoods
│   │   └── ankara_risk_data.csv             # Source data
│   └── dashboard.html                        # Standalone dashboard
├── src/
│   ├── App.jsx                               # React map component
│   ├── main.jsx                              # React entry point
│   └── index.css                             # Styles
├── scripts/
│   ├── fix-ankara-geojson.js                 # Data repair script
│   └── verify-deployment.js                  # Deployment verification
├── index.html                                # React app entry
├── vercel.json                               # Vercel configuration
├── vite.config.js                            # Vite configuration
├── package.json                              # Dependencies
├── QUICK_START.md                            # Quick deployment guide
└── DEPLOYMENT.md                             # Full documentation
```

## 🎨 Features

### React App Features
- ✅ MapTiler basemap (satellite, streets, terrain)
- ✅ Risk score choropleth
- ✅ VS30 soil value choropleth
- ✅ Interactive polygons with hover effects
- ✅ Popup with detailed neighborhood info
- ✅ Auto-fit bounds to data extent

### Dashboard Features
- ✅ City selector (Istanbul / Ankara / Both)
- ✅ Neighborhood search and selection
- ✅ Variable chooser (risk, VS30, PGA, population, buildings)
- ✅ Dynamic legend
- ✅ Statistics panel (total, average, high-risk count)
- ✅ Scatter plot analysis
- ✅ Correlation matrix
- ✅ Distribution histograms
- ✅ Choropleth map with Leaflet

## 🐛 Known Issues & Fixes

### Issue: Ankara Data Missing (FIXED ✅)
**Problem**: Cleaned GeoJSON in QGIS lost risk attributes  
**Solution**: Script `scripts/fix-ankara-geojson.js` rejoins data from CSV  
**Status**: Fixed automatically

### Issue: Map Hangs on "Still Loading" (FIXED ✅)
**Problem**: Non-polygon geometries (Point/LineString) caused issues  
**Solution**: Filter applied in code: `filter: f => ['Polygon','MultiPolygon'].includes(f.geometry?.type)`  
**Status**: Both files now contain only polygons

## 📝 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

## 📧 Contact

[Add contact info here]

---

Built with ❤️ using React, MapLibre GL, Leaflet, and Vite
