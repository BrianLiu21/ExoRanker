import { useEffect } from 'react';
import { phiComponents, HAB_LABEL, HAB_COLOR } from '../utils/phi';

export default function AccuracyToast({ result, onDismiss, onViewDetail }) {
  useEffect(() => { const t = setTimeout(onDismiss, 5000); return () => clearTimeout(t); }, []);
  const isTie = !result.scoreable;
  const labelColor = isTie ? '#888780' : result.correct ? '#1D9E75' : '#E24B4A';
  const label = isTie ? 'INDETERMINATE PAIR' : result.correct ? 'CORRECT CALL' : 'MISSED';
  const newStreakInfo = result.streakInfo;

  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200,
      background: isTie ? 'rgba(8,10,20,0.97)' : result.correct ? 'rgba(4,18,12,0.97)' : 'rgba(18,4,4,0.97)',
      border: `1px solid ${labelColor}`,
      borderRadius: 14, padding: isTie ? '14px 20px' : '12px 16px',
      minWidth: 330, maxWidth: isTie ? 400 : 500,
      boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 40px ${labelColor}18`,
      animation: 'slide-in-bottom 0.28s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: `linear-gradient(90deg, transparent, ${labelColor}88, transparent)`, borderRadius: 1 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isTie ? 8 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, color: labelColor, letterSpacing: '0.14em', fontWeight: 700 }}>{label}</div>
          {!isTie && result.correct && result.newStreak >= 3 && newStreakInfo?.label && (
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: newStreakInfo.color, background: `${newStreakInfo.color}18`, padding: '2px 8px', borderRadius: 10, border: `0.5px solid ${newStreakInfo.color}44` }}>{newStreakInfo.label}</div>
          )}
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
          {isTie ? 'not scored' : result.correct ? `+${result.points.toFixed(1)} pts${result.streakMult > 1 ? ` · ${result.streakMult}×` : ''}` : `−${result.points.toFixed(1)} pts`}
        </div>
      </div>

      {isTie ? (
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
          PHI gap under 8pts — too close to call. Counts toward planet rankings but not your accuracy score.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          {[result.planetA, result.planetB].map(p => {
            const isCorrect = p.id === result.correctId;
            const isChosen = p.id === result.winnerId;
            const hc = phiComponents(p);
            const col = HAB_COLOR(hc.total);
            return (
              <div key={p.id}
                onClick={() => { onViewDetail?.(p); onDismiss(); }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = isCorrect ? '#1D9E75aa' : 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = isCorrect ? '#1D9E7555' : 'rgba(255,255,255,0.07)'; }}
                style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: 9, padding: '8px 10px',
                  border: `0.5px solid ${isCorrect ? '#1D9E7555' : 'rgba(255,255,255,0.07)'}`,
                  cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
                  position: 'relative', overflow: 'hidden',
                }}>
                {isCorrect && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #1D9E7566, transparent)' }} />}
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 7, color: isCorrect ? '#1D9E75' : 'rgba(255,255,255,0.45)', marginBottom: 3, letterSpacing: '0.04em', lineHeight: 1.3 }}>
                  {p.name}
                  {isCorrect && <span style={{ color: '#1D9E75' }}> ✓</span>}
                  {isChosen && !isCorrect && <span style={{ color: '#E24B4A' }}> ← your pick</span>}
                </div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 16, fontWeight: 900, color: col, marginBottom: 1 }}>
                  {Math.round(hc.total * 100)}<span style={{ fontSize: 8, opacity: 0.5 }}>/100</span>
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{HAB_LABEL(hc.total)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[['HZ', hc.hz, '#1D9E75'], ['Rocky', hc.rk, '#378ADD'], ['Tidal', hc.tl, '#7F77DD'], ['Activity', hc.act, '#EF9F27'], ['Atm', hc.atm, '#B5D4F4'], ['ESI', hc.esi, '#9FE1CB'], ['Obs', hc.obs, '#888780']].map(([l, v, c]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 6, color: 'rgba(255,255,255,0.28)', width: 26, flexShrink: 0 }}>{l}</span>
                      <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1 }}>
                        <div style={{ width: `${Math.round(v * 100)}%`, height: '100%', background: c, borderRadius: 1 }} />
                      </div>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 6, color: 'rgba(255,255,255,0.38)', width: 16, textAlign: 'right', flexShrink: 0 }}>{Math.round(v * 100)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!isTie && (
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.18)', textAlign: 'center', marginTop: 4 }}>
          tap a card to open full detail
        </div>
      )}
    </div>
  );
}
