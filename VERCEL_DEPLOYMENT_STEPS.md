# 🚀 Vercel Production Deployment - Complete Guide

**Target Domain**: `https://turkiye-risk-map.vercel.app` (fallback: `risk-map-tr.vercel.app`)

---

## ✅ **Prerequisites (Already Complete)**

- ✅ Code is production-ready
- ✅ `vercel.json` configured with alias and SPA rewrites
- ✅ `vite.config.vercel.ts` with `base: "/"` and chunk limit
- ✅ Environment guards implemented
- ✅ Data path resolution with BASE_URL
- ✅ Local `.env` with MAPTILER_KEY

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Vercel Login** ⏳ IN PROGRESS

```bash
npx vercel login
```

**Action Required:**
1. Open browser: `https://vercel.com/oauth/device?user_code=CGNK-NSBX`
2. Authenticate with GitHub
3. Return to terminal and press ENTER
4. Wait for: "Success! You are now logged in"

---

### **Step 2: Link Project**

```bash
npx vercel link --yes
```

**Expected:**
- Select team: "Fatma's projects" (or your team name)
- Project name: `risk-map`
- Linked successfully

---

### **Step 3: Add Environment Variables**

```bash
# Add VITE_MAPTILER_KEY for all environments
echo "aR8nkLQHLfc0itKDgbef" | npx vercel env add VITE_MAPTILER_KEY production
echo "aR8nkLQHLfc0itKDgbef" | npx vercel env add VITE_MAPTILER_KEY preview
echo "aR8nkLQHLfc0itKDgbef" | npx vercel env add VITE_MAPTILER_KEY development

# Verify
npx vercel env ls
```

---

### **Step 4: Add Primary Domain**

```bash
# Try primary first
npx vercel domains add turkiye-risk-map.vercel.app

# If taken, use fallback
# npx vercel domains add risk-map-tr.vercel.app

# List domains
npx vercel domains ls
```

---

### **Step 5: Production Deploy (Clean)**

```bash
# Force deploy without cache
npx vercel deploy --prod --force --yes
```

**This will:**
- Build with `vite.config.vercel.ts`
- Upload to Vercel
- Return deployment URL (e.g., `https://risk-map-abc123.vercel.app`)

---

### **Step 6: Set Alias**

```bash
# Replace <DEPLOY_URL> with the URL from step 5
npx vercel alias set <DEPLOY_URL> turkiye-risk-map.vercel.app
```

---

## 🧪 **Verification Tests**

### **Test 1: Public Access**
- Open in **Incognito**: `https://turkiye-risk-map.vercel.app`
- Should NOT ask for login
- Should NOT show white screen

### **Test 2: Data Loading**
Open Network tab (F12) and verify:
- ✅ `/data/risk/2025.csv` → **200 OK**
- ✅ `/data/boundaries/istanbul_districts.geojson` → **200 OK**
- ✅ `/data/boundaries/ankara_districts.geojson` → **200 OK**

### **Test 3: Map Rendering**
- ✅ Map tiles load (MapTiler)
- ✅ Polygons visible
- ✅ Choropleth colors applied
- ✅ Hover/click works
- ✅ City/Year selectors work

---

## 🐛 **Troubleshooting**

### **Issue: White Screen**
**Cause**: Missing `VITE_MAPTILER_KEY`
**Fix**: 
1. Vercel Dashboard → Settings → Environment Variables
2. Add `VITE_MAPTILER_KEY` for Production
3. Redeploy: `npx vercel deploy --prod --force --yes`

### **Issue: Login Required**
**Cause**: Password Protection ON
**Fix**:
1. Vercel Dashboard → Settings → Security
2. **Production Password Protection**: OFF
3. **Vercel Authentication**: Disabled

### **Issue: 404 on Data Files**
**Cause**: Wrong base path
**Fix**: Already fixed with `dataUrl()` helper and `base: "/"` in `vite.config.vercel.ts`

### **Issue: Domain Alias Failed**
**Cause**: Domain owned by another account
**Fix**: Use fallback `risk-map-tr.vercel.app`

---

## 📊 **Expected Final State**

| Component | Status |
|-----------|--------|
| Vercel Login | ✅ Complete |
| Project Linked | ✅ risk-map |
| Environment Variables | ✅ VITE_MAPTILER_KEY (all envs) |
| Primary Domain | ✅ turkiye-risk-map.vercel.app |
| Production Deploy | ✅ Clean build, no cache |
| Alias | ✅ Domain → Production |
| Public Access | ✅ No login required |
| Data Loading | ✅ All 200 OK |
| Map Rendering | ✅ Fully functional |

---

## 🎯 **Final URLs**

- **Production**: `https://turkiye-risk-map.vercel.app`
- **GitHub Pages**: `https://fatmaelik.github.io/risk-map/`
- **Local Dev**: `http://localhost:5173/`

---

**Status**: Waiting for Vercel login completion to proceed with automated deployment.

