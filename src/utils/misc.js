// ─── MISCELLANEOUS UTILITY FUNCTIONS ─────────────────────────────────────────
import { calcHabitability } from './phi';

// ─── PLANET OF THE DAY ────────────────────────────────────────────────────────
export function getPlanetOfDay(planets) {
  if (!planets.length) return null;
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate();
  return planets[seed % planets.length];
}

// ─── PHI-WEIGHTED PAIR SELECTION ─────────────────────────────────────────────
// Higher tiers see pairs skewed toward higher-PHI planets.
// Explorer/Observer: fully random. Analyst: top 60%. Astronomer: top 40%.
// ─── PHI-WEIGHTED PAIR SELECTION ─────────────────────────────────────────────
// Planets sorted by PHI descending. Pool fraction shrinks as JR rises so
// higher-ranked users see progressively more challenging high-PHI matchups.
// Beginner (mode !== advanced): always full pool - learning needs variety.
// Advanced Explorer  (JR 800–1149):  top 90% - almost full, gentle skew
// Advanced Observer  (JR 1150–1299): top 70%
// Advanced Analyst   (JR 1300–1499): top 55%
// Advanced Astronomer(JR 1500+):     top 40% - only high-PHI candidates
export function buildWeightedQueue(planets, jr, mode) {
  const sorted = [...planets].sort((a,b) => calcHabitability(b) - calcHabitability(a));
  if (mode !== "advanced") return [...sorted].sort(()=>Math.random()-0.5).map(p=>p.id);

  // Map JR 800→1600+ to fraction 0.9→0.4 linearly, clamped
  const minJR = 700, maxJR = 1500;
  const t = Math.min(1, Math.max(0, (jr - minJR) / (maxJR - minJR)));
  const fraction = 0.9 - t * 0.5; // 0.9 at JR 800, 0.4 at JR 1600
  const poolSize = Math.max(8, Math.round(sorted.length * fraction));
  const pool = sorted.slice(0, poolSize);
  return [...pool].sort(()=>Math.random()-0.5).map(p=>p.id);
}
