import { useState, useEffect, useCallback, useRef } from 'react';
import { HC } from '../constants/colors';
import { getEffectiveTier } from '../utils/userTiers';
import { getStreak } from '../utils/streak';
import { getPlanetOfDay, buildWeightedQueue } from '../utils/misc';
import { useIsMobile } from '../utils/useIsMobile';
import PlanetCard from './PlanetCard';
import TierBadge from './primitives/TierBadge';

export default function VoteArena({ planets, user, onVote, onViewDetail, onNextPair, votedIds, onPrioritize }) {
  const isMobile = useIsMobile();
  const [pair, setPair] = useState(null);
  const [voted, setVoted] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [eloShift, setEloShift] = useState(null);

  const todayKey = new Date().toISOString().slice(0, 10);
  const [potdDismissed, setPotdDismissed] = useState(false);
  const [potdPrioritized, setPotdPrioritized] = useState(() => {
    try { return localStorage.getItem('er_potd_voted') === todayKey; } catch { return false; }
  });
  const dismissPotd = () => setPotdDismissed(true);
  const handlePrioritize = (planetId) => {
    if (potdPrioritized) return;
    setPotdPrioritized(true);
    try { localStorage.setItem('er_potd_voted', todayKey); } catch {}
    onPrioritize?.(planetId);
  };

  const [showTutorial, setShowTutorial] = useState(!user.tutorialDone && (user.totalVotes || 0) < 3);
  const dismissTutorial = () => {
    setShowTutorial(false);
    if (!user.tutorialDone) {
      const updated = { ...user, tutorialDone: true };
      try { localStorage.setItem('er_user1', JSON.stringify(updated)); } catch {}
    }
  };

  const queueRef = useRef([]);
  const planetsRef = useRef(planets);
  useEffect(() => { planetsRef.current = planets; }, [planets]);
  const tier = getEffectiveTier(user.jr || 1000);

  const pickPair = useCallback(ps => {
    if (queueRef.current.length < 2) {
      queueRef.current = buildWeightedQueue(ps, user.jr || 1000);
    }
    const idA = queueRef.current.shift();
    const idxB = queueRef.current.findIndex(id => id !== idA);
    const idB = idxB >= 0 ? queueRef.current.splice(idxB, 1)[0] : queueRef.current.shift();
    const pa = ps.find(x => x.id === idA), pb = ps.find(x => x.id === idB);
    if (pa && pb) {
      setPair([pa, pb]); setVoted(null); setEloShift(null);
    } else {
      queueRef.current = buildWeightedQueue(ps, user.jr || 1000);
      const a2 = queueRef.current.shift();
      const i2 = queueRef.current.findIndex(id => id !== a2);
      const b2 = i2 >= 0 ? queueRef.current.splice(i2, 1)[0] : queueRef.current.shift();
      const pa2 = ps.find(x => x.id === a2), pb2 = ps.find(x => x.id === b2);
      if (pa2 && pb2) { setPair([pa2, pb2]); setVoted(null); setEloShift(null); }
    }
  }, [user.jr]);

  useEffect(() => { if (planets.length >= 2) pickPair(planets); }, []);

  const handleVote = (winnerId) => {
    if (animating || voted) return;
    setVoted(winnerId);
    setAnimating(true);
    if (showTutorial) dismissTutorial();
    if (pair) {
      const [a, b] = pair;
      const aWon = winnerId === a.id;
      const w = Math.min(3.0, Math.max(0.0, tier.weight || 1.0));
      const bias = 0.5 * (w / 3.0);
      const scoreA = aWon ? 0.5 + bias : 0.5 - bias;
      const phiA = (a.rd || 350) / 173.7178;
      const phiB = (b.rd || 350) / 173.7178;
      const gB = 1 / Math.sqrt(1 + 3 * phiB * phiB / (Math.PI * Math.PI));
      const muA = ((a.r || 1500) - 1500) / 173.7178;
      const muB = ((b.r || 1500) - 1500) / 173.7178;
      const EA = 1 / (1 + Math.exp(-gB * (muA - muB)));
      const phiANew = 1 / Math.sqrt(1 / (phiA * phiA) + 1 / (gB * gB * EA * (1 - EA)));
      const shiftA = Math.round((phiANew * phiANew * gB * (scoreA - EA)) * 173.7178);
      setEloShift({ a: shiftA, b: -shiftA });
    }
    onVote(pair[0].id, pair[1].id, winnerId);
    setTimeout(() => { setAnimating(false); pickPair(planetsRef.current); onNextPair?.(); }, 1100);
  };

  if (!pair) return null;
  const [a, b] = pair;
  const streak = user.streak || 0;
  const streakInfo = getStreak(streak);
  const votedCount = votedIds ? votedIds.size : 0;
  const pct = Math.round(votedCount / planets.length * 100);
  const potd = getPlanetOfDay(planets);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Planet of the Day */}
      {potd && !potdDismissed && (
        <div style={{
          background: 'rgba(29,158,117,0.06)', border: '0.5px solid rgba(29,158,117,0.25)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 22, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,#1D9E7555,transparent)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 160 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1D9E75', boxShadow: '0 0 8px #1D9E75', flexShrink: 0, animation: 'orb-pulse 2s ease-in-out infinite' }} />
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: '#1D9E7577', letterSpacing: '0.18em', marginBottom: 2 }}>PLANET OF THE DAY</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 700, color: '#e8f4ff' }}>{potd.name}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{potd.type} · {potd.temp}K · {potd.dist} ly</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <button
                disabled={potdPrioritized}
                onClick={() => handlePrioritize(potd.id)}
                style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 700,
                  padding: '8px 16px', borderRadius: 7, cursor: potdPrioritized ? 'default' : 'pointer',
                  background: potdPrioritized ? 'rgba(29,158,117,0.1)' : 'rgba(29,158,117,0.18)',
                  color: potdPrioritized ? '#1D9E7577' : '#1D9E75',
                  border: potdPrioritized ? '0.5px solid #1D9E7533' : '0.5px solid #1D9E7566',
                  letterSpacing: '0.08em', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { if (!potdPrioritized) e.currentTarget.style.background = 'rgba(29,158,117,0.28)'; }}
                onMouseLeave={e => { if (!potdPrioritized) e.currentTarget.style.background = 'rgba(29,158,117,0.18)'; }}>
                {potdPrioritized ? '✓ PRIORITIZED' : '↑ PRIORITIZE'}
              </button>
              <button
                onClick={() => { onViewDetail(potd); }}
                style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 9,
                  padding: '8px 12px', borderRadius: 7, cursor: 'pointer',
                  background: 'transparent', color: 'rgba(255,255,255,0.4)',
                  border: '0.5px solid rgba(255,255,255,0.1)', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                view →
              </button>
              <button
                onClick={dismissPotd}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.22)', cursor: 'pointer', fontSize: 14, padding: '4px 6px', lineHeight: 1 }}>
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.22em', marginBottom: 8, textTransform: 'uppercase' }}>
          JWST Observation Priority · Cast Your Vote
        </div>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 22, color: '#e8f4ff', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.3 }}>
          Which exoplanet deserves limited telescope time more?
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <TierBadge tier={tier} sm />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>±{Math.round(tier.k * streakInfo.mult)} JR · {tier.weight}× weight</span>
          </div>
          {streak >= 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${streakInfo.color}15`, border: `0.5px solid ${streakInfo.color}44`, borderRadius: 20, padding: '3px 12px', animation: 'rare-pulse 1.5s ease-in-out infinite' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: streakInfo.color, boxShadow: `0 0 6px ${streakInfo.color}` }} />
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 700, color: streakInfo.color, letterSpacing: '0.1em' }}>{streakInfo.label}</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: `${streakInfo.color}bb` }}>{streakInfo.mult}×</span>
            </div>
          )}
        </div>
      </div>

      {/* Tutorial */}
      {showTutorial && (
        <div style={{
          background: 'rgba(55,138,221,0.07)', border: '1px solid #378ADD33',
          borderRadius: 12, padding: '16px 20px', marginBottom: 18,
          maxWidth: 860, margin: '0 auto 18px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, color: '#378ADD88', letterSpacing: '0.12em' }}>HOW TO READ A PLANET CARD</div>
            <button onClick={dismissTutorial} style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.45)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>got it ×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
            {[
              ['Radius', 'Under 1.6× Earth = probably rocky'],
              ['Eq. temp', '200–320 K = liquid water possible'],
              ['Period', 'Shorter orbit = hotter environment'],
              ['Distance', 'Closer = more JWST transits/year'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, color: '#378ADD88', flexShrink: 0, minWidth: 60 }}>{k}</span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards + VS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 52px 1fr', gap: isMobile ? 16 : 8, alignItems: 'stretch', maxWidth: 860, margin: '0 auto' }}>

        {/* Card A */}
        <div style={{ opacity: voted && voted !== a.id ? 0.28 : 1, transform: voted === a.id ? 'scale(1.02)' : voted && voted !== a.id ? 'scale(0.96)' : 'scale(1)', transition: 'all 0.38s ease', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <PlanetCard planet={a} onClick={() => onViewDetail(a)} />
          {eloShift && voted && (
            <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, color: eloShift.a >= 0 ? '#1D9E75' : '#E24B4A', animation: 'float-up 1s ease-out forwards', pointerEvents: 'none', textShadow: `0 0 16px ${eloShift.a >= 0 ? '#1D9E75' : '#E24B4A'}` }}>
              {eloShift.a >= 0 ? '+' : ''}{eloShift.a}
            </div>
          )}
          <button onClick={() => handleVote(a.id)} disabled={!!voted}
            style={{
              marginTop: 10, width: '100%',
              fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700,
              padding: '14px 0', borderRadius: 10,
              cursor: voted ? 'default' : 'pointer',
              background: voted === a.id
                ? `linear-gradient(135deg, ${HC[a.hue]?.accent || '#1D9E75'}33, ${HC[a.hue]?.accent || '#1D9E75'}18)`
                : 'transparent',
              color: HC[a.hue]?.accent || '#1D9E75',
              border: `1.5px solid ${voted === a.id ? HC[a.hue]?.accent || '#1D9E75' : (HC[a.hue]?.accent || '#1D9E75') + '66'}`,
              letterSpacing: '0.12em',
              transition: 'all 0.22s ease',
              willChange: 'transform',
              boxShadow: voted === a.id ? `0 0 24px ${HC[a.hue]?.accent || '#1D9E75'}33` : 'none',
            }}
            onMouseEnter={e => { if (!voted) { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = `0 0 22px ${HC[a.hue]?.accent || '#1D9E75'}44`; e.currentTarget.style.borderColor = HC[a.hue]?.accent || '#1D9E75'; e.currentTarget.style.background = `${HC[a.hue]?.accent || '#1D9E75'}12`; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = voted === a.id ? `0 0 24px ${HC[a.hue]?.accent || '#1D9E75'}33` : 'none'; e.currentTarget.style.borderColor = voted === a.id ? HC[a.hue]?.accent || '#1D9E75' : (HC[a.hue]?.accent || '#1D9E75') + '66'; e.currentTarget.style.background = voted === a.id ? `linear-gradient(135deg, ${HC[a.hue]?.accent || '#1D9E75'}33, ${HC[a.hue]?.accent || '#1D9E75'}18)` : 'transparent'; }}>
            {voted === a.id ? '✓ PRIORITIZED' : 'PRIORITIZE →'}
          </button>
        </div>

        {/* VS divider */}
        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.2em' }}>VS</div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, position: 'relative' }}>
            {/* Vertical line top */}
            <div style={{ width: 1, flex: 1, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), rgba(255,255,255,0.08))', minHeight: 40 }} />
            {/* VS badge */}
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(5,12,20,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>VS</span>
            </div>
            {/* Vertical line bottom */}
            <div style={{ width: 1, flex: 1, background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)', minHeight: 40 }} />
            {/* Skip */}
            <button onClick={() => pickPair(planets)}
              style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.28)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 9, fontFamily: "'Space Mono',monospace", letterSpacing: '0.05em', transition: 'all 0.18s ease', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}>
              skip
            </button>
          </div>
        )}

        {/* Card B */}
        <div style={{ opacity: voted && voted !== b.id ? 0.28 : 1, transform: voted === b.id ? 'scale(1.02)' : voted && voted !== b.id ? 'scale(0.96)' : 'scale(1)', transition: 'all 0.38s ease', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <PlanetCard planet={b} onClick={() => onViewDetail(b)} />
          {eloShift && voted && (
            <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, color: eloShift.b >= 0 ? '#1D9E75' : '#E24B4A', animation: 'float-up 1s ease-out forwards', pointerEvents: 'none', textShadow: `0 0 16px ${eloShift.b >= 0 ? '#1D9E75' : '#E24B4A'}` }}>
              {eloShift.b >= 0 ? '+' : ''}{eloShift.b}
            </div>
          )}
          <button onClick={() => handleVote(b.id)} disabled={!!voted}
            style={{
              marginTop: 10, width: '100%',
              fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700,
              padding: '14px 0', borderRadius: 10,
              cursor: voted ? 'default' : 'pointer',
              background: voted === b.id
                ? `linear-gradient(135deg, ${HC[b.hue]?.accent || '#378ADD'}33, ${HC[b.hue]?.accent || '#378ADD'}18)`
                : 'transparent',
              color: HC[b.hue]?.accent || '#378ADD',
              border: `1.5px solid ${voted === b.id ? HC[b.hue]?.accent || '#378ADD' : (HC[b.hue]?.accent || '#378ADD') + '66'}`,
              letterSpacing: '0.12em',
              transition: 'all 0.22s ease',
              willChange: 'transform',
              boxShadow: voted === b.id ? `0 0 24px ${HC[b.hue]?.accent || '#378ADD'}33` : 'none',
            }}
            onMouseEnter={e => { if (!voted) { e.currentTarget.style.transform = 'scale(1.035)'; e.currentTarget.style.boxShadow = `0 0 22px ${HC[b.hue]?.accent || '#378ADD'}44`; e.currentTarget.style.borderColor = HC[b.hue]?.accent || '#378ADD'; e.currentTarget.style.background = `${HC[b.hue]?.accent || '#378ADD'}12`; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = voted === b.id ? `0 0 24px ${HC[b.hue]?.accent || '#378ADD'}33` : 'none'; e.currentTarget.style.borderColor = voted === b.id ? HC[b.hue]?.accent || '#378ADD' : (HC[b.hue]?.accent || '#378ADD') + '66'; e.currentTarget.style.background = voted === b.id ? `linear-gradient(135deg, ${HC[b.hue]?.accent || '#378ADD'}33, ${HC[b.hue]?.accent || '#378ADD'}18)` : 'transparent'; }}>
            {voted === b.id ? '✓ PRIORITIZED' : 'PRIORITIZE →'}
          </button>
        </div>

        {/* Mobile skip */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => pickPair(planets)}
              style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', borderRadius: 6, padding: '7px 18px', cursor: 'pointer', fontSize: 10, fontFamily: "'Space Mono',monospace" }}>
              skip pair
            </button>
          </div>
        )}
      </div>

      {/* Progress */}
      <div style={{ marginTop: 24, maxWidth: 860, margin: '24px auto 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{votedCount} seen</span>
          <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #1D9E75aa, #1D9E75)', borderRadius: 1, transition: 'width 0.5s ease', boxShadow: pct > 0 ? '0 0 6px #1D9E7544' : 'none' }} />
          </div>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{planets.length} total</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>Click a card for full data · Habitability scores are hidden — judge from the raw numbers</span>
        </div>
      </div>
    </div>
  );
}
