import { useEffect } from 'react';
import { phiComponents, HAB_LABEL, HAB_COLOR } from '../utils/phi';

export default function AccuracyToast({result, onDismiss, onViewDetail}) {
  useEffect(()=>{const t=setTimeout(onDismiss,4500);return()=>clearTimeout(t);},[]);
  const isTie=!result.scoreable;
  const labelColor=isTie?"#888780":result.correct?"#1D9E75":"#E24B4A";
  const label=isTie?"INDETERMINATE PAIR":result.correct?"CORRECT CALL":"MISSED";
  const newStreakInfo = result.streakInfo;
  return (
    <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",zIndex:200,background:isTie?"rgba(10,10,18,0.97)":result.correct?"rgba(4,22,14,0.97)":"rgba(22,4,4,0.97)",border:`1px solid ${labelColor}`,borderRadius:12,padding:isTie?"12px 18px":"10px 16px",minWidth:320,maxWidth:isTie?400:480,boxShadow:"0 12px 40px rgba(0,0,0,0.6)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isTie?6:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:labelColor,letterSpacing:"0.12em",fontWeight:700}}>{label}</div>
          {!isTie && result.correct && result.newStreak >= 3 && newStreakInfo?.label && (
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:newStreakInfo.color,background:`${newStreakInfo.color}18`,padding:"2px 8px",borderRadius:10,border:`0.5px solid ${newStreakInfo.color}55`}}>{newStreakInfo.label} 🔥</div>
          )}
        </div>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)",textAlign:"right"}}>
          {isTie ? "not scored · Glicko-2 only" : result.correct ? `+${result.points.toFixed(1)} pts${result.streakMult>1?` · ${result.streakMult}× JR bonus`:""}` : `−${result.points.toFixed(1)} pts · streak reset`}
        </div>
      </div>
      {isTie ? (
        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.4)",fontStyle:"italic",marginBottom:8}}>
          PHI gap between these planets is under 8pts - too close to call. Vote counts toward ELO rankings but not your accuracy score.
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          {[result.planetA,result.planetB].map((p)=>{
            const isCorrect=p.id===result.correctId;
            const isChosen=p.id===result.winnerId;
            const hc=phiComponents(p);
            const col=HAB_COLOR(hc.total);
            return (
              <div key={p.id} onClick={()=>{ onViewDetail?.(p); onDismiss(); }} style={{background:"rgba(0,0,0,0.35)",borderRadius:8,padding:"7px 10px",border:`0.5px solid ${isCorrect?"#1D9E7566":"rgba(255,255,255,0.08)"}`,cursor:"pointer"}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:7,color:isCorrect?"#1D9E75":"rgba(255,255,255,0.5)",marginBottom:3,letterSpacing:"0.04em",lineHeight:1.3}}>
                  {p.name}{isCorrect?" ✓":""}{isChosen&&!isCorrect?" ← your pick":""}
                </div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:col}}>{Math.round(hc.total*100)}<span style={{fontSize:8,opacity:0.5}}>/100</span></div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.3)",marginBottom:4}}>{HAB_LABEL(hc.total)}</div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  {[["HZ",hc.hz,"#1D9E75"],["Rocky",hc.rk,"#378ADD"],["Tidal",hc.tl,"#7F77DD"],["Activity",hc.act,"#EF9F27"],["Atm",hc.atm,"#B5D4F4"],["ESI",hc.esi,"#9FE1CB"],["Obs",hc.obs,"#888780"]].map(([l,v,c])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:6,color:"rgba(255,255,255,0.3)",width:26,flexShrink:0}}>{l}</span>
                      <div style={{flex:1,height:2,background:"rgba(255,255,255,0.08)",borderRadius:1}}><div style={{width:`${Math.round(v*100)}%`,height:"100%",background:c,borderRadius:1}}/></div>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:6,color:"rgba(255,255,255,0.4)",width:18,textAlign:"right",flexShrink:0}}>{Math.round(v*100)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!isTie && (
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.18)",marginTop:8,textAlign:"center"}}>
          Click a PHI card above to open its full detail view
        </div>
      )}
    </div>
  );
}
