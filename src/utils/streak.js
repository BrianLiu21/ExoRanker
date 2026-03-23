// ─── STREAK SYSTEM ───────────────────────────────────────────────────────────
// Linear multiplier: each correct scoreable vote adds 10% to K-factor.
// Capped at 3× (streak 20) so it stays meaningful without breaking ELO.
// Ties are neutral - they don't increment or reset the streak.
// One wrong scoreable answer resets to 0.
export const STREAK_CAP = 20;

export function streakMult(count) {
  return parseFloat(Math.min(3.0, 1 + Math.min(count, STREAK_CAP) * 0.1).toFixed(2));
}

// Color climbs through HSL from cool blue → purple → amber → teal → white-hot
// Interpolated in HSL space to stay vivid the whole way
export function streakColor(count) {
  if (count === 0) return "rgba(255,255,255,0.25)";
  const t = Math.min(count, STREAK_CAP) / STREAK_CAP; // 0..1
  // Hue: 220 (blue) → 280 (purple) → 40 (amber) → 160 (teal)
  // Saturation: 70% → 90% → 100%
  // Lightness: 55% → 60% → 65%
  const hue = t < 0.33
    ? 220 + t / 0.33 * 60          // blue → purple  (220→280)
    : t < 0.66
    ? 280 - (t - 0.33) / 0.33 * 240 // purple → amber (280→40)
    : 40  + (t - 0.66) / 0.34 * 120; // amber → teal   (40→160)
  const sat = Math.round(70 + t * 30);
  const lit  = Math.round(55 + t * 10);
  return `hsl(${Math.round(hue)},${sat}%,${lit}%)`;
}

export function streakLabel(count) {
  if (count === 0)  return null;
  if (count < 3)    return `${count} correct`;
  if (count < 5)    return `${count}× STREAK`;
  if (count < 10)   return `${count}× HOT STREAK`;
  if (count < 15)   return `${count}× ON FIRE`;
  return              `${count}× UNSTOPPABLE`;
}

export function getStreak(count) {
  return { mult: streakMult(count), color: streakColor(count), label: streakLabel(count) };
}
