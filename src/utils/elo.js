// ─── USER JR (JUDGMENT RATING) ───────────────────────────────────────────────
// Standard ELO for users - intentionally simple, measures judgment skill.
// Separate from planet Glicko-2: planets need confidence intervals, users need volatility.
import { FALLBACK_PLANETS } from '../data/planets';

export function expectedScore(ra, rb) { return 1 / (1 + Math.pow(10, (rb - ra) / 400)); }
export function calcNewElo(r, exp, actual, k) { return Math.round(r + k * (actual - exp)); }

export function initPlanets(list) {
  return (list || FALLBACK_PLANETS).map(p => ({
    ...p, r:1500, rd:350, sigma:0.06, matchups:0,
  }));
}
