// ─── GLICKO-2: PLANET RANKINGS ───────────────────────────────────────────────
// Each planet has: r (rating, ~1500), rd (deviation, ~350→50), sigma (volatility)
// rd = confidence: high RD = uncertain rank (few matchups), low RD = reliable
// After each matchup both planets' r, rd, sigma update.
// Voter weight (1–3×) biases the outcome score so expert votes move ratings more.

const G2_TAU = 0.5;
const G2_EPS = 1e-6;

function _g(rd)       { return 1 / Math.sqrt(1 + 3 * rd * rd / (Math.PI * Math.PI * 173.7178 * 173.7178 / (Math.log(10) * Math.log(10) / 160000))); }
function _gRaw(phiRaw){ return 1 / Math.sqrt(1 + 3 * phiRaw * phiRaw / (Math.PI * Math.PI)); }
function _E(mu, muj, phij) { return 1 / (1 + Math.exp(-_gRaw(phij) * (mu - muj))); }

export function glicko2Update(r, rd, sigma, opponents) {
  // Convert to Glicko-2 scale
  const mu  = (r  - 1500) / 173.7178;
  const phi = rd / 173.7178;

  if (!opponents.length) {
    // No matches: inflate rd toward max uncertainty
    return { r, rd: Math.min(350, Math.round(Math.sqrt(rd*rd + sigma*sigma*173.7178*173.7178))), sigma };
  }

  // Estimated variance v
  let v = 0;
  for (const o of opponents) {
    const muj  = (o.r  - 1500) / 173.7178;
    const phij = o.rd / 173.7178;
    const gj   = _gRaw(phij);
    const Ej   = _E(mu, muj, phij);
    v += gj * gj * Ej * (1 - Ej);
  }
  if (v === 0 || !isFinite(v)) return { r, rd, sigma };
  v = 1 / v;

  // Delta
  let delta = 0;
  for (const o of opponents) {
    const muj  = (o.r  - 1500) / 173.7178;
    const phij = o.rd / 173.7178;
    const gj   = _gRaw(phij);
    const Ej   = _E(mu, muj, phij);
    delta += gj * (o.outcome - Ej);
  }
  delta *= v;

  // New volatility via Illinois algorithm
  const a = Math.log(sigma * sigma);
  function _f(x) {
    const ex  = Math.exp(x);
    const pp  = phi * phi;
    const tmp = pp + v + ex;
    return (ex * (delta*delta - pp - v - ex)) / (2*tmp*tmp) - (x - a) / (G2_TAU * G2_TAU);
  }
  let A = a;
  let B = delta*delta > phi*phi + v
    ? Math.log(delta*delta - phi*phi - v)
    : (() => { let k=1; while(_f(a - k*G2_TAU) < 0) k++; return a - k*G2_TAU; })();
  let fA = _f(A), fB = _f(B);
  let iter = 0;
  while (Math.abs(B - A) > G2_EPS && iter++ < 100) {
    const denom = fB - fA;
    if (denom === 0) break;
    const C = A + (A - B) * fA / denom;
    const fC = _f(C);
    if (!isFinite(fC)) break;
    if (fC * fB <= 0) { A = B; fA = fB; } else fA /= 2;
    B = C; fB = fC;
  }
  const sigmaNew = Math.exp(A / 2);
  const phiStar  = Math.sqrt(phi*phi + sigmaNew*sigmaNew);
  const phiNew   = 1 / Math.sqrt(1/(phiStar*phiStar) + 1/v);
  let muNew = mu;
  for (const o of opponents) {
    const muj  = (o.r  - 1500) / 173.7178;
    const phij = o.rd / 173.7178;
    const gj   = _gRaw(phij);
    const Ej   = _E(mu, muj, phij);
    muNew += phiNew*phiNew * gj * (o.outcome - Ej);
  }
  return {
    r:     Math.round(muNew * 173.7178 + 1500),
    rd:    Math.min(350, Math.round(phiNew * 173.7178)),
    sigma: parseFloat(sigmaNew.toFixed(6)),
  };
}

// Single matchup between two planets; voterWeight biases outcome toward expert votes
export function glicko2Matchup(pa, pb, winnerId, voterWeight) {
  const w = Math.min(3.0, Math.max(0.0, voterWeight || 1.0));
  // Outcome ranges 0.5±0.5 scaled by weight relative to max weight 3
  const bias = 0.5 * (w / 3.0);
  const scoreA = winnerId === pa.id ? 0.5 + bias : 0.5 - bias;
  const scoreB = 1 - scoreA;
  const resA = glicko2Update(pa.r||1500, pa.rd||350, pa.sigma||0.06, [{ r:pb.r||1500, rd:pb.rd||350, outcome:scoreA }]);
  const resB = glicko2Update(pb.r||1500, pb.rd||350, pb.sigma||0.06, [{ r:pa.r||1500, rd:pa.rd||350, outcome:scoreB }]);
  return {
    pa: { ...pa, ...resA, matchups:(pa.matchups||0)+1 },
    pb: { ...pb, ...resB, matchups:(pb.matchups||0)+1 },
  };
}

export function rdLabel(rd) {
  if (rd < 60)  return "High confidence";
  if (rd < 120) return "Reliable";
  if (rd < 200) return "Moderate";
  if (rd < 280) return "Uncertain";
  return "Few matchups";
}

export function rdColor(rd) {
  if (rd < 60)  return "#1D9E75";
  if (rd < 120) return "#378ADD";
  if (rd < 200) return "#EF9F27";
  if (rd < 280) return "#E24B4A";
  return "#888780";
}
