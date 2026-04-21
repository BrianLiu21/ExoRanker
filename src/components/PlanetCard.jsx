import { HC } from '../constants/colors';
import PlanetOrb from './primitives/PlanetOrb';

function tempZoneColor(temp) {
  if (temp >= 200 && temp <= 320) return '#1D9E75';
  if ((temp > 320 && temp <= 390) || (temp >= 155 && temp < 200)) return '#EF9F27';
  return '#E24B4A';
}

function tempZoneLabel(temp) {
  if (temp >= 200 && temp <= 320) return 'HZ';
  if (temp > 390 || temp < 155) return 'extreme';
  return null;
}

export default function PlanetCard({ planet, onClick }) {
  const c = HC[planet.hue] || HC.blue;
  const esiCol = planet.esi >= 0.7 ? '#1D9E75' : planet.esi >= 0.4 ? '#EF9F27' : '#888780';
  const tCol = tempZoneColor(planet.temp);
  const tLabel = tempZoneLabel(planet.temp);

  return (
    <div onClick={() => onClick && onClick(planet)} style={{
      position: 'relative', flex: 1,
      background: `linear-gradient(148deg, ${c.bg}fc 0%, #040b15fc 100%)`,
      border: `1px solid ${c.border}`,
      borderRadius: 16, padding: '22px 22px 16px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
      willChange: 'transform',
      overflow: 'hidden',
    }}
      onMouseEnter={e => {
        if (!onClick) return;
        e.currentTarget.style.transform = 'scale(1.025) translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 20px 52px ${c.accent}2a, 0 0 0 1px ${c.accent}44`;
        e.currentTarget.style.borderColor = c.accent;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = c.border;
      }}>

      {/* Top edge shimmer */}
      <div style={{ position: 'absolute', top: 0, left: '12%', right: '12%', height: 1, background: `linear-gradient(90deg, transparent, ${c.accent}88, transparent)`, pointerEvents: 'none' }} />

      {/* Corner glow */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at 100% 0%, ${c.accent}0d 0%, transparent 65%)`, pointerEvents: 'none' }} />

      {/* Planet orb + name block */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
        <PlanetOrb planet={planet} size={62} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 700, color: '#e8f4ff', letterSpacing: '0.04em', marginBottom: 4, lineHeight: 1.25 }}>
            {planet.name}
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: c.accent, marginBottom: 3, letterSpacing: '0.04em' }}>{planet.type}</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.42)' }}>{planet.host}</div>
        </div>
      </div>

      {/* Stats grid 2×3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 12px', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.1em' }}>RADIUS</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
            {planet.radius}<span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>× ⊕</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.1em' }}>MASS</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
            {planet.mass
              ? <>{planet.mass}<span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>× ⊕</span></>
              : <span style={{ color: 'rgba(255,255,255,0.22)' }}>—</span>}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.1em' }}>EQ. TEMP</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: tCol }}>
              {planet.temp}<span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}> K</span>
            </span>
            {tLabel && (
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 6, color: tCol, background: `${tCol}18`, border: `0.5px solid ${tCol}44`, borderRadius: 3, padding: '1px 5px', letterSpacing: '0.08em' }}>
                {tLabel}
              </span>
            )}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.1em' }}>PERIOD</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
            {planet.period < 1 ? `${(planet.period * 24).toFixed(1)}h` : `${planet.period}d`}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.1em' }}>DISTANCE</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
            {planet.dist < 1000 ? `${planet.dist} ly` : `${(planet.dist / 1000).toFixed(1)}k ly`}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.1em' }}>FOUND</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>{planet.year}</div>
        </div>
      </div>

      {/* ESI bar */}
      <div style={{ borderTop: `0.5px solid ${c.border}44`, paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em', flexShrink: 0 }}>ESI</span>
        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
          <div style={{ width: `${Math.round(planet.esi * 100)}%`, height: '100%', background: `linear-gradient(90deg, ${esiCol}88, ${esiCol})`, borderRadius: 2, boxShadow: `0 0 7px ${esiCol}55` }} />
        </div>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: esiCol, fontWeight: 'bold', minWidth: 30, textAlign: 'right' }}>{Math.round(planet.esi * 100)}%</span>
      </div>

      {/* Tags */}
      {planet.tags && planet.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
          {planet.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: `${c.text}88`, background: `${c.badge}55`, border: `0.5px solid ${c.border}44`, borderRadius: 4, padding: '2px 7px', letterSpacing: '0.05em' }}>{tag}</span>
          ))}
        </div>
      )}

      {onClick && (
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: `${c.accent}77`, letterSpacing: '0.08em' }}>full data →</span>
        </div>
      )}
    </div>
  );
}
