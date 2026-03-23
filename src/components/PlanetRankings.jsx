import { HC } from '../constants/colors';
import { rdColor } from '../utils/glicko2';
import PlanetOrb from './primitives/PlanetOrb';

export default function PlanetRankings({planets, onViewDetail, lastVotedIds}) {
  const sorted = [...planets].sort((a,b) => b.r - a.r);
  const recentIds = lastVotedIds || new Set();

  return (
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.2em",color:"rgba(255,255,255,0.3)",marginBottom:6}}>KNOWLEDGE-WEIGHTED GLICKO-2 · CROWDSOURCED CONSENSUS</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:700,color:"#e8f4ff",marginBottom:6}}>Planet Priority Index</div>
        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.35)",fontStyle:"italic"}}>Habitability scores are hidden from voters. Rankings emerge from blind inference.</div>
      </div>

      {sorted.map((p,i)=>{
        const c = HC[p.hue]||HC.blue;
        const isRecent = recentIds.has(p.id);
        return (
          <div key={p.id} onClick={()=>onViewDetail(p)}
            style={{display:"grid",gridTemplateColumns:"40px 1fr auto",alignItems:"center",gap:14,padding:"12px 14px",marginBottom:5,borderRadius:10,
              background: isRecent ? `${c.bg}cc` : "rgba(5,12,20,0.72)",
              border: isRecent ? `0.5px solid ${c.border}` : "0.5px solid rgba(255,255,255,0.06)",
              cursor:"pointer",transition:"background 0.25s,border-color 0.25s,transform 0.22s ease,box-shadow 0.22s ease",
              willChange:"transform"}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${c.bg}bb`;e.currentTarget.style.borderColor=c.accent;e.currentTarget.style.transform="scale(1.018) translateX(3px)";e.currentTarget.style.boxShadow=`0 4px 20px ${c.accent}22`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=isRecent?`${c.bg}cc`:"rgba(5,12,20,0.72)";e.currentTarget.style.borderColor=isRecent?c.border:"rgba(255,255,255,0.06)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
            <div style={{textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i<3?16:12,fontWeight:700,
              color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":c.accent}}>
              #{i+1}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <PlanetOrb planet={p} size={26}/>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#e8f4ff"}}>{p.name}</div>
                  {isRecent && <div style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:c.accent,letterSpacing:"0.08em"}}>JUST VOTED</div>}
                </div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.4)"}}>{p.type} · {p.host}</div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:700,color:c.accent}}>{p.r||1500}</div>
              <div style={{display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end",marginTop:2}}>
                <div style={{width:28,height:2,background:"rgba(255,255,255,0.06)",borderRadius:1}}>
                  <div style={{width:`${Math.round((1-(Math.min(350,p.rd||350)/350))*100)}%`,height:"100%",background:rdColor(p.rd||350),borderRadius:1}}/>
                </div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.25)"}}>{p.matchups||0}v</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
