import { useState, useEffect, useCallback, useRef } from 'react';
import { HC } from '../constants/colors';
import { getEffectiveTier } from '../utils/userTiers';
import { getStreak } from '../utils/streak';
import { getPlanetOfDay, buildWeightedQueue } from '../utils/misc';
import PlanetCard from './PlanetCard';
import TierBadge from './primitives/TierBadge';

export default function VoteArena({planets, user, onVote, onViewDetail, onNextPair, votedIds}) {
  const [pair,setPair]    = useState(null);
  const [voted,setVoted]  = useState(null);
  const [animating,setAnimating] = useState(false);
  const [eloShift,setEloShift]   = useState(null);

  // Planet of Day dismissed state - persisted by calendar date so it resets daily
  const todayKey = new Date().toISOString().slice(0,10); // "2026-03-22"
  const [potdDismissed,setPotdDismissed] = useState(()=>{
    try { return localStorage.getItem("er_potd_date") === todayKey; } catch { return false; }
  });
  const dismissPotd = () => {
    setPotdDismissed(true);
    try { localStorage.setItem("er_potd_date", todayKey); } catch {}
  };

  const [showTutorial,setShowTutorial] = useState(user.mode==="beginner" && !user.tutorialDone);

  const dismissTutorial = () => {
    setShowTutorial(false);
    // Persist so tutorial never shows again for this user
    if (!user.tutorialDone) {
      const updated = { ...user, tutorialDone: true };
      try { localStorage.setItem("er_user1", JSON.stringify(updated)); } catch {}
    }
  };
  const queueRef = useRef([]);
  const tier = getEffectiveTier(user.jr||1000, user.mode);

  const pickPair = useCallback(ps => {
    if (queueRef.current.length < 2) {
      queueRef.current = buildWeightedQueue(ps, user.jr||1000, user.mode);
    }
    const idA = queueRef.current.shift();
    const idxB = queueRef.current.findIndex(id => id !== idA);
    const idB = idxB >= 0 ? queueRef.current.splice(idxB,1)[0] : queueRef.current.shift();
    const pa = ps.find(x => x.id === idA), pb = ps.find(x => x.id === idB);
    if (pa && pb) { setPair([pa, pb]); setVoted(null); setEloShift(null); }
  }, [user.jr, user.mode]);

  useEffect(() => { if (planets.length >= 2) pickPair(planets); }, []);

  const handleVote = (winnerId) => {
    if (animating || voted) return;
    setVoted(winnerId);
    setAnimating(true);
    if (showTutorial) dismissTutorial();
    // Approximate Glicko-2 shift for the float-up animation
    // Full Glicko-2 runs in handleVote; this is a fast visual preview
    if (pair) {
      const [a, b] = pair;
      const aWon = winnerId === a.id;
      const w = Math.min(3.0, Math.max(0.0, tier.weight || 1.0));
      const bias = 0.5 * (w / 3.0);
      const scoreA = aWon ? 0.5 + bias : 0.5 - bias;
      // Preview r shift using simplified Glicko-2 formula
      const phiA = (a.rd||350) / 173.7178;
      const phiB = (b.rd||350) / 173.7178;
      const gB   = 1 / Math.sqrt(1 + 3 * phiB * phiB / (Math.PI * Math.PI));
      const muA  = ((a.r||1500) - 1500) / 173.7178;
      const muB  = ((b.r||1500) - 1500) / 173.7178;
      const EA   = 1 / (1 + Math.exp(-gB * (muA - muB)));
      const phiANew = 1 / Math.sqrt(1/(phiA*phiA) + 1/(gB*gB*EA*(1-EA)));
      const shiftA = Math.round((phiANew * phiANew * gB * (scoreA - EA)) * 173.7178);
      setEloShift({ a: shiftA, b: -shiftA });
    }
    onVote(pair[0].id, pair[1].id, winnerId);
    setTimeout(() => { setAnimating(false); pickPair(planets); onNextPair?.(); }, 1100);
  };

  if (!pair) return null;
  const [a, b] = pair;
  const streak = user.streak || 0;
  const streakInfo = getStreak(streak);
  const votedCount = votedIds ? votedIds.size : 0;
  const pct = Math.round(votedCount / planets.length * 100);
  const potd = getPlanetOfDay(planets);

  return (
    <div style={{maxWidth:900,margin:"0 auto"}}>

      {/* Planet of the Day - hides once visited */}
      {potd && !potdDismissed && (
        <div onClick={()=>{ dismissPotd(); onViewDetail(potd); }} style={{
          display:"flex", alignItems:"center", gap:12,
          background:"rgba(29,158,117,0.06)", border:"0.5px solid #1D9E7533",
          borderRadius:10, padding:"10px 16px", marginBottom:20, cursor:"pointer",
          transition:"background 0.18s, transform 0.2s ease, box-shadow 0.2s ease",
          willChange:"transform",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(29,158,117,0.12)";e.currentTarget.style.transform="scale(1.015)";e.currentTarget.style.boxShadow="0 4px 16px #1D9E7522";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(29,158,117,0.06)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:"#1D9E75",boxShadow:"0 0 8px #1D9E75",flexShrink:0}}/>
          <div style={{flex:1}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(29,158,117,0.7)",letterSpacing:"0.15em"}}>PLANET OF THE DAY · </span>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#1D9E75",fontWeight:700}}>{potd.name}</span>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.3)",marginLeft:8}}>{potd.type}</span>
          </div>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.25)"}}>view details →</span>
        </div>
      )}

      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:"0.22em",marginBottom:8}}>JWST OBSERVATION PRIORITY · CAST YOUR VOTE</div>
        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:17,color:"rgba(255,255,255,0.55)",fontStyle:"italic",marginBottom:10}}>Which exoplanet deserves limited telescope time more?</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
          {user.mode === "beginner" ? (
            <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(55,138,221,0.1)",border:"0.5px solid #378ADD44",borderRadius:20,padding:"4px 14px"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#378ADD"}}/>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#378ADD",letterSpacing:"0.1em"}}>LEARN MODE · votes don't affect research rankings</span>
            </div>
          ) : (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.25)"}}>Weight:</span>
              <TierBadge tier={tier} sm/>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.2)"}}>· JR ±{Math.round(tier.k * streakInfo.mult)}</span>
            </div>
          )}
          {streak >= 3 && user.mode === "advanced" && (
            <div style={{display:"flex",alignItems:"center",gap:6,background:`${streakInfo.color}18`,border:`0.5px solid ${streakInfo.color}55`,borderRadius:20,padding:"3px 10px",animation:"rare-pulse 1.5s ease-in-out infinite"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:streakInfo.color,boxShadow:`0 0 6px ${streakInfo.color}`}}/>
              <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:streakInfo.color,letterSpacing:"0.1em"}}>{streakInfo.label}</span>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:streakInfo.color}}>{streakInfo.mult}× JR bonus</span>
            </div>
          )}
        </div>
      </div>

      {/* Beginner tutorial - sits above the grid, not inside a card column */}
      {showTutorial && (
        <div style={{
          background:"rgba(55,138,221,0.08)", border:"1px solid #378ADD44",
          borderRadius:12, padding:"16px 20px", marginBottom:16,
          maxWidth:860, margin:"0 auto 16px"
        }}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#378ADD",letterSpacing:"0.12em"}}>HOW TO READ A PLANET CARD</div>
            <button onClick={dismissTutorial} style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.3)",background:"transparent",border:"none",cursor:"pointer",padding:"2px 6px"}}>got it ×</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 24px"}}>
            {[
              ["Radius","Under 1.6× Earth = probably rocky surface"],
              ["Eq. temp","200–320K = liquid water possible"],
              ["Period","Shorter orbit = closer to star = hotter"],
              ["Distance","Closer = more JWST observations per year"],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",gap:8,alignItems:"baseline"}}>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:"#378ADD",flexShrink:0,minWidth:52}}>{k}</span>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.45)",lineHeight:1.4}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:12,color:"rgba(255,255,255,0.3)",fontStyle:"italic",marginTop:10}}>
            Vote for whichever planet you think deserves JWST observation time more. Vote for what you think is right. Every vote builds your intuition.
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 44px 1fr",gap:12,alignItems:"stretch",maxWidth:860,margin:"0 auto"}}>
        {/* Card A */}
        <div style={{opacity:voted&&voted!==a.id?0.32:1,transform:voted===a.id?"scale(1.02)":voted&&voted!==a.id?"scale(0.97)":"scale(1)",transition:"all 0.38s ease",paddingTop:"0",position:"relative",display:"flex",flexDirection:"column"}}>
          <PlanetCard planet={a} onClick={()=>onViewDetail(a)}/>
          {/* Glicko-2 shift float */}
          {eloShift && voted && (
            <div style={{position:"absolute",top:16,right:16,fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:eloShift.a>=0?"#1D9E75":"#E24B4A",animation:"float-up 1s ease-out forwards",pointerEvents:"none",textShadow:`0 0 12px ${eloShift.a>=0?"#1D9E75":"#E24B4A"}`}}>
              {eloShift.a>=0?"+":""}{eloShift.a}
            </div>
          )}
          <button onClick={()=>handleVote(a.id)} disabled={!!voted}
            style={{marginTop:10,width:"100%",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,padding:"13px 0",borderRadius:8,cursor:voted?"default":"pointer",background:voted===a.id?HC[a.hue].accent:"transparent",color:voted===a.id?"#040c14":HC[a.hue].accent,border:`1.5px solid ${HC[a.hue].accent}`,letterSpacing:"0.1em",transition:"all 0.25s ease",willChange:"transform"}}
            onMouseEnter={e=>{if(!voted){e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 0 18px ${HC[a.hue].accent}55`;}}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
            {voted===a.id?"SELECTED":"PRIORITIZE"}</button>
        </div>

        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,paddingTop:"0"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:"rgba(255,255,255,0.12)",letterSpacing:"0.15em"}}>VS</div>
          <button onClick={()=>pickPair(planets)}
            style={{background:"transparent",border:"0.5px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.3)",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:10,fontFamily:"'Space Mono',monospace",transition:"transform 0.18s ease, border-color 0.18s, color 0.18s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.14)";e.currentTarget.style.borderColor="rgba(255,255,255,0.3)";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.3)";}}>skip</button>
        </div>

        {/* Card B */}
        <div style={{opacity:voted&&voted!==b.id?0.32:1,transform:voted===b.id?"scale(1.02)":voted&&voted!==b.id?"scale(0.97)":"scale(1)",transition:"all 0.38s ease",paddingTop:"0",position:"relative",display:"flex",flexDirection:"column"}}>
          <PlanetCard planet={b} onClick={()=>onViewDetail(b)}/>
          {eloShift && voted && (
            <div style={{position:"absolute",top:16,right:16,fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:eloShift.b>=0?"#1D9E75":"#E24B4A",animation:"float-up 1s ease-out forwards",pointerEvents:"none",textShadow:`0 0 12px ${eloShift.b>=0?"#1D9E75":"#E24B4A"}`}}>
              {eloShift.b>=0?"+":""}{eloShift.b}
            </div>
          )}
          <button onClick={()=>handleVote(b.id)} disabled={!!voted}
            style={{marginTop:10,width:"100%",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,padding:"13px 0",borderRadius:8,cursor:voted?"default":"pointer",background:voted===b.id?HC[b.hue].accent:"transparent",color:voted===b.id?"#040c14":HC[b.hue].accent,border:`1.5px solid ${HC[b.hue].accent}`,letterSpacing:"0.1em",transition:"all 0.25s ease",willChange:"transform"}}
            onMouseEnter={e=>{if(!voted){e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 0 18px ${HC[b.hue].accent}55`;}}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
            {voted===b.id?"SELECTED":"PRIORITIZE"}</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{marginTop:20,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.25)",flexShrink:0}}>{votedCount}/{planets.length} planets seen</span>
        <div style={{flex:1,height:2,background:"rgba(255,255,255,0.06)",borderRadius:1}}>
          <div style={{width:`${pct}%`,height:"100%",background:"#1D9E7566",borderRadius:1,transition:"width 0.5s ease"}}/>
        </div>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.25)",flexShrink:0}}>{pct}%</span>
      </div>
      <div style={{textAlign:"center",marginTop:8}}><span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.18)"}}>Click a card for full data · Habitability scores are hidden. Read the raw data and judge for yourself</span></div>
    </div>
  );
}
