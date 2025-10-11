import fs from 'fs';
import Papa from 'papaparse';

/**
 * Merge city-specific CSV files into single year files
 */

function mergeCities(year) {
  const ankaraPath = `public/data/risk/${year}_ankara.csv`;
  const istanbulPath = `public/data/risk/${year}_istanbul.csv`;
  
  const ankaraText = fs.readFileSync(ankaraPath, 'utf8');
  const istanbulText = fs.readFileSync(istanbulPath, 'utf8');
  
  const ankData = Papa.parse(ankaraText, { header: true }).data.filter(r => r.mah_id);
  const istData = Papa.parse(istanbulText, { header: true }).data.filter(r => r.mah_id);
  
  // Ensure city and year columns exist
  const enhancedAnk = ankData.map(row => ({
    ...row,
    city: row.city || 'Ankara',
    year: row.year || year,
  }));
  
  const enhancedIst = istData.map(row => ({
    ...row,
    city: row.city || 'Istanbul',
    year: row.year || year,
  }));
  
  const combined = [...enhancedAnk, ...enhancedIst];
  const csv = Papa.unparse(combined);
  
  fs.writeFileSync(`public/data/risk/${year}.csv`, csv);
  console.log(`✓ Created public/data/risk/${year}.csv (${combined.length} rows)`);
}

mergeCities(2025);
mergeCities(2026);

