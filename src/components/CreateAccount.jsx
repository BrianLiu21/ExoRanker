import { useState } from 'react';
import { sb, SB_ON } from '../config/supabase';

export default function CreateAccount({onComplete, onLogin, planetCount, liveData}) {
  const [name,setName]=useState("");
  const [mode,setMode]=useState(null);
  const [err,setErr]=useState("");
  const [checking,setChecking]=useState(false);
  const [returning,setReturning]=useState(null); // existing user data if found
  const trimmed=name.trim();
  const formatOk=trimmed.length>=2&&trimmed.length<=20&&/^[a-zA-Z0-9_\-. ]+$/.test(trimmed);
  const valid=formatOk&&(returning||!!mode);

  const handleNameChange=(e)=>{
    setName(e.target.value);
    setErr("");
    setReturning(null);
  };

  const handle=async()=>{
    if(!formatOk){setErr("2–20 chars, letters/numbers/._- only");return;}

    // If we already confirmed they're returning, log them in
    if(returning){onLogin(returning);return;}

    if(SB_ON){
      setChecking(true);
      const existing=await sb.get("users",`select=*&username=eq.${encodeURIComponent(trimmed)}`);
      setChecking(false);
      if(Array.isArray(existing)&&existing.length>0){
        setReturning(existing[0]);
        return; // show the welcome-back UI, wait for confirm click
      }
    }

    // New user — require mode
    if(!mode){setErr("Choose a mode to create your account.");return;}
    onComplete(trimmed, mode);
  };

  return (
    <div style={{maxWidth:520,margin:"0 auto",textAlign:"center"}}>
      <div style={{marginBottom:32}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:"0.25em",marginBottom:14}}>WELCOME TO EXORANKER</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:24,fontWeight:900,color:"#e8f4ff",marginBottom:10,letterSpacing:"0.06em"}}>Create your observer profile</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:8}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:liveData?"#1D9E75":"#888780",boxShadow:liveData?"0 0 8px #1D9E75":"none"}}/>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)"}}>{liveData?`${planetCount} planets · live NASA data`:`${planetCount} planets · built-in dataset`}</span>
        </div>
      </div>

      {/* PHI explanation */}
      <div style={{background:"rgba(29,158,117,0.06)",border:"0.5px solid #1D9E7533",borderRadius:12,padding:"16px 20px",marginBottom:20,textAlign:"left"}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#1D9E75",letterSpacing:"0.15em",marginBottom:8}}>HOW THIS WORKS</div>
        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:14,color:"rgba(255,255,255,0.65)",lineHeight:1.7,marginBottom:10}}>
          Each planet has a hidden <strong style={{color:"#1D9E75"}}>PHI score</strong> (Probabilistic Habitability Index) calculated from seven scientific factors: habitable zone position, rocky likelihood, tidal lock risk, stellar activity, atmosphere retention, Earth similarity, and observability.
        </div>
        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.7}}>
          You never see the PHI score while voting. You read the raw data and judge which planet is a stronger JWST candidate. Your votes are then scored against the hidden PHI ground truth, which is how we measure whether the crowd's judgment is converging on the right answer.
        </div>
      </div>

      {/* Mode selection — hidden when returning user detected */}
      {!returning && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {
              id:"beginner",
              label:"LEARN",
              sub:"Learner mode",
              color:"#378ADD",
              desc:"Vote on planet pairs using only the raw data: radius, temperature, orbit, and distance. Build your intuition for what makes a strong JWST candidate without being told the answers.",
              steps:[
                "No quiz required, start voting immediately",
                "Plain-language planet type explanations",
                "Your votes are practice, not research data",
                "PHI scores and rankings stay hidden",
              ],
            },
            {
              id:"advanced",
              label:"CONTRIBUTE",
              sub:"Contributor mode",
              color:"#1D9E75",
              desc:"Your votes become part of a real crowdsourced JWST priority dataset. Take a knowledge quiz first. Your score sets your Judgment Rating starting point and determines how much weight your votes carry.",
              steps:[
                "Take a quiz → earn a Judgment Rating",
                "Votes weighted by your JR tier",
                "Higher JR draws from a tighter pool of similar planets",
                "Unlock PHI breakdown, 3D model, scientific brief",
                "Appear on the leaderboard · JR rises and falls",
              ],
            },
          ].map(m=>{
            const selected=mode===m.id;
            return (
              <div key={m.id} onClick={()=>setMode(m.id)} style={{
                background:selected?`${m.color}14`:"rgba(5,12,20,0.7)",
                border:selected?`1.5px solid ${m.color}`:"0.5px solid rgba(255,255,255,0.1)",
                borderRadius:14, padding:"22px 18px", cursor:"pointer",
                transition:"all 0.2s", textAlign:"left",
              }}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:selected?m.color:"rgba(255,255,255,0.6)",letterSpacing:"0.12em",marginBottom:2}}>{m.label}</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:selected?m.color:"rgba(255,255,255,0.3)",marginBottom:12}}>{m.sub}</div>
                <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.55)",fontStyle:"italic",lineHeight:1.6,marginBottom:14}}>{m.desc}</div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {m.steps.map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:4,height:4,borderRadius:"50%",background:selected?m.color:"rgba(255,255,255,0.2)",flexShrink:0}}/>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:selected?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.3)"}}>{s}</span>
                    </div>
                  ))}
                </div>
                {selected&&<div style={{marginTop:12,fontFamily:"'Space Mono',monospace",fontSize:8,color:m.color,letterSpacing:"0.1em"}}>✓ SELECTED</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Welcome back banner */}
      {returning && (
        <div style={{background:"rgba(29,158,117,0.08)",border:"1px solid #1D9E7555",borderRadius:12,padding:"16px 20px",marginBottom:20,textAlign:"left"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#1D9E75",letterSpacing:"0.15em",marginBottom:8}}>WELCOME BACK</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[
              ["JR", returning.jr||1000],
              ["VOTES", returning.totalVotes||0],
              ["ACCURACY", `${Math.round(returning.accuracy||0)}%`],
              ["MODE", returning.mode||"—"],
            ].map(([k,v])=>(
              <div key={k}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.3)",marginBottom:2}}>{k}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#e8f4ff"}}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>{setReturning(null);setName("");}} style={{marginTop:12,background:"transparent",border:"none",fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)",cursor:"pointer",padding:0,textDecoration:"underline"}}>not you? create a new account</button>
        </div>
      )}

      <div style={{background:"rgba(5,12,20,0.8)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"24px 28px"}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:"0.15em",marginBottom:12,textAlign:"left"}}>{returning?"YOUR CALLSIGN":"CHOOSE YOUR CALLSIGN"}</div>
        <input value={name} onChange={handleNameChange} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="e.g. Voyager7, dr_exo, cassini" maxLength={20}
          style={{width:"100%",background:"rgba(0,0,0,0.4)",border:`0.5px solid ${returning?"#1D9E7566":"rgba(255,255,255,0.15)"}`,borderRadius:8,padding:"12px 16px",fontFamily:"'Space Mono',monospace",fontSize:13,color:"#e8f4ff",outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
        {err&&<div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#E24B4A",marginBottom:8,textAlign:"left"}}>{err}</div>}
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.2)",marginBottom:20,textAlign:"left"}}>
          {returning?"Your account was found — click below to continue.":"Returning? Enter your callsign to pick up where you left off."}
        </div>
        <button onClick={handle} disabled={!formatOk||checking} style={{
          width:"100%",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,padding:"14px 0",borderRadius:8,
          cursor:(formatOk&&!checking)?"pointer":"not-allowed",letterSpacing:"0.12em",transition:"all 0.2s",
          background:!formatOk?"rgba(255,255,255,0.04)":returning?"rgba(29,158,117,0.2)":mode==="advanced"?"rgba(29,158,117,0.2)":mode==="beginner"?"rgba(55,138,221,0.2)":"rgba(255,255,255,0.06)",
          color:!formatOk?"rgba(255,255,255,0.2)":returning?"#1D9E75":mode==="advanced"?"#1D9E75":mode==="beginner"?"#378ADD":"rgba(255,255,255,0.4)",
          border:!formatOk?"0.5px solid rgba(255,255,255,0.08)":returning?"1px solid #1D9E75":mode==="advanced"?"1px solid #1D9E75":mode==="beginner"?"1px solid #378ADD":"0.5px solid rgba(255,255,255,0.15)",
        }}>
          {checking?"CHECKING…":returning?"CONTINUE AS "+trimmed.toUpperCase():!mode?"CONTINUE →":mode==="advanced"?"CREATE PROFILE → TAKE QUIZ":"START EXPLORING →"}
        </button>
      </div>
    </div>
  );
}
