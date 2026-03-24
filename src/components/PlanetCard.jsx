import { HC } from '../constants/colors';
import PlanetOrb from './primitives/PlanetOrb';

export default function PlanetCard({planet,onClick}) {
  const c=HC[planet.hue]||HC.blue;
  const esiCol=planet.esi>=0.7?"#1D9E75":planet.esi>=0.4?"#EF9F27":"#888780";
  return (
    <div onClick={()=>onClick&&onClick(planet)} style={{
      position:"relative", flex:1,
      background:`linear-gradient(140deg,${c.bg}f8,#050c14f8)`,
      border:`1px solid ${c.border}`,
      borderRadius:14, padding:"20px 22px",
      cursor:onClick?"pointer":"default",
      transition:"transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
      willChange:"transform",
    }}
      onMouseEnter={e=>{
        if(!onClick)return;
        e.currentTarget.style.transform="scale(1.027) translateY(-4px)";
        e.currentTarget.style.boxShadow=`0 12px 40px ${c.accent}2e, 0 0 0 1px ${c.accent}55`;
        e.currentTarget.style.borderColor=c.accent;
      }}
      onMouseLeave={e=>{
        e.currentTarget.style.transform="";
        e.currentTarget.style.boxShadow="";
        e.currentTarget.style.borderColor=c.border;
      }}>
      {/* Subtle top-edge glow */}
      <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:1,background:`linear-gradient(90deg, transparent, ${c.accent}66, transparent)`,borderRadius:1,pointerEvents:"none"}}/>
      <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
        <PlanetOrb planet={planet} size={50}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#e8f4ff",letterSpacing:"0.05em",marginBottom:3,lineHeight:1.3}}>{planet.name}</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:c.accent,marginBottom:2}}>{planet.type}</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.62)"}}>{planet.host}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px",marginBottom:14}}>
        {[
          ["Radius",`${planet.radius}× Earth`],
          ["Mass",planet.mass?`${planet.mass}× Earth`:"-"],
          ["Eq. temp",`${planet.temp} K`],
          ["Period",planet.period<1?`${(planet.period*24).toFixed(1)}h`:`${planet.period}d`],
          ["Distance",planet.dist<1000?`${planet.dist} ly`:`${(planet.dist/1000).toFixed(1)}k ly`],
          ["Discovered",`${planet.year} · ${planet.scope}`],
        ].map(([k,v])=>(
          <div key={k}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.52)",marginBottom:2,letterSpacing:"0.08em"}}>{k.toUpperCase()}</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.85)"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{borderTop:`0.5px solid ${c.border}55`,paddingTop:10,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.58)",letterSpacing:"0.1em",flexShrink:0}}>ESI</span>
        <div style={{flex:1,height:3,background:"rgba(255,255,255,0.07)",borderRadius:2}}>
          <div style={{width:`${Math.round(planet.esi*100)}%`,height:"100%",background:`linear-gradient(90deg,${esiCol}99,${esiCol})`,borderRadius:2,boxShadow:`0 0 6px ${esiCol}66`}}/>
        </div>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:esiCol,fontWeight:"bold",minWidth:28,textAlign:"right"}}>{Math.round(planet.esi*100)}%</span>
      </div>
      {onClick && (
        <div style={{textAlign:"right",marginTop:8}}>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:c.accent,letterSpacing:"0.08em"}}>explore →</span>
        </div>
      )}
    </div>
  );
}
