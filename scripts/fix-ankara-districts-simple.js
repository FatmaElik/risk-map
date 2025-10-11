/**
 * Fix Ankara districts using ankara_mahalle.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

console.log('🔧 Fixing Ankara districts...\n');

// Read files
const geojsonPath = path.join(rootDir, 'public/data/ankara_mahalle_risk.geojson');
const csvPath = path.join(rootDir, 'public/data/ankara_mahalle.csv');

console.log('📖 Reading files...');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Parse CSV and create mapping
const lines = csvContent.trim().split('\n');
const districtMap = {};

console.log('📊 Creating district mapping...');
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts.length >= 4) {
    const name = parts[12]?.replace(/"/g, '').trim(); // name column
    const district = parts[9]?.replace(/"/g, '').trim(); // district column
    
    if (name && district && district !== '') {
      districtMap[name] = district;
    }
  }
}

console.log(`✅ Found ${Object.keys(districtMap).length} neighborhood-district mappings`);

// Update GeoJSON features
let updatedCount = 0;
const districtStats = {};

geojson.features.forEach((feature) => {
  const props = feature.properties || {};
  const neighborhoodName = props.mahalle_adi || props.name || '';
  
  // Try to find district mapping
  if (districtMap[neighborhoodName]) {
    const newDistrict = districtMap[neighborhoodName];
    feature.properties.ilce_adi = newDistrict;
    updatedCount++;
    console.log(`📍 ${neighborhoodName}: → ${newDistrict}`);
  } else {
    // Set default district
    feature.properties.ilce_adi = feature.properties.ilce_adi || 'Çankaya';
  }
  
  // Count districts
  const finalDistrict = feature.properties.ilce_adi;
  districtStats[finalDistrict] = (districtStats[finalDistrict] || 0) + 1;
});

console.log(`\n✅ Updated ${updatedCount} neighborhoods with district information`);
console.log('\n📊 District distribution:');
Object.entries(districtStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([district, count]) => {
    const percentage = ((count / geojson.features.length) * 100).toFixed(1);
    console.log(`  ${district}: ${count} neighborhoods (${percentage}%)`);
  });

// Write updated GeoJSON
fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2));
console.log(`\n✅ Updated GeoJSON saved: ${path.basename(geojsonPath)}`);
console.log(`📏 Total features: ${geojson.features.length}`);
