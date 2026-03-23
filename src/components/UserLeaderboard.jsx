import { SB_ON } from '../config/supabase';
import { getEffectiveTier, USER_ELO_TIERS } from '../utils/userTiers';
import TierBadge from './primitives/TierBadge';

export default function UserLeaderboard({allUsers, currentUser, lastSync}) {
  const adv = allUsers.filter(u => u.mode === "advanced");
  const list = [...adv].sort((a,b) => (b.jr||1000) - (a.jr||1000));
  return (
    <div style={{maxWidth:620,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:6}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.2em",color:"rgba(255,255,255,0.3)"}}>CONTRIBUTOR STANDINGS</div>
          {lastSync&&<div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:SB_ON?"#1D9E7555":"rgba(255,255,255,0.15)"}}>{SB_ON?"LIVE":"LOCAL"} · synced {lastSync}</div>}
        </div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:700,color:"#e8f4ff",marginBottom:6}}>Judgment Leaderboard</div>
        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.35)",fontStyle:"italic"}}>Ranked by Judgment Rating. Rises on correct votes and falls on wrong ones. Tiers can drop.</div>
      </div>
      {list.length === 0 && (
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"rgba(255,255,255,0.25)",marginBottom:12}}>No contributors yet. You are the first.</div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.2)",fontStyle:"italic",lineHeight:1.6}}>Deploy to Vercel and share the link. Other users' votes will appear here in real time.</div>
        </div>
      )}
      {list.map((u,i) => {
        const tier  = getEffectiveTier(u.jr||1000, u.mode);
        const isMe  = u.username === currentUser.username;
        const jrVal = u.jr || 1100;
        // Mini JR bar to next tier
        const nextT = [...USER_ELO_TIERS].sort((a,b)=>a.minElo-b.minElo).find(t=>t.minElo>jrVal);
        const curT  = tier;
        const barPct = nextT
          ? Math.round(((jrVal-(curT.minElo||700))/(nextT.minElo-(curT.minElo||700)))*100)
          : 100;
        return (
          <div key={u.username}
            style={{padding:"14px 18px",marginBottom:6,borderRadius:10,background:isMe?"rgba(29,158,117,0.08)":"rgba(5,12,20,0.7)",border:isMe?"0.5px solid #1D9E7555":"0.5px solid rgba(255,255,255,0.06)",cursor:"pointer",transition:"transform 0.22s ease,box-shadow 0.22s ease,border-color 0.22s ease",willChange:"transform"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.016) translateX(3px)";e.currentTarget.style.boxShadow=`0 4px 20px ${tier.color}22`;e.currentTarget.style.borderColor=tier.color+"88";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor=isMe?"#1D9E7555":"rgba(255,255,255,0.06)";}}>
            <div style={{display:"grid",gridTemplateColumns:"36px 1fr auto",alignItems:"center",gap:14}}>
              <div style={{textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i<3?15:11,fontWeight:700,color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"rgba(255,255,255,0.4)"}}>#{i+1}</div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                  <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:isMe?"#1D9E75":"#e8f4ff"}}>{u.username}</span>
                  {isMe && <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#1D9E75"}}>YOU</span>}
                  <TierBadge tier={tier} sm/>
                </div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.25)"}}>{u.totalVotes} votes · {Math.round(u.accuracy||0)}% acc</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,color:tier.color}}>{jrVal}</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.3)"}}>JR</div>
              </div>
            </div>
            {/* Progress to next tier */}
            <div style={{marginTop:8,paddingLeft:50}}>
              <div style={{height:2,background:"rgba(255,255,255,0.06)",borderRadius:1}}>
                <div style={{width:`${Math.min(100,barPct)}%`,height:"100%",background:nextT?nextT.color:tier.color,borderRadius:1,transition:"width 0.5s"}}/>
              </div>
              {nextT && <div style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.2)",marginTop:3}}>{nextT.minElo - jrVal} JR to {nextT.label}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
