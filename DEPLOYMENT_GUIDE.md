# Deployment Guide - Multi-City Choropleth Dashboard

## 📋 Pre-Deployment Checklist

✅ All code committed locally (commits: 20209f1, 9c57525)
✅ Build tested successfully
✅ TypeScript compiles without errors
✅ vercel.json configured for React SPA routing

## 🚀 Deployment Options

### Option 1: Deploy via GitHub (Recommended)

**Step 1: Push to GitHub**

```bash
# Push the commits to GitHub
git push origin main
```

If you encounter authentication issues, use one of these methods:

**Method A: Using Personal Access Token**
```bash
# Generate a token at: https://github.com/settings/tokens
# Then push with:
git push https://YOUR_TOKEN@github.com/FatmaElik/risk-map.git main
```

**Method B: Using SSH**
```bash
# Set up SSH key if not already done
# Then change remote URL:
git remote set-url origin git@github.com:FatmaElik/risk-map.git
git push origin main
```

**Step 2: Deploy from Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository: `FatmaElik/risk-map`
4. Vercel will auto-detect settings from `vercel.json`
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

### Option 3: Manual GitHub Push & Auto-Deploy

If your Vercel project is already connected to GitHub:

1. **Push commits:**
   ```bash
   git push origin main
   ```

2. **Vercel auto-deploys** - Check https://vercel.com/dashboard

## 📦 Build Configuration

The project uses these build settings (already in `vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🔍 Verify Deployment

After deployment, check:

1. **Main dashboard loads:** `https://YOUR_VERCEL_URL/`
2. **Data files accessible:** `https://YOUR_VERCEL_URL/data/istanbul_mahalle_risk.geojson`
3. **Map renders** with Istanbul data
4. **City switching** works (Istanbul ↔ Ankara)
5. **Variable selection** updates choropleth
6. **Click neighborhood** shows popup
7. **CSV export** downloads file

## 🐛 Common Issues & Fixes

### Issue: Blank Page

**Fix:** Check browser console for errors. Common causes:
- Missing data files in `public/data/`
- MapLibre GL CSS not loading
- API key issues (if using MapTiler)

### Issue: 404 on Refresh

**Fix:** Already handled by `vercel.json` rewrites. If still happening:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue: Data Files Not Found

**Fix:** Ensure all data files are in `public/data/`:
- `istanbul_mahalle_risk.geojson`
- `ankara_mahalle_risk.geojson`
- `istanbul_risk_data.csv`
- `ankara_risk_data.csv`

### Issue: Large Bundle Size

Current build: ~1.17 MB (324 KB gzipped)

**Optimization (optional):**
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ['maplibre-gl'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
```

## 📊 What's Deployed

**New Dashboard Features:**
- Multi-city support (Istanbul & Ankara)
- 5-class choropleth classification
- Interactive map with popups
- Dynamic legends
- CSV export
- Neighborhood highlighting

**Tech Stack:**
- React 19.1.1
- Vite 7.1.9
- MapLibre GL 5.9.0
- TypeScript 5.9.3

## 🔗 URLs After Deployment

Once deployed, you'll have:

- **Production URL:** `https://YOUR_PROJECT.vercel.app/`
- **Dashboard:** `https://YOUR_PROJECT.vercel.app/` (main page)
- **Old Dashboard:** `https://YOUR_PROJECT.vercel.app/dashboard.html` (if kept)

## 📝 Next Steps After Deployment

1. **Test All Features:**
   - [ ] Istanbul data loads correctly
   - [ ] Ankara data loads correctly
   - [ ] All 5 variables display properly
   - [ ] Legends show 5 classes
   - [ ] Popups show correct data
   - [ ] CSV export works
   - [ ] Highlighting works

2. **Update DNS (Optional):**
   - Add custom domain in Vercel dashboard
   - Update DNS records

3. **Monitor Performance:**
   - Check Vercel Analytics
   - Monitor load times
   - Check console for warnings

## 🆘 Getting Help

If deployment fails:

1. **Check build logs** in Vercel dashboard
2. **Test locally first:** `npm run build && npm run preview`
3. **Verify all files committed:** `git status`
4. **Check vercel.json syntax:** Valid JSON

## 📧 Support

- Vercel Support: https://vercel.com/support
- GitHub Issues: https://github.com/FatmaElik/risk-map/issues

---

## Quick Deploy Command

```bash
# One-line deploy (after git push)
git push origin main && echo "Check Vercel dashboard for auto-deployment"

# OR manual deploy with Vercel CLI
vercel --prod
```

**Status:** Ready to deploy ✅
