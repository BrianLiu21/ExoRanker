// ─── PHI: PROBABILISTIC HABITABILITY INDEX ────────────────────────────────────
// A multi-factor model replacing ESI as the hidden ground truth for voter
// accuracy scoring. Each sub-score is 0–1; PHI is a weighted combination.
//
// REAL DATA USED:   radius, mass, period, temp, dist, esi, st (stellar type),
//                   stAge (stellar age in Gyr)
// INFERRED/PROXIED: tidal lock probability, stellar activity, atmosphere
//                   retention, UV exposure
// ON VERCEL DEPLOY: NASA API supplies st_spectype & st_age directly, replacing
//                   the inferred values. Formula structure stays identical.
//
// Weights reflect current scientific consensus on habitability priorities:
//   HZ position     25% - most important single factor
//   Rocky/size      20% - bulk composition determines if surface conditions exist
//   Tidal lock      15% - severely constrains atmospheric circulation
//   Stellar activity 15% - atmospheric erosion on M-dwarfs is a major risk
//   Atmosphere ret. 10% - surface gravity + temp determines long-term retention
//   ESI              10% - bulk similarity proxy, already partially captured above
//   Observability    5%  - JWST practicality tiebreaker, lowest weight

// ── 1. Habitable zone position ────────────────────────────────────────────────
// Gaussian centered on 255K (Earth-equivalent), width tuned to standard HZ
export function phiHZScore(temp) {
  if (!temp || temp <= 0 || temp < 150 || temp > 420) return 0;
  return parseFloat(Math.exp(-Math.pow((temp - 255) / 62, 2)).toFixed(3));
}

// ── 2. Rocky / size probability ───────────────────────────────────────────────
// < 1.5 R⊕: almost certainly rocky (Chen & Kipping 2017)
// 1.5–2.0 R⊕: transition zone, likely volatile envelope
// > 2.0 R⊕: volatile-dominated, surface habitability unlikely
// > 4.0 R⊕: definitely gas-dominated
export function phiRockyScore(radius) {
  if (!radius) return 0;
  if (radius <= 1.5) return 1.0;
  if (radius <= 2.0) return parseFloat((1 - (radius - 1.5) / 1.0).toFixed(3));
  if (radius <= 4.0) return parseFloat(Math.max(0, 0.5 * (1 - (radius - 2.0) / 3.0)).toFixed(3));
  return 0;
}

// ── 3. Tidal locking penalty ──────────────────────────────────────────────────
// Orbital period is the best proxy for tidal locking without full stellar data.
// M-dwarf HZ is at ~0.05–0.3 AU → periods ~5–30 days → near-certain locking.
// K-dwarf HZ is at ~0.2–0.8 AU → periods ~20–200 days → possible at short end.
// G-dwarf HZ is at ~0.7–1.5 AU → periods ~180–500 days → almost never locked.
// ON DEPLOY: replace with actual tidal locking timescale from stellar mass + age.
export function phiTidalScore(period, st) {
  if (!period || period <= 0) return 0.5; // unknown - assume mid-risk
  const p = period;
  if (st === "M") {
    // Ultra-cool M-dwarfs: HZ at very short periods, locking nearly certain
    if (p < 5)   return 0.05; // almost certainly locked - severe penalty
    if (p < 12)  return 0.20; // very likely locked
    if (p < 25)  return 0.45; // probable
    if (p < 50)  return 0.70; // possible
    return 0.88;               // long period M-dwarf - unlikely locked
  }
  if (st === "K") {
    if (p < 10)  return 0.15;
    if (p < 30)  return 0.50;
    if (p < 80)  return 0.80;
    return 0.92;
  }
  if (st === "G") {
    if (p < 5)   return 0.25;
    if (p < 20)  return 0.70;
    return 0.95; // G-dwarf HZ planets (Earth-like periods) almost never locked
  }
  if (st === "F" || st === "A") return 0.96; // wide HZ, long periods
  if (st === "pulsar") return 0.0;  // irrelevant / uninhabitable
  if (st === "binary") return 0.70; // circumbinary - complex but often not locked
  // Fallback: infer from period alone
  if (p < 5)  return 0.10;
  if (p < 20) return 0.50;
  if (p < 50) return 0.75;
  return 0.88;
}

// ── 4. Stellar activity penalty ───────────────────────────────────────────────
// M-dwarfs emit strong UV/XUV, especially when young, stripping atmospheres.
// Age is the key moderator: young M-dwarfs are extremely active; old ones calm.
// K-dwarfs intermediate. G-dwarfs relatively benign. F/A negligible flare risk.
// ON DEPLOY: replace with actual st_logg and st_lum from NASA API for
//            proper EUV flux calculation (Lecavelier des Etangs 2007).
export function phiActivityScore(st, stAge) {
  if (st === "pulsar") return 0.0; // lethal radiation - hard zero
  if (st === "A" || st === "F") return 0.92; // low flare activity
  if (st === "G") {
    if (stAge === null) return 0.88;
    return stAge < 1 ? 0.72 : stAge < 3 ? 0.82 : 0.90;
  }
  if (st === "K") {
    if (stAge === null) return 0.78;
    return stAge < 1 ? 0.60 : stAge < 3 ? 0.72 : 0.82;
  }
  if (st === "M") {
    // M-dwarfs are most sensitive to age - older = much calmer
    if (stAge === null) return 0.52; // unknown age, assume moderately active
    if (stAge < 0.5) return 0.18;   // very young, extremely active
    if (stAge < 1.0) return 0.30;
    if (stAge < 2.0) return 0.42;
    if (stAge < 4.0) return 0.55;
    if (stAge < 7.0) return 0.68;
    return 0.76;                     // old M-dwarf - significantly calmer
  }
  if (st === "binary") return 0.70; // binary radiation environment complex
  return 0.65; // unknown type - conservative
}

// ── 5. Atmosphere retention ───────────────────────────────────────────────────
// Zahnle-Catling "cosmic shoreline": escape velocity vs XUV flux.
// Proxy: surface gravity (mass/radius²) vs thermal escape (temp/gravity ratio).
// Higher gravity + lower temp = better retention.
// ON DEPLOY: use actual stellar luminosity + distance for real XUV flux calc.
export function phiAtmosphereScore(radius, mass, temp) {
  if (!radius || !mass || mass <= 0) return 0.4; // unknown mass - mid estimate
  // Surface gravity relative to Earth (g ∝ mass/radius²)
  const gRel = mass / (radius * radius);
  // Jeans escape parameter proxy: gravity / temperature (higher = better retention)
  const retention = Math.min(1, gRel / (1 + temp / 1000));
  // Apply penalty for very low gravity or high temp
  const gScore = Math.min(1, Math.sqrt(gRel) * 0.9);
  const tScore = temp < 300 ? 1.0 : temp < 600 ? 0.75 : temp < 1000 ? 0.45 : 0.10;
  return parseFloat((0.55 * gScore + 0.45 * tScore).toFixed(3));
}

// ── 6. Observability ──────────────────────────────────────────────────────────
// JWST practicality: closer planets with shorter periods get more transits/year.
// Distance decay modeled as exponential; period benefit saturates at ~60 days.
export function phiObsScore(dist, period) {
  const d = dist > 0 ? Math.exp(-dist / 450) : 0;
  const p = period > 0 ? Math.min(1, 60 / Math.max(period, 0.5)) : 0;
  return parseFloat((0.55 * d + 0.45 * p).toFixed(3));
}

// ── COMPOSITE PHI ─────────────────────────────────────────────────────────────
export function calcPHI(p) {
  const hz  = phiHZScore(p.temp);
  const rk  = phiRockyScore(p.radius);
  const tl  = phiTidalScore(p.period, p.st);
  const act = phiActivityScore(p.st, p.stAge ?? null);
  const atm = phiAtmosphereScore(p.radius, p.mass, p.temp);
  const esi = p.esi || 0;
  const obs = phiObsScore(p.dist, p.period);
  const phi = 0.25*hz + 0.20*rk + 0.15*tl + 0.15*act + 0.10*atm + 0.10*esi + 0.05*obs;
  return parseFloat(Math.min(1, Math.max(0, phi)).toFixed(3));
}

export function phiComponents(p) {
  return {
    hz:    phiHZScore(p.temp),
    rk:    phiRockyScore(p.radius),
    tl:    phiTidalScore(p.period, p.st),
    act:   phiActivityScore(p.st, p.stAge ?? null),
    atm:   phiAtmosphereScore(p.radius, p.mass, p.temp),
    esi:   p.esi || 0,
    obs:   phiObsScore(p.dist, p.period),
    total: calcPHI(p),
  };
}

// Keep calcHabitability as alias so existing call sites work unchanged
export const calcHabitability = calcPHI;
export const habitabilityComponents = phiComponents;

export const HAB_LABEL = h => h >= 0.50 ? "Strong candidate" : h >= 0.30 ? "Moderate interest" : h >= 0.12 ? "Low priority" : "Exotic / benchmark";
export const HAB_COLOR = h => h >= 0.50 ? "#1D9E75" : h >= 0.30 ? "#EF9F27" : h >= 0.12 ? "#7F77DD" : "#E24B4A";
