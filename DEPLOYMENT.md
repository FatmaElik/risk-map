# 🚀 Risk Map Deployment Guide

## ✅ Issues Found and Fixed

### 1. **Critical: Ankara GeoJSON Missing Risk Data**
**Problem**: The cleaned Ankara GeoJSON only had OSM administrative boundaries (29 properties) without any risk analysis data.

**Solution**: Created and ran `scripts/fix-ankara-geojson.js` to join risk data from `public/data/ankara_risk_data.csv` back to the GeoJSON.

**Result**: 
- ✅ All 786 Ankara features now have 58 properties including risk data
- ✅ Backup created: `ankara_mahalle_risk_backup.geojson`

### 2. **Missing Configuration Files**
**Added**:
- ✅ `vercel.json` - Routing configuration for both dashboard.html and React app
- ✅ `.gitignore` - Proper environment variable protection

### 3. **Environment Variables**
⚠️ **IMPORTANT**: You need to set the MapTiler API key!

**For Local Development**:
Create a `.env` file in the project root:
```bash
VITE_MAPTILER_KEY=your_actual_maptiler_key_here
```

**For Vercel Deployment**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_MAPTILER_KEY` = `your_maptiler_key`
3. Get a free key at: https://www.maptiler.com/

---

## 📊 Data Verification

### GeoJSON Files Status
| File | Size | Features | Properties | Status |
|------|------|----------|------------|--------|
| `istanbul_mahalle_risk.geojson` | 6.00 MB | 955 | 67 | ✅ Valid |
| `ankara_mahalle_risk.geojson` | 3.21 MB | 786 | 58 | ✅ Fixed |

### Required Data Fields (All Present)
- ✅ `mahalle_adi` / `Name` / `name` - Neighborhood name
- ✅ `ilce_adi` / `district` - District name
- ✅ `risk_score` / `combined_risk_index` - Risk score
- ✅ `risk_class_5` - Risk classification (1-5)
- ✅ `vs30_mean` / `vs30` - Soil velocity
- ✅ `pga_scenario_mw75` - Peak ground acceleration
- ✅ `toplam_nufus` - Total population
- ✅ `toplam_bina` - Total buildings

---

## 🗺️ Application Structure

### Two Deployment Targets

#### 1. **React App** (`/` root path)
- Entry: `index.html` → `src/main.jsx` → `src/App.jsx`
- Uses: MapLibre GL + MapTiler
- Requires: `VITE_MAPTILER_KEY` environment variable
- Features: Interactive choropleth map with risk/VS30 toggle

#### 2. **Dashboard** (`/dashboard.html` or `/dashboard`)
- Standalone HTML file with Leaflet + OpenStreetMap
- No API key required (uses free OSM tiles)
- Features: Full analytics dashboard with charts, statistics, scatter plots

### Routing Configuration (`vercel.json`)
```json
{
  "rewrites": [
    { "source": "/dashboard.html", "destination": "/dashboard.html" },
    { "source": "/dashboard", "destination": "/dashboard.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🔧 Local Testing

### 1. Test Dashboard (No API Key Needed)
```bash
npm run dev
```
Then visit: `http://localhost:5173/dashboard.html`

**What to Check**:
- ✅ Map loads with both Istanbul and Ankara
- ✅ Choropleth colors display correctly
- ✅ Clicking polygons shows popup with risk data
- ✅ Charts tab displays scatter plots
- ✅ Statistics panel shows correct numbers

### 2. Test React App (Requires API Key)
```bash
# 1. Create .env file with your MapTiler key
echo "VITE_MAPTILER_KEY=your_key_here" > .env

# 2. Run dev server
npm run dev
```
Then visit: `http://localhost:5173/`

**What to Check**:
- ✅ MapTiler basemap loads
- ✅ Neighborhood polygons overlay correctly
- ✅ Risk/VS30 toggle switches colors
- ✅ Clicking shows popup with correct data

---

## 📦 Build and Deploy

### Build for Production
```bash
npm run build
```

This creates a `dist/` folder with:
- `index.html` - React app entry
- `dashboard.html` - Standalone dashboard
- `data/` - GeoJSON files
- `assets/` - JavaScript and CSS bundles

### Deploy to Vercel

#### Option 1: Git Push (Recommended)
```bash
# Commit the fixed files
git add .
git commit -m "Fix: Add risk data to Ankara GeoJSON and deployment config"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build the project
3. Deploy to production
4. Use environment variables from Vercel dashboard

#### Option 2: Manual Deploy
```bash
vercel --prod
```

### Set Environment Variables on Vercel
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - Key: `VITE_MAPTILER_KEY`
   - Value: Your MapTiler API key
   - Environment: Production, Preview, Development (all)
5. Redeploy if needed

---

## ✅ Deployment Checklist

- [x] Ankara GeoJSON has risk data (58 properties)
- [x] Istanbul GeoJSON is valid (67 properties)
- [x] `vercel.json` routing configured
- [x] `.gitignore` prevents committing secrets
- [ ] **TODO**: Add `VITE_MAPTILER_KEY` to .env (local)
- [ ] **TODO**: Add `VITE_MAPTILER_KEY` to Vercel (production)
- [ ] **TODO**: Test dashboard.html works
- [ ] **TODO**: Test React app loads correctly
- [ ] **TODO**: Commit and push to GitHub
- [ ] **TODO**: Verify Vercel auto-deploys

---

## 🐛 Troubleshooting

### Issue: React App Shows Blank Map
**Cause**: Missing or invalid `VITE_MAPTILER_KEY`

**Fix**: 
1. Check Vercel environment variables
2. Ensure key is valid at https://cloud.maptiler.com/
3. Redeploy after adding variable

### Issue: Dashboard Shows Empty Map
**Cause**: GeoJSON files not loading

**Fix**:
1. Check browser console for 404 errors
2. Verify files exist in `public/data/`
3. Check `vercel.json` has correct cache headers

### Issue: Ankara Shows Gray/No Data
**Cause**: Risk data not joined to GeoJSON

**Fix**: Rerun the fix script:
```bash
node scripts/fix-ankara-geojson.js
```

---

## 📝 File Changes Summary

### New Files
- `vercel.json` - Deployment routing configuration
- `.gitignore` - Git ignore patterns
- `scripts/fix-ankara-geojson.js` - Data join script
- `DEPLOYMENT.md` - This file
- `public/data/ankara_mahalle_risk_backup.geojson` - Backup of original

### Modified Files
- `public/data/ankara_mahalle_risk.geojson` - Fixed with risk data (58 properties now)

### No Changes Required
- `public/dashboard.html` - Already compatible ✅
- `src/App.jsx` - Already has property fallbacks ✅
- `public/data/istanbul_mahalle_risk.geojson` - Already valid ✅

---

## 🎯 Next Steps

1. **Get MapTiler API Key**: https://www.maptiler.com/ (free tier available)
2. **Add to Vercel**: Settings → Environment Variables → Add `VITE_MAPTILER_KEY`
3. **Test Locally**: Run `npm run dev` and check both `/` and `/dashboard`
4. **Commit & Push**: Git push will trigger auto-deployment
5. **Verify Production**: Check both URLs work on Vercel

---

## 📞 Support

If issues persist:
1. Check browser console for errors
2. Verify Vercel build logs
3. Ensure GeoJSON files are in `dist/data/` after build
4. Test dashboard.html independently (doesn't need API key)

