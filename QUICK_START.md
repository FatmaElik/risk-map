# 🚀 Quick Start Guide

## What Was Wrong?

Your **Ankara GeoJSON file was missing all risk analysis data**. It only had administrative boundaries from OpenStreetMap. When you cleaned it in QGIS to remove Point/LineString geometries, the risk attributes were lost.

## What Was Fixed?

✅ **Joined risk data from CSV** back to Ankara GeoJSON  
✅ **Created deployment configuration** (`vercel.json`)  
✅ **Added environment setup** (`.gitignore`)  
✅ **Verified both datasets** are compatible with your code  
✅ **Created backup** of original Ankara file  

## 📊 Current Status

| Item | Status |
|------|--------|
| Istanbul GeoJSON | ✅ 955 features, 67 properties |
| Ankara GeoJSON | ✅ 786 features, 58 properties (FIXED!) |
| dashboard.html | ✅ Ready (uses free OSM tiles) |
| React App (App.jsx) | ⚠️ Needs MapTiler API key |
| Deployment Config | ✅ vercel.json created |

## 🔥 Deploy in 3 Steps

### 1️⃣ Get MapTiler Key (5 minutes)
1. Go to https://www.maptiler.com/
2. Sign up (free tier available)
3. Get your API key from the dashboard

### 2️⃣ Add to Vercel (2 minutes)
1. Open https://vercel.com/dashboard
2. Go to your project → Settings → Environment Variables
3. Add new variable:
   - **Name**: `VITE_MAPTILER_KEY`
   - **Value**: Your API key from step 1
   - **Environments**: Check all (Production, Preview, Development)

### 3️⃣ Deploy (1 minute)
```bash
# Commit the fixes
git add .
git commit -m "fix: Add risk data to Ankara GeoJSON and deployment config"
git push origin main
```

Vercel will **automatically detect and deploy** your changes! 🎉

## 🧪 Test Locally First (Optional)

### Test Dashboard (No API Key Needed)
```bash
npm run dev
```
Visit: http://localhost:5173/dashboard.html

✅ Should show both Istanbul and Ankara with risk colors

### Test React App (Needs API Key)
```bash
# Create .env file
echo "VITE_MAPTILER_KEY=your_key_here" > .env

npm run dev
```
Visit: http://localhost:5173/

✅ Should show MapTiler basemap with overlays

## 📁 Files Changed

### Created
- ✨ `scripts/fix-ankara-geojson.js` - Data repair script
- ✨ `scripts/verify-deployment.js` - Deployment checker
- ✨ `vercel.json` - Routing configuration
- ✨ `.gitignore` - Protect secrets
- ✨ `DEPLOYMENT.md` - Full documentation
- ✨ `QUICK_START.md` - This file
- 💾 `public/data/ankara_mahalle_risk_backup.geojson` - Original backup

### Modified
- 🔧 `public/data/ankara_mahalle_risk.geojson` - **FIXED!** Now has risk data

### No Changes
- ✅ `public/dashboard.html` - Already works perfectly
- ✅ `src/App.jsx` - Already has fallbacks for property names
- ✅ `public/data/istanbul_mahalle_risk.geojson` - Already valid

## 🐛 If Site Still Not Working

### Dashboard Not Loading?
```bash
# Check browser console (F12)
# Look for 404 errors on /data/*.geojson files
```

### React App Blank?
```bash
# Check if MapTiler key is set in Vercel
# Go to: Project → Settings → Environment Variables
# Should see: VITE_MAPTILER_KEY
```

### Want to Verify Everything?
```bash
# Run verification script
node scripts/verify-deployment.js
```

## 🎯 Your Two Apps

### App 1: React Map (Root URL)
- **URL**: `https://your-site.vercel.app/`
- **Tech**: MapLibre GL + MapTiler
- **Features**: Interactive choropleth, risk/VS30 toggle
- **Needs**: MapTiler API key

### App 2: Dashboard (Dashboard URL)
- **URL**: `https://your-site.vercel.app/dashboard`
- **Tech**: Leaflet + OpenStreetMap (free!)
- **Features**: Full analytics, charts, scatter plots, statistics
- **Needs**: Nothing! Works immediately

## ✨ What to Expect After Deploy

1. **Both Istanbul and Ankara** neighborhoods will display
2. **Choropleth colors** show risk levels (green = low, red = high)
3. **Clicking polygons** shows detailed risk info
4. **Dashboard charts** show statistical analysis
5. **No "still loading" hang** - the Point/LineString issue is fixed!

## 💡 Pro Tips

- Dashboard uses **free OSM tiles** - no API limits!
- React app uses **MapTiler free tier** - 100K requests/month
- Both apps read from same GeoJSON files
- Data is cached for performance
- Mobile responsive design

## 📞 Next Actions

1. ✅ Data is fixed
2. ✅ Config is ready
3. ⏳ **You need to**: Get MapTiler key
4. ⏳ **You need to**: Add key to Vercel
5. ⏳ **You need to**: Push to GitHub

That's it! 🎉

---

**Need detailed info?** See `DEPLOYMENT.md`  
**Want to understand the fix?** See `scripts/fix-ankara-geojson.js`  
**Ready to deploy?** Just push to GitHub!

