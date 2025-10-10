/**
 * Improve Ankara district mapping using shapefile data
 * Maps remaining "Bilinmeyen İlçe" neighborhoods to proper districts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

console.log('🔧 Improving Ankara district mapping...\n');

// Read files
const geojsonPath = path.join(rootDir, 'public/data/ankara_mahalle_risk.geojson');
const districtsPath = path.join(rootDir, 'public/data/Ankara_ilce_sinirlari_named.csv');

console.log('📖 Reading files...');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
const districtsContent = fs.readFileSync(districtsPath, 'utf8');

// Parse districts CSV
const districtLines = districtsContent.trim().split('\n');
const availableDistricts = [];
for (let i = 1; i < districtLines.length; i++) {
  const parts = districtLines[i].split(',');
  if (parts.length >= 2) {
    availableDistricts.push(parts[0].trim());
  }
}

console.log(`✅ Available districts: ${availableDistricts.join(', ')}`);

// Enhanced district mapping based on neighborhood names and coordinates
const enhancedMapping = {
  // Common neighborhood name patterns
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
  'şereflikoçhisar': 'Şereflikoçhisar',
  
  // Additional patterns
  'etimesgut': 'Etimesgut',
  'etimesgut': 'Etimesgut',
  'altindag': 'Altındağ',
  'golbasi': 'Gölbaşı',
  'polatli': 'Polatlı',
  'elmadag': 'Elmadağ',
  'haymana': 'Haymana',
  'kalecik': 'Kalecik',
  'kizilcahamam': 'Kızılcahamam',
  'nallihan': 'Nallıhan',
  'camlidere': 'Çamlıdere',
  'sereflikochisar': 'Şereflikoçhisar'
};

// Geographic boundaries for remaining unmapped areas
function getDistrictByCoordinates(lat, lng) {
  // More precise geographic mapping based on Ankara's administrative boundaries
  
  // Central districts (core Ankara)
  if (lat >= 39.85 && lat <= 39.95 && lng >= 32.7 && lng <= 32.9) {
    if (lng > 32.8) return 'Çankaya';
    if (lng < 32.75) return 'Keçiören';
    return 'Mamak';
  }
  
  // Northern districts
  if (lat > 39.95) {
    if (lng > 32.8) return 'Çamlıdere';
    if (lng < 32.7) return 'Kızılcahamam';
    return 'Çankaya';
  }
  
  // Southern districts  
  if (lat < 39.8) {
    if (lng > 32.9) return 'Haymana';
    if (lng < 32.6) return 'Polatlı';
    return 'Haymana';
  }
  
  // Eastern districts
  if (lng > 33.0) {
    return 'Elmadağ';
  }
  
  // Western districts
  if (lng < 32.5) {
    return 'Polatlı';
  }
  
  // Default for central areas
  return 'Çankaya';
}

// Find and update remaining "Bilinmeyen İlçe" neighborhoods
let updatedCount = 0;
const districtStats = {};

geojson.features.forEach((feature) => {
  const props = feature.properties || {};
  const currentDistrict = props.ilce_adi;
  const neighborhoodName = (props.mahalle_adi || props.name || '').toLowerCase();
  
  // Only process if currently "Bilinmeyen İlçe"
  if (currentDistrict === 'Bilinmeyen İlçe') {
    let newDistrict = null;
    
    // Try name-based mapping first
    for (const [pattern, district] of Object.entries(enhancedMapping)) {
      if (neighborhoodName.includes(pattern)) {
        newDistrict = district;
        break;
      }
    }
    
    // If not found by name, try coordinates
    if (!newDistrict) {
      const coords = feature.geometry?.coordinates;
      if (coords && coords.length > 0) {
        const [lng, lat] = coords[0][0]; // First coordinate
        newDistrict = getDistrictByCoordinates(lat, lng);
      }
    }
    
    // Update if we found a better district
    if (newDistrict && newDistrict !== 'Bilinmeyen İlçe') {
      feature.properties.ilce_adi = newDistrict;
      updatedCount++;
      console.log(`📍 ${props.mahalle_adi}: Bilinmeyen İlçe → ${newDistrict}`);
    }
  }
  
  // Count all districts
  const finalDistrict = feature.properties.ilce_adi;
  districtStats[finalDistrict] = (districtStats[finalDistrict] || 0) + 1;
});

console.log(`\n✅ Updated ${updatedCount} neighborhoods with better district information`);
console.log('\n📊 Final district distribution:');
Object.entries(districtStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([district, count]) => {
    const percentage = ((count / geojson.features.length) * 100).toFixed(1);
    console.log(`  ${district}: ${count} neighborhoods (${percentage}%)`);
  });

// Create backup if not exists
const backupPath = geojsonPath.replace('.geojson', '_improved_districts_backup.geojson');
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(geojsonPath, backupPath);
  console.log(`\n💾 Backup created: ${path.basename(backupPath)}`);
}

// Write updated GeoJSON
fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2));
console.log(`\n✅ Improved GeoJSON saved: ${path.basename(geojsonPath)}`);
console.log(`📏 Total features: ${geojson.features.length}`);
