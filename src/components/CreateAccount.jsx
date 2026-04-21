import { useState } from 'react';
import { sb, SB_ON } from '../config/supabase';

const ANIM = `
@keyframes floatA { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-18px) rotate(4deg)} }
@keyframes floatB { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-12px) rotate(-3deg)} }
@keyframes floatC { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-22px) rotate(6deg)} }
@keyframes titleGlow { 0%,100%{text-shadow:0 0 20px rgba(29,158,117,0.35),0 0 60px rgba(55,138,221,0.12)} 50%{text-shadow:0 0 38px rgba(29,158,117,0.65),0 0 80px rgba(55,138,221,0.25)} }
@keyframes shimmerLine { 0%{opacity:0.25} 50%{opacity:0.6} 100%{opacity:0.25} }
@keyframes pulse-dot { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
`;

const BG_PLANETS = [
  { size:90,  top:'7%',  left:'3%',  hue:'#1D9E75', delay:'0s',   anim:'floatA', dur:'7s'   },
  { size:54,  top:'14%', right:'5%', hue:'#378ADD', delay:'1.2s', anim:'floatB', dur:'5.5s' },
  { size:36,  top:'56%', left:'2%',  hue:'#7F77DD', delay:'0.5s', anim:'floatC', dur:'8s'   },
  { size:66,  top:'62%', right:'3%', hue:'#EF9F27', delay:'2s',   anim:'floatA', dur:'6.5s' },
  { size:26,  top:'38%', left:'7%',  hue:'#B5D4F4', delay:'1s',   anim:'floatB', dur:'4.5s' },
];

function FloatPlanet({ size, top, left, right, hue, delay, anim, dur }) {
  return (
    <div style={{
      position: 'absolute', top, left, right,
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 32% 28%, ${hue}cc 0%, ${hue}44 55%, transparent 80%)`,
      boxShadow: `0 0 ${size * 0.6}px ${hue}33, 0 0 ${size * 0.2}px ${hue}77 inset`,
      border: `1px solid ${hue}33`,
      animation: `${anim} ${dur} ease-in-out ${delay} infinite`,
      pointerEvents: 'none', zIndex: 0,
    }}>
      <div style={{
        position: 'absolute', top: '14%', left: '19%',
        width: '33%', height: '17%', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 100%)',
        transform: 'rotate(-28deg)',
      }} />
    </div>
  );
}

export default function CreateAccount({ onComplete, onLogin, planetCount, liveData }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [checking, setChecking] = useState(false);
  const [returning, setReturning] = useState(null);
  const trimmed = name.trim();
  const formatOk = trimmed.length >= 2 && trimmed.length <= 20 && /^[a-zA-Z0-9_\-. ]+$/.test(trimmed);

  const handleNameChange = (e) => { setName(e.target.value); setErr(''); setReturning(null); };

  const handle = async () => {
    if (!formatOk) { setErr('2–20 chars, letters/numbers/._- only'); return; }
    if (returning) { onLogin(returning); return; }
    if (SB_ON) {
      setChecking(true);
      const existing = await sb.get('users', `select=*&username=eq.${encodeURIComponent(trimmed)}`);
      setChecking(false);
      if (Array.isArray(existing) && existing.length > 0) { setReturning(existing[0]); return; }
    }
    onComplete(trimmed);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
      <style>{ANIM}</style>

      {/* Floating background planets */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {BG_PLANETS.map((p, i) => <FloatPlanet key={i} {...p} />)}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <div style={{ marginBottom: 32, paddingTop: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(29,158,117,0.1)', border: '0.5px solid rgba(29,158,117,0.28)', borderRadius: 20, padding: '4px 14px', marginBottom: 18 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: liveData ? '#1D9E75' : '#888780', boxShadow: liveData ? '0 0 8px #1D9E75' : 'none', animation: liveData ? 'pulse-dot 2s ease-in-out infinite' : 'none' }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: liveData ? '#1D9E7599' : 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>
              {liveData ? `${planetCount} PLANETS · LIVE NASA DATA` : `${planetCount} PLANETS · BUILT-IN DATASET`}
            </span>
          </div>

          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 34, fontWeight: 900, color: '#e8f4ff', letterSpacing: '0.03em', lineHeight: 1.15, marginBottom: 12, animation: 'titleGlow 4s ease-in-out infinite' }}>
            Rank the Universe
          </div>

          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 17, color: 'rgba(255,255,255,0.48)', fontStyle: 'italic', lineHeight: 1.5, maxWidth: 380, margin: '0 auto 20px' }}>
            Help scientists decide which exoplanets JWST should study next
          </div>
        </div>

        {/* How it works */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { color: '#378ADD', title: 'Read', body: 'Compare raw planet data — radius, temp, orbit, distance.' },
            { color: '#1D9E75', title: 'Vote', body: 'Pick the stronger JWST candidate. No right answer shown.' },
            { color: '#7F77DD', title: 'Score', body: 'Your picks are measured against a hidden habitability index.' },
          ].map((t, i) => (
            <div key={i} style={{ background: `${t.color}08`, border: `0.5px solid ${t.color}2a`, borderRadius: 14, padding: '16px 12px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${t.color}55, transparent)` }} />
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, color: t.color, letterSpacing: '0.1em', marginBottom: 7 }}>{t.title}</div>
              <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{t.body}</div>
            </div>
          ))}
        </div>

        {/* PHI explanation */}
        <div style={{ background: 'linear-gradient(135deg, rgba(29,158,117,0.07), rgba(55,138,221,0.04))', border: '0.5px solid rgba(29,158,117,0.22)', borderRadius: 14, padding: '16px 20px', marginBottom: 22, textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#1D9E7555,transparent)', animation: 'shimmerLine 3s ease-in-out infinite' }} />
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8, color: '#1D9E7599', letterSpacing: '0.22em', marginBottom: 7 }}>PHI · HIDDEN GROUND TRUTH</div>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
            Every planet has a secret <strong style={{ color: '#1D9E75', fontWeight: 400 }}>Probabilistic Habitability Index</strong> — scored across seven factors including habitable zone position, stellar activity, and atmosphere retention. You never see it while voting. Your accuracy is measured against it after each vote, and your Judgment Rating rises or falls accordingly.
          </div>
        </div>

        {/* Welcome back */}
        {returning && (
          <div style={{ background: 'linear-gradient(135deg,rgba(29,158,117,0.1),rgba(29,158,117,0.04))', border: '1px solid #1D9E7544', borderRadius: 14, padding: '20px 24px', marginBottom: 20, textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,#1D9E7566,transparent)' }} />
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, color: '#1D9E75', letterSpacing: '0.2em', marginBottom: 12 }}>WELCOME BACK</div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[['JR', returning.jr || 1000], ['VOTES', returning.totalVotes || 0], ['ACCURACY', `${Math.round(returning.accuracy || 0)}%`]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.28)', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 18, fontWeight: 700, color: '#e8f4ff' }}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setReturning(null); setName(''); }} style={{ marginTop: 12, background: 'transparent', border: 'none', fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.28)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
              not you? start fresh
            </button>
          </div>
        )}

        {/* Callsign input */}
        <div style={{ background: 'rgba(4,10,20,0.88)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '26px 28px', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em', marginBottom: 14, textAlign: 'left' }}>
            {returning ? 'YOUR CALLSIGN' : 'CHOOSE YOUR CALLSIGN'}
          </div>
          <input
            value={name} onChange={handleNameChange} onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="e.g. Voyager7, dr_exo, cassini" maxLength={20}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${returning ? '#1D9E7566' : formatOk ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 10, padding: '13px 16px',
              fontFamily: "'Space Mono',monospace", fontSize: 13, color: '#e8f4ff',
              outline: 'none', marginBottom: 8, boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }} />
          {err && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#E24B4A', marginBottom: 8, textAlign: 'left' }}>{err}</div>}
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.2)', marginBottom: 20, textAlign: 'left' }}>
            {returning ? 'Your account was found — click below to continue.' : 'Returning? Enter your callsign to pick up where you left off.'}
          </div>
          <button onClick={handle} disabled={!formatOk || checking} style={{
            width: '100%', fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700,
            padding: '15px 0', borderRadius: 10, letterSpacing: '0.12em', transition: 'all 0.2s',
            cursor: (formatOk && !checking) ? 'pointer' : 'not-allowed',
            background: !formatOk ? 'rgba(255,255,255,0.03)'
              : returning ? 'linear-gradient(135deg,rgba(29,158,117,0.28),rgba(29,158,117,0.14))'
              : 'linear-gradient(135deg,rgba(29,158,117,0.28),rgba(29,158,117,0.14))',
            color: !formatOk ? 'rgba(255,255,255,0.2)' : '#1D9E75',
            border: !formatOk ? '0.5px solid rgba(255,255,255,0.06)' : '1.5px solid #1D9E7566',
            boxShadow: formatOk ? '0 4px 24px rgba(29,158,117,0.18)' : 'none',
          }}
            onMouseEnter={e => { if (formatOk && !checking) { e.currentTarget.style.boxShadow = '0 6px 32px rgba(29,158,117,0.32)'; e.currentTarget.style.borderColor = '#1D9E75'; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = formatOk ? '0 4px 24px rgba(29,158,117,0.18)' : 'none'; e.currentTarget.style.borderColor = !formatOk ? 'rgba(255,255,255,0.06)' : '#1D9E7566'; }}>
            {checking ? 'CHECKING…' : returning ? `CONTINUE AS ${trimmed.toUpperCase()}` : 'ENTER THE ARCHIVE →'}
          </button>
          <div style={{ marginTop: 14, fontFamily: "'Crimson Pro',serif", fontSize: 11, color: 'rgba(255,255,255,0.22)', fontStyle: 'italic', lineHeight: 1.5 }}>
            Your votes count from the first one. Take the calibration quiz from your profile anytime to fast-track your Judgment Rating.
          </div>
        </div>
      </div>
    </div>
  );
}
