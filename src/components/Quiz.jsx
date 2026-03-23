import { useState } from 'react';
import { buildQuiz, QUIZ_LENGTH, TIER_LABELS, TIER_COLORS } from '../data/quiz';
import { TIERS, TIER_WEIGHTS, MAX_SCORE, getTier } from '../data/tiers';
import TierBadge from './primitives/TierBadge';

export default function Quiz({username,onComplete}) {
  const [questions] = useState(()=>buildQuiz());
  const [idx,setIdx]=useState(0);
  const [sel,setSel]=useState(null);
  const [confirmed,setConfirmed]=useState(false);
  const [score,setScore]=useState(0);       // weighted score
  const [rawScore,setRawScore]=useState(0); // correct count for display
  const [done,setDone]=useState(false);
  const q=questions[idx];
  const isLast=idx===questions.length-1;

  const confirm=()=>{
    if(sel===null)return;
    setConfirmed(true);
    if(sel===q.correct){
      setScore(s=>parseFloat((s+TIER_WEIGHTS[q.tier]).toFixed(2)));
      setRawScore(s=>s+1);
    }
  };
  const next=()=>{
    if(isLast){setDone(true);return;}
    setIdx(i=>i+1);setSel(null);setConfirmed(false);
  };

  if(done){
    const tier=getTier(score);
    const pct=Math.round((score/MAX_SCORE)*100);
    return (
      <div style={{maxWidth:580,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.25em",marginBottom:20}}>QUIZ COMPLETE · {username}</div>
        <div style={{background:"rgba(5,12,20,0.9)",border:`1px solid ${tier.color}`,borderRadius:16,padding:"36px 32px",marginBottom:20}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:52,fontWeight:900,color:tier.color,lineHeight:1}}>{score.toFixed(1)}<span style={{fontSize:18,opacity:0.5}}>/{MAX_SCORE.toFixed(1)}</span></div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:"0.1em",margin:"6px 0 4px"}}>WEIGHTED SCORE · {rawScore}/{questions.length} CORRECT</div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.35)",fontStyle:"italic",marginBottom:24}}>tier-1 = 0.6pts · tier-2 = 1.0pt · tier-3 = 1.5pts</div>

          <TierBadge tier={tier}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:700,color:"#e8f4ff",marginTop:14}}>{tier.label}</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4,marginBottom:24}}>{tier.desc}</div>

          {/* Threshold ladder */}
          <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"14px 16px",marginBottom:16,textAlign:"left"}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.12em",marginBottom:10}}>TIER THRESHOLDS</div>
            {TIERS.map(t=>{
              const active=t.id===tier.id;
              const filled=score>=t.min;
              return (
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:filled?t.color:"rgba(255,255,255,0.15)",boxShadow:active?`0 0 8px ${t.color}`:"none",flexShrink:0}}/>
                  <div style={{flex:1,fontFamily:"'Orbitron',sans-serif",fontSize:10,color:active?t.color:filled?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)",fontWeight:active?700:400}}>{t.label}</div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:active?t.color:"rgba(255,255,255,0.25)"}}>{t.min}–{t.max}pts · {t.weight}× vote weight</div>
                  {active&&<div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:t.color}}>← YOU</div>}
                </div>
              );
            })}
          </div>

          <div style={{background:"rgba(0,0,0,0.35)",borderRadius:10,padding:"16px 20px",border:`0.5px solid ${tier.color}33`,marginBottom:16}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.15em",color:"rgba(255,255,255,0.3)",marginBottom:8}}>STARTING VOTE WEIGHT</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:36,fontWeight:900,color:tier.color}}>{tier.weight}×</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.35)",marginTop:4}}>ELO shifts up to {tier.k} pts per vote · grows as you vote accurately</div>
          </div>

          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.4)",fontStyle:"italic",lineHeight:1.6}}>
            {score<=2.0&&"Harder questions are worth more. Retake anytime to reach a higher tier."}
            {score>2.0&&score<=4.0&&"Good start. Nailing the tier-3 questions would push you to Analyst or higher."}
            {score>4.0&&score<=6.0&&"Strong. You needed the expert questions to break through to Astronomer."}
            {score>6.0&&"Expert-level. Your votes carry maximum weight in the JWST priority consensus."}
          </div>
        </div>
        <button onClick={()=>onComplete(score)} style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,padding:"14px 44px",borderRadius:8,background:tier.color,color:"#020a12",border:"none",cursor:"pointer",letterSpacing:"0.12em"}}>START VOTING</button>
      </div>
    );
  }

  const tierColor = TIER_COLORS[q.tier];
  const tierLabel = TIER_LABELS[q.tier];

  return (
    <div style={{maxWidth:660,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.22em",marginBottom:10}}>KNOWLEDGE QUIZ · {idx+1} / {questions.length} · {username}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:700,color:"#e8f4ff",marginBottom:6}}>Calibration Assessment</div>
        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:14,color:"rgba(255,255,255,0.4)",fontStyle:"italic"}}>Harder questions worth more · escalates from introductory to expert</div>
      </div>

      {/* Progress bar with tier color coding */}
      <div style={{marginBottom:8}}>
        <div style={{display:"flex",gap:3}}>
          {questions.map((_,i)=>(
            <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<idx?TIER_COLORS[questions[i].tier]:i===idx?`${TIER_COLORS[questions[i].tier]}66`:"rgba(255,255,255,0.08)"}}/>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"#888780"}}>INTRODUCTORY 0.6×</span>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"#378ADD"}}>INTERMEDIATE 1.0×</span>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"#7F77DD"}}>EXPERT 1.5×</span>
        </div>
      </div>

      <div style={{background:"rgba(5,12,20,0.88)",border:`0.5px solid ${tierColor}44`,borderRadius:16,padding:"28px 28px 22px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${tierColor}18`,border:`0.5px solid ${tierColor}55`,borderRadius:20,padding:"3px 10px"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:tierColor}}/>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:tierColor,letterSpacing:"0.12em"}}>{tierLabel}</span>
          </div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.35)"}}>
            worth <span style={{color:tierColor,fontWeight:"bold"}}>{TIER_WEIGHTS[q.tier]}pts</span>
          </div>
        </div>

        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:18,color:"#e8f4ff",lineHeight:1.55,marginBottom:22,fontWeight:400}}>{q.q}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {q.opts.map((opt,i)=>{
            let bg="rgba(255,255,255,0.03)",brd="rgba(255,255,255,0.09)",col="rgba(255,255,255,0.65)";
            if(!confirmed&&sel===i){bg="rgba(55,138,221,0.14)";brd="#378ADD";col="#B5D4F4";}
            if(confirmed&&i===q.correct){bg="rgba(29,158,117,0.14)";brd="#1D9E75";col="#9FE1CB";}
            if(confirmed&&sel===i&&i!==q.correct){bg="rgba(226,75,74,0.14)";brd="#E24B4A";col="#F7C1C1";}
            return (
              <div key={i} onClick={()=>{if(!confirmed)setSel(i);}} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 16px",borderRadius:9,background:bg,border:`1px solid ${brd}`,cursor:confirmed?"default":"pointer",transition:"all 0.18s"}}>
                <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${brd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  {confirmed&&i===q.correct&&<div style={{width:9,height:9,borderRadius:"50%",background:"#1D9E75"}}/>}
                  {confirmed&&sel===i&&i!==q.correct&&<div style={{width:9,height:9,borderRadius:"50%",background:"#E24B4A"}}/>}
                  {!confirmed&&sel===i&&<div style={{width:9,height:9,borderRadius:"50%",background:"#378ADD"}}/>}
                </div>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:col,lineHeight:1.55}}>{opt}</span>
              </div>
            );
          })}
        </div>
        {confirmed&&(
          <div style={{marginTop:16,padding:"13px 16px",borderRadius:9,background:sel===q.correct?"rgba(29,158,117,0.08)":"rgba(226,75,74,0.08)",border:`0.5px solid ${sel===q.correct?"#1D9E7544":"#E24B4A44"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.12em",color:sel===q.correct?"#1D9E75":"#E24B4A"}}>{sel===q.correct?"CORRECT":"INCORRECT"}</div>
              {sel===q.correct&&<div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:tierColor}}>+{TIER_WEIGHTS[q.tier]}pts</div>}
            </div>
            <div style={{fontFamily:"'Crimson Pro',serif",fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.65}}>{q.explanation}</div>
          </div>
        )}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.22)"}}>
          Score: <span style={{color:"#e8f4ff"}}>{score.toFixed(1)}</span>/{MAX_SCORE.toFixed(1)}pts
          <span style={{margin:"0 8px",color:"rgba(255,255,255,0.15)"}}>·</span>
          next: {idx<questions.length-1?TIER_LABELS[questions[idx+1]?.tier]:"results"}
        </div>
        {!confirmed
          ?<button onClick={confirm} disabled={sel===null} style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,padding:"11px 26px",borderRadius:8,cursor:sel===null?"not-allowed":"pointer",background:sel===null?"transparent":"rgba(55,138,221,0.15)",color:sel===null?"rgba(255,255,255,0.2)":"#B5D4F4",border:sel===null?"0.5px solid rgba(255,255,255,0.08)":`1px solid #378ADD`,letterSpacing:"0.1em",transition:"all 0.2s"}}>CONFIRM</button>
          :<button onClick={next} style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,padding:"11px 26px",borderRadius:8,cursor:"pointer",background:"rgba(29,158,117,0.15)",color:"#1D9E75",border:"1px solid #1D9E75",letterSpacing:"0.1em"}}>{isLast?"RESULTS":"NEXT"}</button>
        }
      </div>
    </div>
  );
}
