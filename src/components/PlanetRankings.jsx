import { HC } from '../constants/colors';
import { rdColor, rdLabel } from '../utils/glicko2';
import PlanetOrb from './primitives/PlanetOrb';

export default function PlanetRankings({ planets, onViewDetail, lastVotedIds }) {
  const sorted = [...planets].sort((a, b) => (b.r || 1500) - (a.r || 1500));
  const recentIds = lastVotedIds || new Set();
  const totalMatchups = planets.reduce((s, p) => s + (p.matchups || 0), 0);

  const MEDAL = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.38)', marginBottom: 7, textTransform: 'uppercase' }}>
          Knowledge-weighted Glicko-2 · Crowdsourced consensus
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 24, fontWeight: 700, color: '#e8f4ff' }}>Planet Priority Index</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
            {planets.length} planets · {totalMatchups.toLocaleString()} votes
          </div>
        </div>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginTop: 5 }}>
          Habitability scores are hidden from voters. Rankings emerge from blind inference.
        </div>
      </div>

      {/* Top 3 podium */}
      {sorted.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {sorted.slice(0, 3).map((p, i) => {
            const c = HC[p.hue] || HC.blue;
            return (
              <div key={p.id} onClick={() => onViewDetail(p)}
                style={{
                  background: `linear-gradient(148deg, ${c.bg}ee, #040b14ee)`,
                  border: `1px solid ${MEDAL[i]}44`,
                  borderRadius: 12, padding: '14px 14px 12px',
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 32px ${MEDAL[i]}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                {/* Medal accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${MEDAL[i]}88, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: i === 0 ? 20 : 16, fontWeight: 900, color: MEDAL[i], lineHeight: 1 }}>#{i + 1}</span>
                  <PlanetOrb planet={p} size={28} />
                </div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, color: '#e8f4ff', marginBottom: 2, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{p.type}</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 16, fontWeight: 900, color: c.accent }}>{p.r || 1500}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{p.matchups || 0} votes · ±{p.rd || 350}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of list */}
      {sorted.slice(sorted.length >= 3 ? 3 : 0).map((p, i) => {
        const rank = (sorted.length >= 3 ? 3 : 0) + i;
        const c = HC[p.hue] || HC.blue;
        const isRecent = recentIds.has(p.id);
        const conf = Math.round((1 - Math.min(350, p.rd || 350) / 350) * 100);

        return (
          <div key={p.id} onClick={() => onViewDetail(p)}
            style={{
              display: 'grid', gridTemplateColumns: '36px 1fr auto',
              alignItems: 'center', gap: 12, padding: '11px 14px', marginBottom: 4, borderRadius: 10,
              background: isRecent ? `${c.bg}cc` : 'rgba(5,12,20,0.7)',
              border: isRecent ? `0.5px solid ${c.border}` : '0.5px solid rgba(255,255,255,0.055)',
              cursor: 'pointer',
              transition: 'background 0.22s, border-color 0.22s, transform 0.2s ease, box-shadow 0.2s ease',
              willChange: 'transform',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${c.bg}bb`; e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 20px ${c.accent}1a`; }}
            onMouseLeave={e => { e.currentTarget.style.background = isRecent ? `${c.bg}cc` : 'rgba(5,12,20,0.7)'; e.currentTarget.style.borderColor = isRecent ? c.border : 'rgba(255,255,255,0.055)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <div style={{ textAlign: 'center', fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>#{rank + 1}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PlanetOrb planet={p} size={26} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: '#e8f4ff' }}>{p.name}</div>
                  {isRecent && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: c.accent, background: `${c.accent}18`, border: `0.5px solid ${c.accent}44`, borderRadius: 3, padding: '1px 5px', letterSpacing: '0.08em' }}>JUST VOTED</div>}
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{p.type} · {p.host}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 15, fontWeight: 700, color: c.accent }}>{p.r || 1500}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 3 }}>
                <div style={{ width: 24, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <div style={{ width: `${conf}%`, height: '100%', background: rdColor(p.rd || 350), borderRadius: 1 }} />
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.38)' }}>{p.matchups || 0}v</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
