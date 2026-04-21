import { useState } from 'react';
import { useIsMobile } from '../utils/useIsMobile';
import { HC } from '../constants/colors';
import { habitabilityComponents, HAB_LABEL, HAB_COLOR } from '../utils/phi';
import { rdLabel, rdColor } from '../utils/glicko2';
import Planet3D from './Planet3D';
import ScoreBar from './primitives/ScoreBar';

export default function PlanetDetail({ planet, onBack, voted }) {
  const isMobile = useIsMobile();
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
        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${c.accent}88, transparent)`, pointerEvents: 'none' }} />

        {/* 3D planet visual */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Planet3D planet={planet} size={190} />
        </div>

        {/* Name block */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: `${c.accent}88`, letterSpacing: '0.22em', marginBottom: 6, textTransform: 'uppercase' }}>
            {planet.scope} · {planet.year}
          </div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 26, fontWeight: 900, color: '#e8f4ff', letterSpacing: '0.04em', marginBottom: 4 }}>{planet.name}</div>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 15, color: 'rgba(255,255,255,0.42)', fontStyle: 'italic', marginBottom: planet.tags?.length ? 14 : 0 }}>
            {planet.type} · {planet.host}
          </div>

          {/* Tags */}
          {planet.tags && planet.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {planet.tags.map(tag => (
                <span key={tag} style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: `${c.text}88`, background: `${c.badge}55`, border: `0.5px solid ${c.border}55`, borderRadius: 5, padding: '2px 8px', letterSpacing: '0.06em' }}>{tag}</span>
              ))}
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

      {/* PHI breakdown */}
      {voted ? (
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
      )}
    </div>
  );
}
