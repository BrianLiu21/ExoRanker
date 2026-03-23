// ─── TIERS ────────────────────────────────────────────────────────────────────
// Thresholds are in weighted score points (max 7.8, treated as /8)
// tier-1 correct = 0.6pts · tier-2 correct = 1.0pts · tier-3 correct = 1.5pts
export const TIERS = [
  { id:"explorer",   label:"Explorer",   min:0,   max:2.0, weight:1.0, color:"#888780", desc:"Newcomer",          k:32 },
  { id:"observer",   label:"Observer",   min:2.1, max:4.0, weight:1.5, color:"#378ADD", desc:"Working knowledge", k:48 },
  { id:"analyst",    label:"Analyst",    min:4.1, max:6.0, weight:2.0, color:"#7F77DD", desc:"Strong grasp",      k:64 },
  { id:"astronomer", label:"Astronomer", min:6.1, max:8.0, weight:3.0, color:"#1D9E75", desc:"Expert judgment",   k:96 },
];

export const TIER_WEIGHTS = { 1:0.6, 2:1.0, 3:1.5 };
export const MAX_SCORE = 3*0.6 + 3*1.0 + 2*1.5; // = 7.8

export function getTier(s) { return TIERS.find(t => s >= t.min && s <= t.max) || TIERS[0]; }
