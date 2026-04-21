// ─── JUDGMENT RATING TIER SYSTEM ─────────────────────────────────────────────
// JR starts at 1000 for everyone. Rises on correct votes, falls on wrong ones.
// Tier is derived live — no floor, drops are real.
// Quiz is an optional calibration that fast-tracks starting JR.
//
// Quiz fast-track:  0.0–2.0 pts → 1000  (Explorer)
//                   2.1–4.0 pts → 1100  (Observer range)
//                   4.1–6.0 pts → 1250  (Analyst range)
//                   6.1–7.8 pts → 1400  (Astronomer range)

export const USER_ELO_TIERS = [
  { id:'astronomer', minElo:1400, weight:3.0, color:'#1D9E75', label:'Astronomer', desc:'Expert judgment',   k:96 },
  { id:'analyst',    minElo:1200, weight:2.0, color:'#7F77DD', label:'Analyst',    desc:'Strong grasp',      k:64 },
  { id:'observer',   minElo:1050, weight:1.5, color:'#378ADD', label:'Observer',   desc:'Working knowledge', k:48 },
  { id:'explorer',   minElo:0,    weight:1.0, color:'#888780', label:'Explorer',   desc:'Building skill',    k:32 },
];

export function getTierFromElo(jr) {
  return USER_ELO_TIERS.find(t => (jr || 1000) >= t.minElo) || USER_ELO_TIERS[USER_ELO_TIERS.length - 1];
}

export function quizStartElo(quizScore) {
  if (quizScore >= 6.1) return 1400;
  if (quizScore >= 4.1) return 1250;
  if (quizScore >= 2.1) return 1100;
  return 1000;
}

// Everyone is on the same ladder — mode is kept for backwards compat only
export function getEffectiveTier(jr, _mode) {
  return getTierFromElo(jr);
}
