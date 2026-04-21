import { getEffectiveTier, USER_ELO_TIERS } from '../utils/userTiers';
import TierBadge from './primitives/TierBadge';

export default function MyProfile({ user, onSignOut }) {
  const tier = getEffectiveTier(user.jr || 1000);
  const jr = user.jr || 1000;

  const sorted = [...USER_ELO_TIERS].sort((a, b) => a.minElo - b.minElo);
  const nextTier = sorted.find(t => t.minElo > jr);
  const eloToNext = nextTier ? nextTier.minElo - jr : 0;
  const initial = (user.username || '?')[0].toUpperCase();

  const STATS = [
    { k: 'JR', v: jr, color: tier.color, large: true },
    { k: 'Accuracy', v: user.totalVotes > 0 ? `${Math.round(user.accuracy)}%` : '—', color: user.accuracy >= 65 ? '#1D9E75' : user.accuracy >= 45 ? '#EF9F27' : null },
    { k: 'Vote weight', v: `${tier.weight}×` },
    { k: 'Influence', v: Math.round(user.influence || 0) },
    { k: 'Streak', v: user.streak || 0, color: (user.streak || 0) >= 5 ? '#EF9F27' : null },
    { k: 'Best streak', v: user.bestStreak || 0 },
    { k: 'Total votes', v: user.totalVotes },
  ];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>

      {/* Profile card */}
      <div style={{ background: 'rgba(5,12,20,0.9)', border: `1px solid ${tier.color}44`, borderRadius: 18, padding: '28px 28px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: `linear-gradient(90deg, transparent, ${tier.color}66, transparent)` }} />

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26 }}>
          <div style={{ width: 58, height: 58, borderRadius: '50%', background: `${tier.color}18`, border: `2px solid ${tier.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${tier.color}22`, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900, color: tier.color }}>{initial}</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 700, color: '#e8f4ff', marginBottom: 5 }}>{user.username}</div>
            <TierBadge tier={tier} />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 20 }}>
          {STATS.map(({ k, v, color, large }) => (
            <div key={k} style={{ background: 'rgba(0,0,0,0.28)', borderRadius: 9, padding: '12px 14px' }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', marginBottom: 5 }}>{k.toUpperCase()}</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: large ? 22 : 18, fontWeight: 700, color: color || 'rgba(255,255,255,0.88)', lineHeight: 1 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Accuracy sparkline */}
        {(user.voteHistory || []).length >= 3 && (
          <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em' }}>
                ACCURACY · LAST {Math.min((user.voteHistory || []).length, 20)} VOTES
              </div>
              {(() => {
                const h = (user.voteHistory || []).slice(-20);
                const r5 = h.slice(-5), p5 = h.slice(-10, -5);
                const r5a = r5.reduce((a, b) => a + b, 0) / r5.length;
                const p5a = p5.length ? p5.reduce((a, b) => a + b, 0) / p5.length : r5a;
                const trend = r5a - p5a;
                const tc = trend > 0.1 ? '#1D9E75' : trend < -0.1 ? '#E24B4A' : '#888780';
                const tl = trend > 0.1 ? '↑ improving' : trend < -0.1 ? '↓ slipping' : '→ stable';
                return <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: tc }}>{tl}</span>;
              })()}
            </div>
            {(() => {
              const h = (user.voteHistory || []).slice(-20);
              const W = 400, H = 48, pad = 6;
              const n = h.length;
              if (n < 2) return null;
              const pts = h.map((v, i) => ({
                x: pad + (i / (n - 1)) * (W - pad * 2),
                y: H - pad - (v * (H - pad * 2)),
              }));
              const d = 'M' + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L');
              const last = pts[pts.length - 1];
              const lastCorrect = h[h.length - 1] === 1;
              const dotColor = lastCorrect ? '#1D9E75' : '#E24B4A';
              return (
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 48, display: 'block' }}>
                  <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />
                  <text x={pad} y={H / 2 - 3} fontFamily="monospace" fontSize="7" fill="rgba(255,255,255,0.18)">50%</text>
                  <path d={`${d}L${pts[n-1].x},${H-pad}L${pts[0].x},${H-pad}Z`} fill="#378ADD" fillOpacity="0.07" />
                  <path d={d} fill="none" stroke="#378ADD" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx={last.x} cy={last.y} r="3.5" fill={dotColor} filter={`drop-shadow(0 0 4px ${dotColor})`} />
                </svg>
              );
            })()}
          </div>
        )}

        {/* JR Tier ladder */}
        <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', marginBottom: 12 }}>JR TIER LADDER</div>
          {[...USER_ELO_TIERS].reverse().map(t => {
            const active = t.id === tier.id;
            const achieved = jr >= t.minElo;
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, padding: '6px 10px', borderRadius: 7, background: active ? `${t.color}14` : 'transparent', border: active ? `0.5px solid ${t.color}33` : 'none' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: achieved ? t.color : 'rgba(255,255,255,0.12)', boxShadow: active ? `0 0 8px ${t.color}` : 'none', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, color: achieved ? t.color : 'rgba(255,255,255,0.2)', fontWeight: active ? 700 : 400, flex: 1 }}>{t.label}</span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.22)' }}>≥{t.minElo} · {t.weight}×</span>
                {active && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: t.color }}>← {jr}</span>}
              </div>
            );
          })}
          {nextTier && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.22)' }}>to {nextTier.label}</span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: nextTier.color }}>{eloToNext} JR needed</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ width: `${Math.round(((jr - (tier.minElo || 0)) / (nextTier.minElo - (tier.minElo || 0))) * 100)}%`, height: '100%', background: nextTier.color, borderRadius: 2, transition: 'width 0.5s', boxShadow: `0 0 6px ${nextTier.color}44` }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 18 }}>
          Correct votes on high-gap pairs earn more JR. Wrong answers lose it. As your JR rises, matchups are drawn from a smaller, harder pool of scientifically similar planets.
        </div>

        <button onClick={onSignOut} style={{ width: '100%', fontFamily: "'Space Mono',monospace", fontSize: 9, padding: '10px 0', borderRadius: 8, cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.22)', border: '0.5px solid rgba(255,255,255,0.08)', letterSpacing: '0.1em' }}>
          sign out
        </button>
      </div>
    </div>
  );
}
