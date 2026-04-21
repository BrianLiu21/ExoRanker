import { useState } from 'react';
import { useIsMobile } from '../utils/useIsMobile';
import { HC } from '../constants/colors';
import { habitabilityComponents, HAB_LABEL, HAB_COLOR } from '../utils/phi';
import { rdLabel, rdColor } from '../utils/glicko2';
import Planet3D from './Planet3D';
import PlanetOrb from './primitives/PlanetOrb';
import ScoreBar from './primitives/ScoreBar';

const PLANET_TYPE_DESCRIPTIONS = {
  'Earth-size':      'A planet close to Earth\'s size. Rocky surface is likely, making these the most promising candidates for liquid water and potentially life.',
  'Super-Earth':     'Larger than Earth but smaller than Neptune. Could be rocky with a thick atmosphere, or a water world. Scientists are not yet sure which.',
  'Hycean World':    'A theorised class of ocean-covered world with a hydrogen-rich atmosphere. Could potentially support microbial life even under conditions hostile to land-based organisms.',
  'Sub-Neptune':     'Smaller than Neptune but bigger than Earth, likely wrapped in a thick hydrogen or water-vapour envelope. Probably no solid surface, but one of the most common planet types found by Kepler.',
  'Hot Sub-Neptune': 'A Sub-Neptune orbiting very close to its star. The intense heat puffs up its atmosphere, making it easier for JWST to study — but habitability is essentially zero.',
  'Hot Neptune':     'A Neptune-sized planet baking in the heat of a close orbit. Rare in the galaxy, possibly because the stellar radiation strips away the atmosphere over time.',
  'Ice Giant':       'A cold, distant world made mostly of water, ammonia, and methane ices beneath a thick gas envelope — similar to Uranus or Neptune in our solar system.',
  'Gas Giant':       'A massive planet made mostly of gas, like Jupiter or Saturn. Too hostile for life as we know it, but useful as an atmospheric chemistry benchmark for JWST.',
  'Hot Saturn':      'A puffy gas giant baked by its nearby star. Its bloated, low-density atmosphere is one of the easiest targets for transmission spectroscopy with JWST.',
  'Hot Jupiter':     'A giant gas planet orbiting so close to its star that surface temperatures exceed those of some stars. Scientifically fascinating but almost certainly lifeless.',
  'Lava World':      'A rocky planet so close to its star that its surface is likely entirely molten. Extreme temperatures make it uninhabitable but scientifically extreme.',
  'Cold Jupiter':    'A Jupiter-sized gas giant in a wide, cold orbit — similar to our own Jupiter. Rarely transits its star, so hard to study, but important for understanding solar system formation.',
};

export default function PlanetDetail({ planet, onBack, voted, userMode }) {
  const isMobile = useIsMobile();
  const isAdvanced = userMode === 'advanced';
  const c = HC[planet.hue] || HC.blue;
  const hc = habitabilityComponents(planet);
  const habColor = HAB_COLOR(hc.total);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.42)', padding: '7px 14px', borderRadius: 6,
        fontFamily: "'Space Mono',monospace", fontSize: 9, cursor: 'pointer',
        marginBottom: 24, letterSpacing: '0.1em',
        transition: 'border-color 0.15s, color 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; }}>
        ← BACK
      </button>

      {/* Main card */}
      <div style={{ background: `linear-gradient(148deg, ${c.bg}e8, #050c14e8)`, border: `1px solid ${c.border}`, borderRadius: 18, padding: '28px 28px 24px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        {/* Top glow */}
        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${c.accent}88, transparent)`, pointerEvents: 'none' }} />

        {/* 3D / 2D planet visual */}
        {isAdvanced ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Planet3D planet={planet} size={190} />
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
            <PlanetOrb planet={planet} size={100} pulse />
          </div>
        )}

        {/* Name block */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: `${c.accent}88`, letterSpacing: '0.22em', marginBottom: 6, textTransform: 'uppercase' }}>
            {planet.scope} · {planet.year}
          </div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 26, fontWeight: 900, color: '#e8f4ff', letterSpacing: '0.04em', marginBottom: 4 }}>{planet.name}</div>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 15, color: 'rgba(255,255,255,0.42)', fontStyle: 'italic', marginBottom: planet.tags?.length || !isAdvanced ? 14 : 0 }}>
            {planet.type} · {planet.host}
          </div>

          {/* Tags */}
          {planet.tags && planet.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: !isAdvanced ? 0 : 4 }}>
              {planet.tags.map(tag => (
                <span key={tag} style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: `${c.text}88`, background: `${c.badge}55`, border: `0.5px solid ${c.border}55`, borderRadius: 5, padding: '2px 8px', letterSpacing: '0.06em' }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Beginner type description */}
          {!isAdvanced && PLANET_TYPE_DESCRIPTIONS[planet.type] && (
            <div style={{ background: 'rgba(55,138,221,0.06)', border: '0.5px solid #378ADD2a', borderRadius: 8, padding: '10px 14px', marginTop: 12, textAlign: 'left' }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: '#378ADD88', letterSpacing: '0.12em', marginRight: 8 }}>WHAT IS THIS?</span>
              <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{PLANET_TYPE_DESCRIPTIONS[planet.type]}</span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 8 }}>
          {[
            ['Radius', `${planet.radius}× ⊕`],
            ['Mass', planet.mass ? `${planet.mass}× ⊕` : '—'],
            ['Eq. Temp', `${planet.temp} K`],
            ['Period', planet.period < 1 ? `${(planet.period * 24).toFixed(1)}h` : `${planet.period}d`],
            ['Distance', planet.dist < 1000 ? `${planet.dist} ly` : `${(planet.dist / 1000).toFixed(1)}k ly`],
            ['Host star', planet.host],
            ['Community rating', planet.r || 1500],
            ['Confidence', rdLabel(planet.rd || 350)],
          ].map(([k, v]) => (
            <div key={k} style={{ background: 'rgba(0,0,0,0.24)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', marginBottom: 4 }}>{k.toUpperCase()}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.88)', fontWeight: 'bold', lineHeight: 1.3 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Community rating strip */}
      <div style={{ background: 'rgba(5,12,20,0.6)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900, color: rdColor(planet.rd || 350) }}>{planet.r || 1500}</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.28)' }}>±{planet.rd || 350}</div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>COMMUNITY RATING</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: rdColor(planet.rd || 350) }}>{rdLabel(planet.rd || 350)}</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
            <div style={{ width: `${Math.round((1 - Math.min(350, planet.rd || 350) / 350) * 100)}%`, height: '100%', background: rdColor(planet.rd || 350), borderRadius: 2, transition: 'width 0.5s' }} />
          </div>
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.22)', maxWidth: 160, lineHeight: 1.6 }}>
          {planet.matchups || 0} matchups · more votes = narrower ±
        </div>
      </div>

      {/* PHI breakdown — advanced only */}
      {isAdvanced && (voted ? (
        <div style={{ background: 'rgba(5,12,20,0.85)', border: `0.5px solid ${habColor}44`, borderRadius: 16, padding: '22px 26px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: habColor, boxShadow: `0 0 8px ${habColor}` }} />
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, color: habColor, letterSpacing: '0.15em' }}>HABITABILITY BREAKDOWN</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 24, fontWeight: 900, color: habColor, lineHeight: 1 }}>
                {Math.round(hc.total * 100)}<span style={{ fontSize: 12, opacity: 0.55 }}>/100</span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{HAB_LABEL(hc.total)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ScoreBar value={hc.hz}  color="#1D9E75" label="HZ POSITION (eq. temp vs 255K) · 25%" />
            <ScoreBar value={hc.rk}  color="#378ADD" label="ROCKY LIKELIHOOD (radius class) · 20%" />
            <ScoreBar value={hc.tl}  color="#7F77DD" label="TIDAL LOCK SAFETY (period + star type) · 15%" />
            <ScoreBar value={hc.act} color="#EF9F27" label="STELLAR ACTIVITY (star type + age) · 15%" />
            <ScoreBar value={hc.atm} color="#B5D4F4" label="ATMOSPHERE RETENTION (gravity + temp) · 10%" />
            <ScoreBar value={hc.esi} color="#9FE1CB" label="EARTH SIMILARITY INDEX (ESI) · 10%" />
            <ScoreBar value={hc.obs} color="#888780" label="OBSERVABILITY (distance + transit freq) · 5%" />
          </div>
          <div style={{ marginTop: 16, fontFamily: "'Crimson Pro',serif", fontSize: 12, color: 'rgba(255,255,255,0.32)', fontStyle: 'italic', lineHeight: 1.6 }}>
            PHI — Probabilistic Habitability Index. Hidden ground truth for voter accuracy scoring.
            {planet.st && <span> Host: <span style={{ color: 'rgba(255,255,255,0.52)' }}>{planet.st}-type</span>{planet.stAge ? `, ~${planet.stAge} Gyr` : ''}.</span>}
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(5,12,20,0.6)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 26px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em', marginBottom: 8 }}>HABITABILITY BREAKDOWN · LOCKED</div>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14, color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>Vote on this planet in a matchup to unlock its full PHI breakdown.</div>
        </div>
      ))}
    </div>
  );
}
