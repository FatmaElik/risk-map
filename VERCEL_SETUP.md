# 🚀 Vercel Production Deployment Guide

**Canonical URL**: `https://turkiye-risk-map.vercel.app`

## ✅ Code is Ready!

All production hardening is complete:
- ✅ `vercel.json` with alias and SPA rewrites
- ✅ `vite.config.vercel.ts` with base: "/" and chunk warning silenced
- ✅ Environment guard with visible error banner
- ✅ Data path resolution with BASE_URL
- ✅ Safe fetch with detailed error logging

---

## 🔧 Vercel Dashboard Setup (Manual Steps)

### **Step 1: Environment Variables** ⚠️ CRITICAL

1. Go to: **https://vercel.com/dashboard**
2. Select project: **risk-map**
3. Go to: **Settings → Environment Variables**
4. Click: **Add New**
5. Add the following:
   - **Key**: `VITE_MAPTILER_KEY`
   - **Value**: `aR8nkLQHLfc0itKDgbef`
   - **Environment**: Check ✅ Production, ✅ Preview, ✅ Development
6. Click: **Save**

### **Step 2: Primary Domain Setup**

1. Go to: **Settings → Domains**
2. Click: **Add Domain**
3. Enter: `turkiye-risk-map.vercel.app`
4. Click: **Add**
5. Once added, click: **Set as Primary** (or **…** menu → **Set as Primary**)

### **Step 3: Security Settings**

1. Go to: **Settings → Security**
2. **Production Password Protection**: ⚠️ Turn **OFF**
3. **Preview Deployment Protection**: Turn **OFF** (if you want previews public)

### **Step 4: Build Settings (Verify)**

1. Go to: **Settings → Build & Development**
2. Verify:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`
   - **Node Version**: 20.x

---

## 🔄 Trigger Clean Deployment

After adding the environment variable, you MUST redeploy:

### **Option A: Manual Redeploy (Recommended)**

1. Go to: **Deployments**
2. Find the latest deployment
3. Click: **…** menu → **Redeploy**
4. **UNCHECK**: ❌ Use existing Build Cache
5. Click: **Redeploy**

### **Option B: Command Line**

```bash
npm run build:vercel
npm run deploy:prod
```

### **Option C: Push to GitHub**

```bash
git commit --allow-empty -m "chore: trigger Vercel redeploy with env vars"
git push origin main
```

---

## ✅ Acceptance Tests

After deployment completes:

### **1. Primary Domain Test**
- Open in **Incognito/Private window**: `https://turkiye-risk-map.vercel.app`
- Should NOT redirect to login
- Should NOT show white screen
- Should load the map with data

### **2. Browser Console (F12)**
- ✅ No red errors
- ✅ Logs show: `[dataUrl]` with correct paths
- ✅ Logs show: `[safeFetch] Success` for data files
- ❌ Should NOT see: `VITE_MAPTILER_KEY is missing`
- ❌ Should NOT see red banner

### **3. Network Tab**
- ✅ `/data/risk/2025.csv` → **200 OK**
- ✅ `/data/boundaries/istanbul_districts.geojson` → **200 OK**
- ✅ MapTiler API calls → **200 OK**

### **4. Map Functionality**
- ✅ Map renders
- ✅ Polygons visible
- ✅ Colors applied (choropleth)
- ✅ Hover/click popups work
- ✅ City/Year selectors work
- ✅ Scatter plot shows data

---

## 🐛 Common Issues & Fixes

### **Issue: White Screen**
**Cause**: Missing `VITE_MAPTILER_KEY` in Vercel
**Fix**: Add env var in Vercel Dashboard → Redeploy

### **Issue: Login Screen**
**Cause**: Production Password Protection ON
**Fix**: Settings → Security → Turn OFF password protection

### **Issue: 404 on Data Files**
**Cause**: Wrong base path or missing files in `dist/`
**Fix**: Verify `vite.config.vercel.ts` has `base: "/"` and rebuild

### **Issue: Old Preview URL Still Works, Primary Doesn't**
**Cause**: Domain not assigned to latest deployment
**Fix**: Deployments → Latest → Assign Domain → Choose primary

---

## 📋 Deployment Checklist

Before declaring success, check ALL:

- [ ] Environment variable `VITE_MAPTILER_KEY` added to Vercel
- [ ] Primary domain `turkiye-risk-map.vercel.app` added and set as primary
- [ ] Password protection is OFF
- [ ] Latest deployment has the environment variable (check deployment logs)
- [ ] Redeployed with cache OFF after adding env var
- [ ] Incognito test passes (no login, no white screen)
- [ ] Console has no red errors
- [ ] Network tab shows 200 for data files

---

## 🎯 Current Status

| Component | Status |
|-----------|--------|
| Code (vercel.json, vite.config.vercel.ts) | ✅ Ready |
| Environment Guards | ✅ Implemented |
| Data Path Resolution | ✅ Hardened |
| Local .env | ✅ Set (`aR8nkLQHLfc0itKDgbef`) |
| Local Dev | ✅ Working |
| Vercel Env Var | ⚠️ **NEEDS MANUAL SETUP** |
| Vercel Domain | ⚠️ **NEEDS MANUAL SETUP** |
| Production Deploy | 🔄 **PENDING** (after manual steps) |

---

## 📞 Next Steps

1. **Open Vercel Dashboard** now
2. **Add Environment Variable** (Step 1 above)
3. **Set Primary Domain** (Step 2 above)
4. **Redeploy** (Step 4 above)
5. **Test** in incognito: `https://turkiye-risk-map.vercel.app`

---

**After completing these manual steps, the site will be live and public!** 🎉

