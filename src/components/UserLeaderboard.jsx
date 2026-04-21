import { SB_ON } from '../config/supabase';
import { getEffectiveTier, USER_ELO_TIERS } from '../utils/userTiers';
import TierBadge from './primitives/TierBadge';

const MEDAL = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function UserLeaderboard({ allUsers, currentUser, lastSync }) {
  const adv = allUsers.filter(u => u.mode === 'advanced');
  const list = [...adv].sort((a, b) => (b.jr || 1000) - (a.jr || 1000));

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.32)' }}>CONTRIBUTOR STANDINGS</div>
          {lastSync && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {SB_ON && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1D9E75', boxShadow: '0 0 6px #1D9E75', animation: 'orb-pulse 2s ease-in-out infinite' }} />}
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: SB_ON ? '#1D9E7566' : 'rgba(255,255,255,0.18)' }}>{SB_ON ? 'LIVE' : 'LOCAL'} · {lastSync}</div>
            </div>
          )}
        </div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 700, color: '#e8f4ff', marginBottom: 5 }}>Judgment Leaderboard</div>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, color: 'rgba(255,255,255,0.38)', fontStyle: 'italic' }}>
          Ranked by Judgment Rating. Rises on correct votes, falls on wrong ones. Tiers can drop.
        </div>
      </div>

      {list.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 14, background: 'rgba(5,12,20,0.5)' }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.22)', marginBottom: 10 }}>No contributors yet.</div>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', lineHeight: 1.6 }}>Share the link to invite others. Votes appear here in real time.</div>
        </div>
      )}

      {list.map((u, i) => {
        const tier = getEffectiveTier(u.jr || 1000, u.mode);
        const isMe = u.username === currentUser.username;
        const jrVal = u.jr || 1100;
        const nextT = [...USER_ELO_TIERS].sort((a, b) => a.minElo - b.minElo).find(t => t.minElo > jrVal);
        const curT = tier;
        const barPct = nextT
          ? Math.round(((jrVal - (curT.minElo || 700)) / (nextT.minElo - (curT.minElo || 700))) * 100)
          : 100;
        const initial = (u.username || '?')[0].toUpperCase();

        return (
          <div key={u.username}
            style={{
              padding: '14px 18px', marginBottom: 6, borderRadius: 12,
              background: isMe ? `rgba(29,158,117,0.07)` : 'rgba(5,12,20,0.72)',
              border: isMe ? '0.5px solid #1D9E7544' : '0.5px solid rgba(255,255,255,0.06)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              willChange: 'transform', position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 20px ${tier.color}1a`; e.currentTarget.style.borderColor = tier.color + '66'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = isMe ? '#1D9E7544' : 'rgba(255,255,255,0.06)'; }}>

            {isMe && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: '#1D9E75', borderRadius: '2px 0 0 2px' }} />}

            <div style={{ display: 'grid', gridTemplateColumns: '30px 36px 1fr auto', alignItems: 'center', gap: 12 }}>
              {/* Rank */}
              <div style={{ textAlign: 'center', fontFamily: "'Orbitron',sans-serif", fontSize: i < 3 ? 14 : 10, fontWeight: 700, color: i < 3 ? MEDAL[i] : 'rgba(255,255,255,0.3)' }}>
                #{i + 1}
              </div>
              {/* Avatar */}
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${tier.color}22`, border: `1.5px solid ${tier.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, color: tier.color }}>{initial}</span>
              </div>
              {/* Name + tier */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: isMe ? '#1D9E75' : '#e8f4ff' }}>{u.username}</span>
                  {isMe && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: '#1D9E75', background: 'rgba(29,158,117,0.12)', border: '0.5px solid #1D9E7544', borderRadius: 3, padding: '1px 5px' }}>YOU</span>}
                  <TierBadge tier={tier} sm />
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.28)' }}>
                  {u.totalVotes} votes · {Math.round(u.accuracy || 0)}% accuracy
                </div>
              </div>
              {/* JR */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900, color: tier.color, lineHeight: 1 }}>{jrVal}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>JR</div>
              </div>
            </div>

            {/* Progress to next tier */}
            <div style={{ marginTop: 10, paddingLeft: 78 }}>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
                <div style={{ width: `${Math.min(100, barPct)}%`, height: '100%', background: nextT ? nextT.color : tier.color, borderRadius: 1, transition: 'width 0.5s', boxShadow: nextT ? `0 0 6px ${nextT.color}44` : 'none' }} />
              </div>
              {nextT && (
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>
                  {nextT.minElo - jrVal} JR to {nextT.label}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
