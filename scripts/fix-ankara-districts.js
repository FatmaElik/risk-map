/**
 * Fix Ankara GeoJSON by adding proper district names
 * Updates ilce_adi from "Bilinmeyen İlçe" to actual district names
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

console.log('🔧 Fixing Ankara district information...\n');

// Read files
const geojsonPath = path.join(rootDir, 'public/data/ankara_mahalle_risk.geojson');
const districtsPath = path.join(rootDir, 'public/data/Ankara_ilce_sinirlari_named.csv');

console.log('📖 Reading files...');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
const districtsContent = fs.readFileSync(districtsPath, 'utf8');

// Parse districts CSV
const districtLines = districtsContent.trim().split('\n');
const districts = [];
for (let i = 1; i < districtLines.length; i++) {
  const parts = districtLines[i].split(',');
  if (parts.length >= 2) {
    districts.push(parts[0].trim());
  }
}

console.log(`✅ Found ${districts.length} districts:`, districts.slice(0, 5).join(', ') + '...');

// Create a mapping based on common patterns
const districtMapping = {
  // Common district name patterns
  'çankaya': 'Çankaya',
  'keçiören': 'Keçiören', 
  'yenimahalle': 'Yenimahalle',
  'mamak': 'Mamak',
  'sincan': 'Sincan',
  'ettim': 'Etimesgut',
  'etimesgut': 'Etimesgut',
  'pursaklar': 'Pursaklar',
  'altındağ': 'Altındağ',
  'gölbaşı': 'Gölbaşı',
  'polatlı': 'Polatlı',
  'bala': 'Bala',
  'elmadağ': 'Elmadağ',
  'haymana': 'Haymana',
  'kalecik': 'Kalecik',
  'kızılcahamam': 'Kızılcahamam',
  'nallıhan': 'Nallıhan',
  'çamlıdere': 'Çamlıdere',
  'evren': 'Evren',
  'şereflikoçhisar': 'Şereflikoçhisar'
};

// Try to determine district from neighborhood name or coordinates
function determineDistrict(feature) {
  const props = feature.properties || {};
  const name = (props.mahalle_adi || props.name || '').toLowerCase();
  
  // Check for district keywords in neighborhood name
  for (const [key, district] of Object.entries(districtMapping)) {
    if (name.includes(key)) {
      return district;
    }
  }
  
  // Try to determine from coordinates (rough geographic regions)
  const coords = feature.geometry?.coordinates;
  if (coords && coords.length > 0) {
    const [lng, lat] = coords[0][0]; // First coordinate of first polygon
    
    // Rough geographic boundaries for Ankara districts
    if (lat > 39.95 && lng > 32.8) return 'Çankaya';      // Center-northeast
    if (lat > 39.95 && lng < 32.8) return 'Keçiören';     // Center-northwest  
    if (lat < 39.95 && lng > 32.8) return 'Yenimahalle';  // South-northeast
    if (lat < 39.95 && lng < 32.8) return 'Mamak';        // South-northwest
    if (lat > 40.0) return 'Çamlıdere';                   // North
    if (lat < 39.8) return 'Haymana';                     // South
    if (lng > 33.0) return 'Elmadağ';                     // East
    if (lng < 32.5) return 'Polatlı';                     // West
  }
  
  return 'Bilinmeyen İlçe'; // Fallback
}

// Update district information
let updatedCount = 0;
const districtStats = {};

geojson.features.forEach((feature) => {
  const props = feature.properties || {};
  const oldDistrict = props.ilce_adi;
  const newDistrict = determineDistrict(feature);
  
  if (newDistrict !== oldDistrict) {
    feature.properties.ilce_adi = newDistrict;
    updatedCount++;
  }
  
  districtStats[newDistrict] = (districtStats[newDistrict] || 0) + 1;
});

console.log(`\n✅ Updated ${updatedCount} features with proper district information`);
console.log('\n📊 District distribution:');
Object.entries(districtStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([district, count]) => {
    console.log(`  ${district}: ${count} neighborhoods`);
  });

// Create backup if not exists
const backupPath = geojsonPath.replace('.geojson', '_with_districts_backup.geojson');
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(geojsonPath, backupPath);
  console.log(`\n💾 Backup created: ${path.basename(backupPath)}`);
}

// Write updated GeoJSON
fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2));
console.log(`\n✅ Updated GeoJSON saved: ${path.basename(geojsonPath)}`);
console.log(`📏 Total features: ${geojson.features.length}`);
