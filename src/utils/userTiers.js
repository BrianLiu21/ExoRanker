export const USER_ELO_TIERS = [
  { id:'astronomer', minElo:1400, weight:3.0, color:'#1D9E75', label:'Astronomer', desc:'Expert judgment',   k:96 },
  { id:'analyst',    minElo:1200, weight:2.0, color:'#7F77DD', label:'Analyst',    desc:'Strong grasp',      k:64 },
  { id:'observer',   minElo:1050, weight:1.5, color:'#378ADD', label:'Observer',   desc:'Working knowledge', k:48 },
  { id:'explorer',   minElo:0,    weight:1.0, color:'#888780', label:'Explorer',   desc:'Building skill',    k:32 },
];

export function getTierFromElo(jr) {
  return USER_ELO_TIERS.find(t => (jr || 1000) >= t.minElo) || USER_ELO_TIERS[USER_ELO_TIERS.length - 1];
}

export function getEffectiveTier(jr, _mode) {
  return getTierFromElo(jr);
}
