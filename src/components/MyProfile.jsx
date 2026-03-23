import { getEffectiveTier, USER_ELO_TIERS } from '../utils/userTiers';
import { QUIZ_LENGTH } from '../data/quiz';
import TierBadge from './primitives/TierBadge';

export default function MyProfile({user,onRetakeQuiz,onSwitchToAdvanced,onSignOut}) {
  const isAdvanced = user.mode === "advanced";
  const tier = getEffectiveTier(user.jr||1000, user.mode);
  const jr = user.jr || 1100;

  // Progress to next tier
  const sorted = [...USER_ELO_TIERS].sort((a,b)=>a.minElo-b.minElo);
  const nextTier = sorted.find(t => t.minElo > jr);
  const eloToNext = nextTier ? nextTier.minElo - jr : 0;

  return (
    <div style={{maxWidth:540,margin:"0 auto"}}>
      {!isAdvanced && (
        <div style={{background:"rgba(55,138,221,0.08)",border:"1px solid #378ADD44",borderRadius:14,padding:"20px 24px",marginBottom:16,textAlign:"center"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#378ADD",marginBottom:6,letterSpacing:"0.1em"}}>YOU'RE IN LEARN MODE</div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:14,color:"rgba(255,255,255,0.5)",fontStyle:"italic",lineHeight:1.6,marginBottom:16}}>Your votes build intuition but don't affect the shared JWST research dataset. Take the knowledge quiz to switch to Contribute mode and have real scientific impact.</div>
          <button onClick={onSwitchToAdvanced} style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,padding:"12px 28px",borderRadius:8,cursor:"pointer",background:"rgba(29,158,117,0.2)",color:"#1D9E75",border:"1px solid #1D9E75",letterSpacing:"0.1em"}}>TAKE QUIZ → CONTRIBUTE TO RESEARCH</button>
        </div>
      )}
      <div style={{background:`rgba(5,12,20,0.88)`,border:`1px solid ${tier.color}`,borderRadius:16,padding:"28px 32px"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:`${tier.color}22`,border:`1.5px solid ${tier.color}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:tier.color}}>{user.username[0].toUpperCase()}</span></div>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:700,color:"#e8f4ff"}}>{user.username}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
              <TierBadge tier={tier}/>
              {!isAdvanced && <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#378ADD"}}>LEARN MODE</span>}
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
          {[
            ["JR", isAdvanced ? jr : "-"],
            ["Accuracy", user.totalVotes>0?`${Math.round(user.accuracy)}%`:"-"],
            ["Vote weight", isAdvanced?`${tier.weight}x`:"0× (learn)"],
            ["Influence", isAdvanced?Math.round(user.influence):"-"],
            ["Current streak", user.streak||0],
            ["Best streak", user.bestStreak||0],
            ["Total votes", user.totalVotes],
            ["Quiz score", `${user.quizScore??0}/${QUIZ_LENGTH}`],
          ].map(([k,v])=>(
            <div key={k} style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:"0.12em",marginBottom:4}}>{k.toUpperCase()}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:700,color:k==="JR"?tier.color:"rgba(255,255,255,0.88)"}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Accuracy sparkline */}
        {isAdvanced && (user.voteHistory||[]).length >= 3 && (
          <div style={{background:"rgba(0,0,0,0.25)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.12em"}}>RECENT ACCURACY · LAST {Math.min((user.voteHistory||[]).length,20)} VOTES</div>
              {(()=>{
                const h = (user.voteHistory||[]).slice(-20);
                const recent5 = h.slice(-5);
                const prev5   = h.slice(-10,-5);
                const r5acc   = recent5.reduce((a,b)=>a+b,0)/recent5.length;
                const p5acc   = prev5.length ? prev5.reduce((a,b)=>a+b,0)/prev5.length : r5acc;
                const trend   = r5acc - p5acc;
                const tc = trend > 0.1 ? "#1D9E75" : trend < -0.1 ? "#E24B4A" : "#888780";
                const tl = trend > 0.1 ? "↑ improving" : trend < -0.1 ? "↓ slipping" : "→ stable";
                return <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:tc}}>{tl}</span>;
              })()}
            </div>
            {(()=>{
              const h = (user.voteHistory||[]).slice(-20);
              const W = 400, H = 44, pad = 6;
              const n = h.length;
              if (n < 2) return null;
              const pts = h.map((v,i) => ({
                x: pad + (i/(n-1)) * (W - pad*2),
                y: H - pad - (v * (H - pad*2))
              }));
              const d = "M" + pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("L");
              const lastCorrect = h[h.length-1] === 1;
              const dotColor = lastCorrect ? "#1D9E75" : "#E24B4A";
              const last = pts[pts.length-1];
              return (
                <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:44,display:"block"}}>
                  {/* Grid line at 50% */}
                  <line x1={pad} y1={H/2} x2={W-pad} y2={H/2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3"/>
                  <text x={pad} y={H/2-3} fontFamily="monospace" fontSize="7" fill="rgba(255,255,255,0.2)">50%</text>
                  {/* Line */}
                  <path d={d} fill="none" stroke="#378ADD" strokeWidth="1.5" strokeLinejoin="round"/>
                  {/* Area fill */}
                  <path d={`${d}L${pts[pts.length-1].x},${H-pad}L${pts[0].x},${H-pad}Z`} fill="#378ADD" fillOpacity="0.08"/>
                  {/* Last point dot */}
                  <circle cx={last.x} cy={last.y} r="3.5" fill={dotColor} filter={`drop-shadow(0 0 4px ${dotColor})`}/>
                </svg>
              );
            })()}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.2)"}}>oldest</span>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.2)"}}>most recent →</span>
            </div>
          </div>
        )}

        {isAdvanced && (
          <>
            {/* ELO ladder */}
            <div style={{background:"rgba(0,0,0,0.25)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.12em",marginBottom:10}}>JR TIER LADDER</div>
              {[...USER_ELO_TIERS].reverse().map(t=>{
                const active = t.id === tier.id;
                const above = jr >= t.minElo;
                return (
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,padding:"6px 10px",borderRadius:7,background:active?`${t.color}18`:"transparent",border:active?`0.5px solid ${t.color}44`:"none"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:above?t.color:"rgba(255,255,255,0.15)",boxShadow:active?`0 0 8px ${t.color}`:"none",flexShrink:0}}/>
                    <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:above?t.color:"rgba(255,255,255,0.2)",fontWeight:active?700:400,flex:1}}>{t.label}</span>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.25)"}}>≥{t.minElo} ELO · {t.weight}× weight</span>
                    {active && <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:t.color}}>← YOU ({jr})</span>}
                  </div>
                );
              })}
              {nextTier && (
                <div style={{marginTop:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.25)"}}>progress to {nextTier.label}</span>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:nextTier.color}}>{eloToNext} ELO needed</span>
                  </div>
                  <div style={{height:2,background:"rgba(255,255,255,0.06)",borderRadius:1}}>
                    <div style={{width:`${Math.round(((jr-(tier.minElo||0))/(nextTier.minElo-(tier.minElo||0)))*100)}%`,height:"100%",background:nextTier.color,borderRadius:1,transition:"width 0.5s"}}/>
                  </div>
                </div>
              )}
            </div>
            <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.4)",fontStyle:"italic",lineHeight:1.6,marginBottom:16}}>Correct votes on high-gap pairs earn more JR. Wrong answers lose it. Tiers can drop back to Explorer. As your JR rises, matchups are drawn from a smaller pool of scientifically similar planets where the right call is genuinely harder to make.</div>
            <button onClick={onRetakeQuiz} style={{width:"100%",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,padding:"12px 0",borderRadius:8,cursor:"pointer",background:"rgba(127,119,221,0.12)",color:"#7F77DD",border:"0.5px solid #7F77DD44",letterSpacing:"0.1em",marginBottom:8}}>RETAKE QUIZ</button>
            <button onClick={onSignOut} style={{width:"100%",fontFamily:"'Space Mono',monospace",fontSize:10,padding:"10px 0",borderRadius:8,cursor:"pointer",background:"transparent",color:"rgba(255,255,255,0.25)",border:"0.5px solid rgba(255,255,255,0.1)",letterSpacing:"0.1em"}}>sign out</button>
          </>
        )}
        {!isAdvanced && (
          <button onClick={onSignOut} style={{width:"100%",fontFamily:"'Space Mono',monospace",fontSize:10,padding:"10px 0",borderRadius:8,cursor:"pointer",background:"transparent",color:"rgba(255,255,255,0.25)",border:"0.5px solid rgba(255,255,255,0.1)",letterSpacing:"0.1em",marginTop:8}}>sign out</button>
        )}
      </div>
    </div>
  );
}
