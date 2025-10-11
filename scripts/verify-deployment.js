/**
 * Verify deployment readiness
 * Checks that all required files and data are valid
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

console.log('🔍 Verifying Deployment Readiness\n');

let errors = 0;
let warnings = 0;

// Check GeoJSON files
console.log('📊 Checking GeoJSON Files...');
const geojsonFiles = [
  { path: 'public/data/istanbul_mahalle_risk.geojson', minFeatures: 900, minProps: 60 },
  { path: 'public/data/ankara_mahalle_risk.geojson', minFeatures: 700, minProps: 50 }
];

for (const file of geojsonFiles) {
  const fullPath = path.join(rootDir, file.path);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ❌ Missing: ${file.path}`);
    errors++;
    continue;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const featureCount = data.features?.length || 0;
    const propCount = Object.keys(data.features?.[0]?.properties || {}).length;
    
    if (featureCount < file.minFeatures) {
      console.log(`  ⚠️  ${path.basename(file.path)}: Only ${featureCount} features (expected ${file.minFeatures}+)`);
      warnings++;
    } else {
      console.log(`  ✅ ${path.basename(file.path)}: ${featureCount} features, ${propCount} properties`);
    }
    
    // Check for required fields
    const props = data.features[0].properties;
    const requiredFields = ['mahalle_adi', 'risk_score', 'vs30_mean'];
    const missingFields = requiredFields.filter(f => !(f in props) && !(`${f}_mean` in props));
    
    if (missingFields.length > 0) {
      console.log(`  ⚠️  Missing fields: ${missingFields.join(', ')}`);
      warnings++;
    }
  } catch (err) {
    console.log(`  ❌ Invalid JSON: ${file.path}`);
    console.log(`     ${err.message}`);
    errors++;
  }
}

// Check configuration files
console.log('\n⚙️  Checking Configuration Files...');
const configFiles = [
  { path: 'package.json', required: true },
  { path: 'vercel.json', required: true },
  { path: 'vite.config.js', required: true },
  { path: '.gitignore', required: true }
];

for (const file of configFiles) {
  const fullPath = path.join(rootDir, file.path);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file.path}`);
  } else if (file.required) {
    console.log(`  ❌ Missing: ${file.path}`);
    errors++;
  } else {
    console.log(`  ⚠️  Optional: ${file.path}`);
    warnings++;
  }
}

// Check HTML files
console.log('\n📄 Checking HTML Files...');
const htmlFiles = ['index.html', 'public/dashboard.html'];
for (const file of htmlFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('</html>')) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ⚠️  ${file} - Incomplete HTML`);
      warnings++;
    }
  } else {
    console.log(`  ❌ Missing: ${file}`);
    errors++;
  }
}

// Check source files
console.log('\n🔧 Checking Source Files...');
const sourceFiles = ['src/main.jsx', 'src/App.jsx'];
for (const file of sourceFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ Missing: ${file}`);
    errors++;
  }
}

// Check environment variables
console.log('\n🔐 Checking Environment Variables...');
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_MAPTILER_KEY')) {
    if (envContent.includes('your_maptiler_key_here') || envContent.includes('get_free_key')) {
      console.log('  ⚠️  .env exists but needs actual MapTiler key');
      warnings++;
    } else {
      console.log('  ✅ .env configured');
    }
  } else {
    console.log('  ⚠️  .env missing VITE_MAPTILER_KEY');
    warnings++;
  }
} else {
  console.log('  ⚠️  .env not found (OK for Vercel, but needed for local dev)');
  warnings++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 Summary:');
console.log(`  ✅ Checks passed: ${6 - errors}`);
console.log(`  ⚠️  Warnings: ${warnings}`);
console.log(`  ❌ Errors: ${errors}`);
console.log('='.repeat(60));

if (errors === 0 && warnings === 0) {
  console.log('\n🎉 Perfect! Ready for deployment!');
} else if (errors === 0) {
  console.log('\n✅ Ready for deployment (minor warnings present)');
  console.log('💡 Tip: Add VITE_MAPTILER_KEY to Vercel environment variables');
} else {
  console.log('\n⚠️  Fix errors before deploying!');
  process.exit(1);
}

