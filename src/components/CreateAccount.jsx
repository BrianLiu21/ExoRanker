import { useState } from 'react';
import { sb, SB_ON } from '../config/supabase';

const ANIM = `
@keyframes floatA { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-18px) rotate(4deg)} }
@keyframes floatB { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-12px) rotate(-3deg)} }
@keyframes floatC { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-22px) rotate(6deg)} }
@keyframes orbitPulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
@keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes titleGlow { 0%,100%{text-shadow:0 0 20px rgba(29,158,117,0.4),0 0 60px rgba(55,138,221,0.15)} 50%{text-shadow:0 0 35px rgba(29,158,117,0.7),0 0 80px rgba(55,138,221,0.3)} }
@keyframes cardFloat { 0%,100%{transform:translateY(0px) scale(1)} 50%{transform:translateY(-6px) scale(1.005)} }
@keyframes shimmerLine { 0%{opacity:0.3} 50%{opacity:0.7} 100%{opacity:0.3} }
`;

const PLANETS = [
  { size:90, top:"8%",  left:"4%",  hue:"#1D9E75", delay:"0s",   anim:"floatA", dur:"7s"  },
  { size:55, top:"15%", right:"6%", hue:"#378ADD", delay:"1.2s", anim:"floatB", dur:"5.5s"},
  { size:38, top:"55%", left:"2%",  hue:"#7F77DD", delay:"0.5s", anim:"floatC", dur:"8s"  },
  { size:68, top:"60%", right:"3%", hue:"#EF9F27", delay:"2s",   anim:"floatA", dur:"6.5s"},
  { size:28, top:"38%", left:"8%",  hue:"#B5D4F4", delay:"1s",   anim:"floatB", dur:"4.5s"},
];

function FloatPlanet({ size, top, left, right, hue, delay, anim, dur }) {
  return (
    <div style={{
      position:"absolute", top, left, right,
      width:size, height:size, borderRadius:"50%",
      background:`radial-gradient(circle at 32% 28%, ${hue}cc 0%, ${hue}44 55%, transparent 80%)`,
      boxShadow:`0 0 ${size*0.6}px ${hue}44, 0 0 ${size*0.2}px ${hue}88 inset`,
      border:`1px solid ${hue}44`,
      animation:`${anim} ${dur} ease-in-out ${delay} infinite`,
      pointerEvents:"none", zIndex:0,
    }}>
      <div style={{
        position:"absolute", top:"14%", left:"19%",
        width:"33%", height:"17%", borderRadius:"50%",
        background:"radial-gradient(ellipse, rgba(255,255,255,0.25) 0%, transparent 100%)",
        transform:"rotate(-28deg)",
      }}/>
    </div>
  );
}

export default function CreateAccount({onComplete, onLogin, planetCount, liveData}) {
  const [name,setName]=useState("");
  const [mode,setMode]=useState(null);
  const [err,setErr]=useState("");
  const [checking,setChecking]=useState(false);
  const [returning,setReturning]=useState(null);
  const [hovered,setHovered]=useState(null);
  const trimmed=name.trim();
  const formatOk=trimmed.length>=2&&trimmed.length<=20&&/^[a-zA-Z0-9_\-. ]+$/.test(trimmed);

  const handleNameChange=(e)=>{ setName(e.target.value); setErr(""); setReturning(null); };

  const handle=async()=>{
    if(!formatOk){setErr("2–20 chars, letters/numbers/._- only");return;}
    if(returning){onLogin(returning);return;}
    if(SB_ON){
      setChecking(true);
      const existing=await sb.get("users",`select=*&username=eq.${encodeURIComponent(trimmed)}`);
      setChecking(false);
      if(Array.isArray(existing)&&existing.length>0){ setReturning(existing[0]); return; }
    }
    if(!mode){setErr("Choose a mode to create your account.");return;}
    onComplete(trimmed, mode);
  };

  const MODES = [
    {
      id:"beginner", label:"LEARN", sub:"Learner mode", color:"#378ADD",
      icon:"◎",
      desc:"Vote on planet pairs using only the raw data: radius, temperature, orbit, and distance. Build your intuition for what makes a strong JWST candidate.",
      steps:["No quiz required, start voting immediately","Plain-language planet type explanations","Your votes are practice, not research data","PHI scores and rankings stay hidden"],
    },
    {
      id:"advanced", label:"CONTRIBUTE", sub:"Contributor mode", color:"#1D9E75",
      icon:"◈",
      desc:"Your votes become part of a real crowdsourced JWST priority dataset. Take a knowledge quiz first to earn a Judgment Rating.",
      steps:["Take a quiz → earn a Judgment Rating","Votes weighted by your JR tier","Higher JR draws from similar planets","Unlock PHI breakdown and 3D model","Appear on the leaderboard · JR rises and falls"],
    },
  ];

  return (
    <div style={{maxWidth:560,margin:"0 auto",textAlign:"center",position:"relative"}}>
      <style>{ANIM}</style>

      {/* Floating background planets */}
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
        {PLANETS.map((p,i)=><FloatPlanet key={i} {...p}/>)}
      </div>

      <div style={{position:"relative",zIndex:1}}>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div style={{marginBottom:36,paddingTop:8}}>
          <div style={{
            display:"inline-block",
            background:"linear-gradient(135deg, rgba(29,158,117,0.15), rgba(55,138,221,0.1))",
            border:"0.5px solid rgba(29,158,117,0.3)",
            borderRadius:20, padding:"4px 14px", marginBottom:16,
          }}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#1D9E75",letterSpacing:"0.3em"}}>WELCOME TO EXORANKER</span>
          </div>

          <div style={{
            fontFamily:"'Orbitron',sans-serif", fontSize:30, fontWeight:900,
            color:"#e8f4ff", letterSpacing:"0.04em", lineHeight:1.2,
            marginBottom:10,
            animation:"titleGlow 4s ease-in-out infinite",
          }}>
            Rank the Universe
          </div>

          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:16,color:"rgba(255,255,255,0.45)",fontStyle:"italic",marginBottom:14}}>
            Help scientists decide which exoplanets JWST should study next
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <div style={{
              width:6,height:6,borderRadius:"50%",
              background:liveData?"#1D9E75":"#888780",
              boxShadow:liveData?"0 0 10px #1D9E75, 0 0 20px #1D9E7555":"none",
              animation:liveData?"orbitPulse 2s ease-in-out infinite":"none",
            }}/>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:liveData?"rgba(29,158,117,0.8)":"rgba(255,255,255,0.3)"}}>
              {liveData?`${planetCount} planets · live NASA data`:`${planetCount} planets · built-in dataset`}
            </span>
          </div>
        </div>

        {/* ── How it works (3 floating tiles) ─────────────────── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>
          {[
            { icon:"◉", color:"#378ADD", title:"Read", body:"Compare raw planet data — radius, temp, orbit, distance." },
            { icon:"⊕", color:"#1D9E75", title:"Vote", body:"Pick the stronger JWST candidate. No right answer shown." },
            { icon:"◈", color:"#7F77DD", title:"Score", body:"Your picks are measured against hidden PHI ground truth." },
          ].map((t,i)=>(
            <div key={i} style={{
              background:"rgba(255,255,255,0.03)",
              border:`0.5px solid ${t.color}33`,
              borderRadius:14, padding:"18px 12px",
              animation:`cardFloat ${5+i}s ease-in-out ${i*0.4}s infinite`,
            }}>
              <div style={{fontSize:20,marginBottom:8,color:t.color}}>{t.icon}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:t.color,letterSpacing:"0.1em",marginBottom:6}}>{t.title}</div>
              <div style={{fontFamily:"'Crimson Pro',serif",fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.5}}>{t.body}</div>
            </div>
          ))}
        </div>

        {/* ── PHI explanation ──────────────────────────────────── */}
        <div style={{
          background:"linear-gradient(135deg, rgba(29,158,117,0.08), rgba(55,138,221,0.05))",
          border:"0.5px solid rgba(29,158,117,0.25)",
          borderRadius:14, padding:"16px 20px", marginBottom:22, textAlign:"left",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#1D9E7566,transparent)",animation:"shimmerLine 3s ease-in-out infinite"}}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#1D9E75",letterSpacing:"0.2em",marginBottom:8}}>PHI · HIDDEN GROUND TRUTH</div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.7}}>
            Every planet has a secret <strong style={{color:"#1D9E75"}}>Probabilistic Habitability Index</strong> — scored across seven factors including habitable zone position, stellar activity, and atmosphere retention. You never see it while voting. Your accuracy is measured against it after each vote.
          </div>
        </div>

        {/* ── Mode selection ───────────────────────────────────── */}
        {!returning && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
            {MODES.map(m=>{
              const sel=mode===m.id;
              const hov=hovered===m.id;
              return (
                <div key={m.id} onClick={()=>setMode(m.id)}
                  onMouseEnter={()=>setHovered(m.id)}
                  onMouseLeave={()=>setHovered(null)}
                  style={{
                    background:sel?`linear-gradient(145deg,${m.color}18,${m.color}08)`
                               :hov?"rgba(255,255,255,0.04)":"rgba(5,12,20,0.7)",
                    border:sel?`1.5px solid ${m.color}`
                           :hov?`1px solid ${m.color}55`:"0.5px solid rgba(255,255,255,0.1)",
                    borderRadius:16, padding:"22px 18px", cursor:"pointer",
                    transition:"all 0.2s", textAlign:"left", position:"relative", overflow:"hidden",
                    transform:hov&&!sel?"translateY(-3px)":"none",
                    boxShadow:sel?`0 8px 32px ${m.color}22`
                              :hov?`0 4px 20px ${m.color}15`:"none",
                  }}>
                  {sel && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${m.color},transparent)`}}/>}
                  <div style={{fontSize:22,color:m.color,marginBottom:10,opacity:sel?1:0.5}}>{m.icon}</div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:sel?m.color:hov?`${m.color}cc`:"rgba(255,255,255,0.6)",letterSpacing:"0.12em",marginBottom:2}}>{m.label}</div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:sel?m.color:"rgba(255,255,255,0.3)",marginBottom:12}}>{m.sub}</div>
                  <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.55)",fontStyle:"italic",lineHeight:1.6,marginBottom:14}}>{m.desc}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {m.steps.map((s,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:4,height:4,borderRadius:"50%",background:sel?m.color:"rgba(255,255,255,0.2)",flexShrink:0,boxShadow:sel?`0 0 6px ${m.color}`:"none"}}/>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:sel?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.3)"}}>{s}</span>
                      </div>
                    ))}
                  </div>
                  {sel && <div style={{marginTop:14,fontFamily:"'Space Mono',monospace",fontSize:8,color:m.color,letterSpacing:"0.15em"}}>✓ SELECTED</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Welcome back ─────────────────────────────────────── */}
        {returning && (
          <div style={{
            background:"linear-gradient(135deg,rgba(29,158,117,0.1),rgba(29,158,117,0.04))",
            border:"1px solid #1D9E7544", borderRadius:14,
            padding:"20px 24px", marginBottom:22, textAlign:"left",
            boxShadow:"0 8px 32px rgba(29,158,117,0.1)",
          }}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#1D9E75",letterSpacing:"0.2em",marginBottom:12}}>WELCOME BACK</div>
            <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
              {[["JR",returning.jr||1000],["VOTES",returning.totalVotes||0],["ACCURACY",`${Math.round(returning.accuracy||0)}%`],["MODE",returning.mode||"—"]].map(([k,v])=>(
                <div key={k}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.3)",marginBottom:3}}>{k}</div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:700,color:"#e8f4ff"}}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>{setReturning(null);setName("");}} style={{marginTop:14,background:"transparent",border:"none",fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)",cursor:"pointer",padding:0,textDecoration:"underline"}}>not you? create a new account</button>
          </div>
        )}

        {/* ── Callsign input ───────────────────────────────────── */}
        <div style={{
          background:"rgba(5,12,20,0.85)",
          border:"0.5px solid rgba(255,255,255,0.12)",
          borderRadius:18, padding:"26px 28px",
          boxShadow:"0 20px 60px rgba(0,0,0,0.4)",
        }}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:"0.2em",marginBottom:14,textAlign:"left"}}>{returning?"YOUR CALLSIGN":"CHOOSE YOUR CALLSIGN"}</div>
          <input value={name} onChange={handleNameChange} onKeyDown={e=>e.key==="Enter"&&handle()}
            placeholder="e.g. Voyager7, dr_exo, cassini" maxLength={20}
            style={{
              width:"100%", background:"rgba(255,255,255,0.04)",
              border:`1px solid ${returning?"#1D9E7566":formatOk?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.1)"}`,
              borderRadius:10, padding:"13px 16px",
              fontFamily:"'Space Mono',monospace", fontSize:13, color:"#e8f4ff",
              outline:"none", marginBottom:8, boxSizing:"border-box",
              transition:"border-color 0.2s",
            }}/>
          {err && <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#E24B4A",marginBottom:8,textAlign:"left"}}>{err}</div>}
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.2)",marginBottom:20,textAlign:"left"}}>
            {returning?"Your account was found — click below to continue.":"Returning? Enter your callsign to pick up where you left off."}
          </div>
          <button onClick={handle} disabled={!formatOk||checking} style={{
            width:"100%", fontFamily:"'Orbitron',sans-serif", fontSize:12, fontWeight:700,
            padding:"15px 0", borderRadius:10, letterSpacing:"0.12em", transition:"all 0.2s",
            cursor:(formatOk&&!checking)?"pointer":"not-allowed",
            background:!formatOk?"rgba(255,255,255,0.03)"
              :returning?"linear-gradient(135deg,rgba(29,158,117,0.3),rgba(29,158,117,0.15))"
              :mode==="advanced"?"linear-gradient(135deg,rgba(29,158,117,0.3),rgba(29,158,117,0.15))"
              :mode==="beginner"?"linear-gradient(135deg,rgba(55,138,221,0.3),rgba(55,138,221,0.15))"
              :"rgba(255,255,255,0.05)",
            color:!formatOk?"rgba(255,255,255,0.2)"
              :returning?"#1D9E75":mode==="advanced"?"#1D9E75"
              :mode==="beginner"?"#378ADD":"rgba(255,255,255,0.4)",
            border:!formatOk?"0.5px solid rgba(255,255,255,0.06)"
              :returning?"1.5px solid #1D9E75":mode==="advanced"?"1.5px solid #1D9E75"
              :mode==="beginner"?"1.5px solid #378ADD":"0.5px solid rgba(255,255,255,0.12)",
            boxShadow:formatOk&&(returning||mode)?`0 4px 24px ${returning||mode==="advanced"?"rgba(29,158,117,0.25)":"rgba(55,138,221,0.25)"}`:"none",
          }}>
            {checking?"CHECKING…":returning?"CONTINUE AS "+trimmed.toUpperCase():!mode?"CONTINUE →":mode==="advanced"?"CREATE PROFILE → TAKE QUIZ":"START EXPLORING →"}
          </button>
        </div>
      </div>
    </div>
  );
}
