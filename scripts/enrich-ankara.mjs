// scripts/enrich-ankara.mjs
import fs from "node:fs/promises";
import path from "node:path";

const CSV_IN  = path.resolve("public/data/risk/2025.csv");
const CSV_OUT = path.resolve("public/data/risk/2025.patched.csv");
const GEO_IN  = path.resolve("public/data/ankara_mahalle_risk.geojson"); // Ankara GeoJSON dosyası

const isUnknown = (v) => {
  const s = String(v ?? "").trim().toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
  return ["", "bilinmeyen", "bilinmeyen ilce", "unknown", "unknown district", "n/a", "na"].includes(s);
};

const parseCSV = (txt) => {
  const [headerLine, ...lines] = txt.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map(h => h.trim());
  const rows = lines.map(line => {
    // basit CSV (virgül içinde tırnak yoksa) – mevcut dosya yapısı böyle
    const cols = line.split(",").map(v => v.trim());
    return Object.fromEntries(headers.map((h,i) => [h, cols[i] ?? ""]));
  });
  return { headers, rows };
};

const toCSV = (headers, rows) => {
  const head = headers.join(",");
  const body = rows.map(r => headers.map(h => String(r[h] ?? "")).join(",")).join("\n");
  return `${head}\n${body}\n`;
};

(async () => {
  const [csvTxt, gjTxt] = await Promise.all([
    fs.readFile(CSV_IN, "utf8"),
    fs.readFile(GEO_IN, "utf8"),
  ]);
  const { headers, rows } = parseCSV(csvTxt);
  const gj = JSON.parse(gjTxt);

  // header isimlerini bul
  console.log("Headers found:", headers);
  const H = Object.fromEntries(headers.map(h => [h.toLowerCase(), h]));
  const colIl       = H["il"]        ?? H["city"]       ?? "il";
  const colIlceAdi  = H["ilce_adi"]  ?? H["district"]   ?? "ilce_adi";
  const colMahId    = H["mah_id"]    ?? H["mahalle_id"] ?? "mah_id";
  
  console.log("Column mappings:", { colIl, colIlceAdi, colMahId });

  // lookup: mah_id -> ilce_adi
  const lookup = new Map();
  for (const f of gj.features ?? []) {
    const p = f.properties ?? {};
    const id  = p.mah_id ?? p.MAH_ID ?? p.id ?? p.mahalle_id;
    const ilce = p.ilce_adi ?? p.ilce ?? p.district;
    if (id != null && ilce) lookup.set(String(id), String(ilce));
  }

  // Debug: Check Ankara records
  const ankaraRows = rows.filter(r => (r[colIl] ?? "").toLowerCase() === "ankara");
  console.log(`Total Ankara rows: ${ankaraRows.length}`);
  
  const unknownRows = ankaraRows.filter(r => isUnknown(r[colIlceAdi]));
  console.log(`Ankara unknown ilce_adi rows: ${unknownRows.length}`);
  
  // Check all unique ilce_adi values in Ankara
  const uniqueIlce = [...new Set(ankaraRows.map(r => r[colIlceAdi]))];
  console.log("Unique ilce_adi values in Ankara:", uniqueIlce.slice(0, 10));
  
  // Test isUnknown function
  console.log("Testing isUnknown function:");
  uniqueIlce.slice(0, 5).forEach(val => {
    const normalized = String(val ?? "").trim().toLowerCase()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
    console.log(`  "${val}" -> normalized: "${normalized}" -> isUnknown: ${isUnknown(val)}`);
  });
  
  if (unknownRows.length > 0) {
    console.log("First few unknown samples:", unknownRows.slice(0, 3).map(r => ({
      mah_id: r[colMahId],
      ilce_adi: r[colIlceAdi],
      mahalle_adi: r.mahalle_adi
    })));
  }

  let fixed = 0, candidates = 0, missed = 0;
  for (const r of rows) {
    if ((r[colIl] ?? "").toLowerCase() !== "ankara") continue;
    if (!isUnknown(r[colIlceAdi])) continue;

    candidates++;
    const key = String(r[colMahId] ?? "").trim();
    const ilce = key ? lookup.get(key) : null;
    if (ilce) {
      console.log(`✅ Fixed: mah_id=${key} → ilce_adi=${ilce}`);
      r[colIlceAdi] = ilce;
      fixed++;
    } else {
      console.log(`❌ Missed: mah_id=${key} (not found in GeoJSON)`);
      missed++;
    }
  }

  const outTxt = toCSV(headers, rows);
  await fs.writeFile(CSV_OUT, outTxt, "utf8");

  console.log("CSV_IN :", CSV_IN);
  console.log("GEO_IN :", GEO_IN);
  console.log("CSV_OUT:", CSV_OUT);
  console.log("Ankara unknown candidates:", candidates);
  console.log("Fixed by mah_id:", fixed);
  console.log("Missed:", missed);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
