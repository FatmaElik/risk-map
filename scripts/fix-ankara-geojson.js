/**
 * Fix Ankara GeoJSON by joining risk analysis data from CSV
 * 
 * The cleaned GeoJSON only has OSM administrative data.
 * This script joins the risk analysis attributes from ankara_risk_data.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read files
const geojsonPath = path.join(__dirname, '../public/data/ankara_mahalle_risk.geojson');
const csvPath = path.join(__dirname, '../public/data/ankara_risk_data.csv');

console.log('📖 Reading files...');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Parse CSV
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');
console.log(`📊 CSV has ${headers.length} columns`);

const riskData = {};
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  const row = {};
  headers.forEach((header, idx) => {
    row[header] = values[idx];
  });
  
  // Use mahalle_adi (neighborhood name) as key
  const key = row.mahalle_adi?.trim().toLowerCase();
  if (key) {
    riskData[key] = row;
  }
}

console.log(`✅ Parsed ${Object.keys(riskData).length} neighborhoods from CSV`);

// Join data
let matchedCount = 0;
let unmatchedCount = 0;
const unmatched = [];

geojson.features.forEach((feature) => {
  const props = feature.properties;
  const name = (props.name || props.mahalle_adi || '')?.trim().toLowerCase();
  
  if (riskData[name]) {
    // Merge CSV data into GeoJSON properties
    Object.assign(feature.properties, riskData[name]);
    matchedCount++;
  } else {
    unmatchedCount++;
    unmatched.push(props.name || props.mahalle_adi || 'Unknown');
  }
});

console.log(`\n✅ Matched: ${matchedCount} features`);
console.log(`⚠️  Unmatched: ${unmatchedCount} features`);

if (unmatched.length > 0 && unmatched.length <= 20) {
  console.log('\nUnmatched features:');
  unmatched.forEach(name => console.log(`  - ${name}`));
}

// Backup original
const backupPath = geojsonPath.replace('.geojson', '_backup.geojson');
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(geojsonPath, backupPath);
  console.log(`\n💾 Backup created: ${path.basename(backupPath)}`);
}

// Write fixed GeoJSON
fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2));
console.log(`\n✅ Fixed GeoJSON saved: ${path.basename(geojsonPath)}`);
console.log(`📏 Total features: ${geojson.features.length}`);
console.log(`🏷️  Properties per feature: ${Object.keys(geojson.features[0].properties).length}`);

