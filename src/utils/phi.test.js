import { describe, it, expect } from 'vitest';
import { phiHZScore, phiRockyScore, calcHabitability, habitabilityComponents } from './phi';
import { calcESI, classifyType, enrichNASARow } from './nasa';
import { glicko2Matchup } from './glicko2';

// ─── PHI: Habitable Zone Score ────────────────────────────────────────────────
describe('phiHZScore', () => {
  it('peaks near 255K', () => {
    expect(phiHZScore(255)).toBeCloseTo(1.0, 2);
  });
  it('returns 0 for very hot planets', () => {
    expect(phiHZScore(2000)).toBe(0);
  });
  it('returns 0 for very cold planets', () => {
    expect(phiHZScore(100)).toBe(0);
  });
  it('Earth temp (288K) scores above 0.7', () => {
    expect(phiHZScore(288)).toBeGreaterThan(0.7);
  });
  it('lava world (2400K) scores 0', () => {
    expect(phiHZScore(2400)).toBe(0);
  });
});

// ─── PHI: Rocky Score ─────────────────────────────────────────────────────────
describe('phiRockyScore', () => {
  it('Earth-size (1.0 R⊕) is fully rocky', () => {
    expect(phiRockyScore(1.0)).toBe(1.0);
  });
  it('1.5 R⊕ boundary is still fully rocky', () => {
    expect(phiRockyScore(1.5)).toBe(1.0);
  });
  it('2.0 R⊕ is in the transition zone', () => {
    expect(phiRockyScore(2.0)).toBeGreaterThan(0);
    expect(phiRockyScore(2.0)).toBeLessThan(1);
  });
  it('gas giant (15 R⊕) scores 0', () => {
    expect(phiRockyScore(15)).toBe(0);
  });
});

// ─── PHI: Full habitability score ─────────────────────────────────────────────
describe('calcHabitability', () => {
  it('Earth-like planet scores high', () => {
    const score = calcHabitability({ radius: 1.0, temp: 288, period: 365, dist: 1, esi: 0.98, st: 'G' });
    expect(score).toBeGreaterThan(0.5);
  });
  it('Hot Jupiter scores low', () => {
    const score = calcHabitability({ radius: 14, temp: 1800, period: 3, dist: 200, esi: 0.0 });
    expect(score).toBeLessThan(0.25);
  });
  it('returns a number between 0 and 1', () => {
    const s = calcHabitability({ radius: 1.5, temp: 260, period: 50, dist: 40, esi: 0.8, st: 'K' });
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(1);
  });
  it('TRAPPIST-1e type planet scores well', () => {
    const s = calcHabitability({ radius: 0.91, temp: 251, period: 6.1, dist: 40, esi: 0.85, st: 'M', stAge: 7.6 });
    expect(s).toBeGreaterThan(0.3);
  });
});

// ─── PHI: Component breakdown ─────────────────────────────────────────────────
describe('habitabilityComponents', () => {
  it('all components are between 0 and 1', () => {
    const hc = habitabilityComponents({ radius: 1.2, temp: 265, period: 30, dist: 50, esi: 0.8, st: 'K' });
    for (const key of ['hz', 'rk', 'tl', 'act', 'atm', 'esi', 'obs']) {
      expect(hc[key]).toBeGreaterThanOrEqual(0);
      expect(hc[key]).toBeLessThanOrEqual(1);
    }
  });
  it('total matches weighted sum', () => {
    const hc = habitabilityComponents({ radius: 1.2, temp: 265, period: 30, dist: 50, esi: 0.8, st: 'K' });
    const expected = hc.hz*0.25 + hc.rk*0.20 + hc.tl*0.15 + hc.act*0.15 + hc.atm*0.10 + hc.esi*0.10 + hc.obs*0.05;
    expect(hc.total).toBeCloseTo(expected, 2);
  });
});

// ─── NASA: ESI ────────────────────────────────────────────────────────────────
describe('calcESI', () => {
  it('Earth vs itself is 1.0', () => {
    expect(calcESI(1.0, 288)).toBeCloseTo(1.0, 2);
  });
  it('large hot planet is near 0', () => {
    expect(calcESI(14, 1800)).toBeLessThan(0.1);
  });
  it('returns 0 for invalid input', () => {
    expect(calcESI(0, 288)).toBe(0);
    expect(calcESI(1, 0)).toBe(0);
  });
  it('result is always between 0 and 1', () => {
    expect(calcESI(2.5, 300)).toBeGreaterThanOrEqual(0);
    expect(calcESI(2.5, 300)).toBeLessThanOrEqual(1);
  });
});

// ─── NASA: classifyType ───────────────────────────────────────────────────────
describe('classifyType', () => {
  it('small rocky Earth-like → Earth-size', () => {
    expect(classifyType(1.0, 280)).toBe('Earth-size');
  });
  it('small very hot → Lava World', () => {
    expect(classifyType(1.0, 1500)).toBe('Lava World');
  });
  it('large hot → Hot Jupiter', () => {
    expect(classifyType(18, 1800)).toBe('Hot Jupiter');
  });
  it('HZ sub-Neptune → Hycean World', () => {
    expect(classifyType(2.5, 280)).toBe('Hycean World');
  });
  it('large cold → Cold Jupiter', () => {
    expect(classifyType(18, 500)).toBe('Cold Jupiter');
  });
  it('mid gas cold → Gas Giant', () => {
    expect(classifyType(10, 400)).toBe('Gas Giant');
  });
});

// ─── NASA: enrichNASARow ──────────────────────────────────────────────────────
describe('enrichNASARow', () => {
  const row = {
    pl_name: 'Test b', hostname: 'Test Star',
    pl_rade: 1.1, pl_bmasse: 1.3, pl_orbper: 20, pl_eqt: 270,
    sy_dist: 30, ra: 100, dec: -20,
    st_spectype: 'M2V', st_age: 5.0,
    disc_year: 2022, disc_facility: 'TESS', discoverymethod: 'Transit',
  };

  it('returns a valid planet object', () => {
    const p = enrichNASARow(row);
    expect(p).not.toBeNull();
    expect(p.name).toBe('Test b');
    expect(p.type).toBeTruthy();
    expect(p.esi).toBeGreaterThanOrEqual(0);
  });

  it('converts parsecs to light-years', () => {
    const p = enrichNASARow(row);
    expect(p.dist).toBeCloseTo(30 * 3.26156, 0);
  });

  it('infers star type from spectype', () => {
    const p = enrichNASARow(row);
    expect(p.st).toBe('M');
  });

  it('passes through ra and dec', () => {
    const p = enrichNASARow(row);
    expect(p.ra).toBe(100);
    expect(p.dec).toBe(-20);
  });

  it('returns null for missing required fields', () => {
    expect(enrichNASARow({ pl_name: 'X', hostname: 'Y' })).toBeNull();
  });
});

// ─── Glicko-2: matchup ────────────────────────────────────────────────────────
describe('glicko2Matchup', () => {
  const def = { r: 1500, rd: 350, sigma: 0.06, matchups: 0 };

  it('winner gains rating, loser loses', () => {
    const pA = { ...def, id: 'a' };
    const pB = { ...def, id: 'b' };
    const { pa, pb } = glicko2Matchup(pA, pB, 'a', 1);
    expect(pa.r).toBeGreaterThan(1500);
    expect(pb.r).toBeLessThan(1500);
  });

  it('matchup count increments', () => {
    const { pa, pb } = glicko2Matchup({ ...def, id: 'a' }, { ...def, id: 'b' }, 'a', 1);
    expect(pa.matchups).toBe(1);
    expect(pb.matchups).toBe(1);
  });

  it('upset win: underdog gains more than favourite loses', () => {
    const strong = { id: 'a', r: 1900, rd: 80,  sigma: 0.06, matchups: 20 };
    const weak   = { id: 'b', r: 1100, rd: 300, sigma: 0.06, matchups: 2  };
    const { pa: loser, pb: upset } = glicko2Matchup(strong, weak, 'b', 1);
    expect(upset.r - 1100).toBeGreaterThan(1900 - loser.r);
  });

  it('rd decreases after a matchup (more certainty)', () => {
    const { pa } = glicko2Matchup({ ...def, id: 'a' }, { ...def, id: 'b' }, 'a', 1);
    expect(pa.rd).toBeLessThan(350);
  });
});
