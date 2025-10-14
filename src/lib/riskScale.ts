// 5 sınıflı sabit eşik – legend'le birebir
export const RISK_BINS = [0, 0.18, 0.23, 0.30, 0.43, 1.0]; // [low..high], 6 sınır, 5 aralık
export const RISK_COLORS = [
  '#F7E6B5', // 0.00–0.18
  '#F3C74E', // 0.18–0.23
  '#E79A3C', // 0.23–0.30
  '#C3423B', // 0.30–0.43
  '#7A1E1E', // 0.43–1.00
];

export function clamp01(x?: number | null) {
  const v = Number.isFinite(x as number) ? (x as number) : 0;
  return Math.max(0, Math.min(1, v));
}

export function getRiskClass(score?: number | null) {
  const s = clamp01(score);
  for (let i = 0; i < RISK_BINS.length - 1; i++) {
    if (s >= RISK_BINS[i] && s < RISK_BINS[i+1]) return i; // 0..4
  }
  return RISK_BINS.length - 2; // tam 1.0 ise son sınıf
}

export function getRiskColor(score?: number | null) {
  return RISK_COLORS[getRiskClass(score)];
}

export const RISK_LABELS_TR = ['Çok Düşük','Düşük','Orta','Yüksek','Çok Yüksek'];
export const RISK_LABELS_EN = ['Very Low','Low','Medium','High','Very High'];
