import fs from 'fs';
import Papa from 'papaparse';

/**
 * Create dummy 2026 dataset by modifying 2025 data
 * This adds slight variations to make it look like projections
 */

// Read 2025 data
const ankara2025 = fs.readFileSync('public/data/risk/2025_ankara.csv', 'utf8');
const istanbul2025 = fs.readFileSync('public/data/risk/2025_istanbul.csv', 'utf8');

function modifyDataFor2026(csvText, city) {
  const parsed = Papa.parse(csvText, { header: true });
  const rows = parsed.data;
  
  // Modify each row slightly for 2026
  const modified = rows.map(row => {
    if (!row.mah_id) return null; // Skip empty rows
    
    return {
      ...row,
      year: 2026,
      city: city,
      // Slight increase in risk (simulate deterioration)
      risk_score: row.risk_score ? (parseFloat(row.risk_score) * 1.05).toFixed(6) : row.risk_score,
      // Slight population growth
      toplam_nufus: row.toplam_nufus ? Math.round(parseInt(row.toplam_nufus) * 1.02) : row.toplam_nufus,
      // Slight building increase
      toplam_bina: row.toplam_bina ? Math.round(parseInt(row.toplam_bina) * 1.01) : row.toplam_bina,
    };
  }).filter(Boolean);
  
  return Papa.unparse(modified);
}

// Generate 2026 data
const ankara2026 = modifyDataFor2026(ankara2025, 'Ankara');
const istanbul2026 = modifyDataFor2026(istanbul2025, 'Istanbul');

// Write files
fs.writeFileSync('public/data/risk/2026_ankara.csv', ankara2026);
fs.writeFileSync('public/data/risk/2026_istanbul.csv', istanbul2026);

console.log('✓ Created 2026 dummy datasets');
console.log('  - public/data/risk/2026_ankara.csv');
console.log('  - public/data/risk/2026_istanbul.csv');

