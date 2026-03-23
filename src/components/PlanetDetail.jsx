import { useState, useEffect } from 'react';
import { HC } from '../constants/colors';
import { habitabilityComponents, HAB_LABEL, HAB_COLOR } from '../utils/phi';
import { rdLabel, rdColor } from '../utils/glicko2';
import Planet3D from './Planet3D';
import PlanetOrb from './primitives/PlanetOrb';
import ScoreBar from './primitives/ScoreBar';

// ─── PLANET TYPE DESCRIPTIONS (beginner plain-language) ──────────────────────
const PLANET_TYPE_DESCRIPTIONS = {
  "Earth-size":    "A planet close to Earth's size. Rocky surface is likely, making these the most promising candidates for liquid water and potentially life.",
  "Super-Earth":   "Larger than Earth but smaller than Neptune. Could be rocky with a thick atmosphere, or a water world. Scientists are not yet sure which.",
  "Mini-Neptune":  "Smaller than Neptune but probably has a thick gas envelope. Unlikely to have a solid surface we could land on.",
  "Neptune-like":  "Similar in size to our Neptune, so likely a gas or ice giant with no solid surface. Interesting for atmospheric chemistry but not a habitability candidate.",
  "Gas Giant":     "A massive planet made mostly of gas, like Jupiter or Saturn. Too hostile for life as we know it, but useful as an atmospheric benchmark.",
  "Hot Jupiter":   "A giant gas planet orbiting so close to its star that surface temperatures exceed those of some stars. Scientifically fascinating but almost certainly lifeless.",
  "Hot Saturn":    "Like a Hot Jupiter but slightly smaller - a puffy gas giant blasted by its star. JWST can study its atmosphere in detail.",
  "Lava World":    "A rocky planet so close to its star that its surface is likely molten. Extreme temperatures make it uninhabitable but scientifically extreme.",
  "Hycean":        "A theorised class of ocean-covered world with a hydrogen-rich atmosphere. Could potentially support microbial life.",
  "Pulsar Planet": "A planet orbiting the remnant of an exploded star. The radiation environment is lethal, but this is historically important as the first exoplanet ever confirmed.",
  "Sub-Earth":     "Smaller than Earth, likely rocky. Too small to hold onto much atmosphere, similar to Mars.",
  "Temperate":     "A planet in the right temperature range for liquid water to exist on the surface, which is one of the most important criteria when searching for habitable worlds.",
};

export default function PlanetDetail({planet, onBack, voted, userMode}) {
  const isAdvanced = userMode === "advanced";
  const [analysis,setAnalysis]=useState("");
  const [loading,setLoading]=useState(false);
  const [fetched,setFetched]=useState(false);
  const c=HC[planet.hue]||HC.blue;
  const hc=habitabilityComponents(planet);
  const habColor=HAB_COLOR(hc.total);
  useEffect(()=>{
    if (!isAdvanced || !voted) return; // briefs are advanced + voted-only
    if(fetched)return;setFetched(true);setLoading(true);
    fetch("/api/brief",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planet})})
      .then(r=>r.json()).then(d=>setAnalysis(d.text||"Unavailable.")).catch(()=>setAnalysis("Analysis unavailable.")).finally(()=>setLoading(false));
  },[planet.id, isAdvanced]);
  return (
    <div style={{maxWidth:740,margin:"0 auto"}}>
      <button onClick={onBack} style={{background:"transparent",border:"0.5px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.45)",padding:"7px 14px",borderRadius:6,fontFamily:"'Space Mono',monospace",fontSize:10,cursor:"pointer",marginBottom:24,letterSpacing:"0.1em"}}>← BACK</button>
      <div style={{background:`linear-gradient(140deg,${c.bg}e0,#050c14e0)`,border:`1px solid ${c.border}`,borderRadius:16,padding:"28px 32px",marginBottom:20}}>
        {/* 3D model - advanced only */}
        {isAdvanced && (
          <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
            <Planet3D planet={planet} size={180}/>
          </div>
        )}
        {/* Beginner: simple 2D orb centered */}
        {!isAdvanced && (
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <PlanetOrb planet={planet} size={96} pulse/>
          </div>
        )}
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:c.accent,letterSpacing:"0.2em",marginBottom:5,textAlign:"center"}}>{planet.scope} · {planet.year}</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:900,color:"#e8f4ff",letterSpacing:"0.05em",marginBottom:3,textAlign:"center"}}>{planet.name}</div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:15,color:"rgba(255,255,255,0.45)",fontStyle:"italic",textAlign:"center",marginBottom: !isAdvanced ? 14 : 0}}>{planet.type} · {planet.host}</div>
          {/* Beginner: plain-language planet type explanation */}
          {!isAdvanced && PLANET_TYPE_DESCRIPTIONS[planet.type] && (
            <div style={{background:"rgba(55,138,221,0.07)",border:"0.5px solid #378ADD33",borderRadius:8,padding:"10px 14px",marginTop:10,textAlign:"left"}}>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#378ADD",letterSpacing:"0.1em",marginRight:8}}>WHAT IS THIS?</span>
              <span style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{PLANET_TYPE_DESCRIPTIONS[planet.type]}</span>
            </div>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[["Radius",`${planet.radius}x Earth`],["Mass",planet.mass?`${planet.mass}x Earth`:"-"],["Eq. Temp",`${planet.temp} K`],["Period",planet.period<1?`${(planet.period*24).toFixed(1)}h`:`${planet.period}d`],["Distance",planet.dist<1000?`${planet.dist} ly`:`${(planet.dist/1000).toFixed(1)}k ly`],["Host",planet.host],["Rating",planet.r||1500],["Confidence",rdLabel(planet.rd||350)]].map(([k,v])=>(
            <div key={k} style={{background:"rgba(0,0,0,0.28)",borderRadius:7,padding:"10px 12px"}}><div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",marginBottom:3}}>{k}</div><div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"rgba(255,255,255,0.88)",fontWeight:"bold"}}>{v}</div></div>
          ))}
        </div>
      </div>

      {/* Glicko-2 rating strip */}
      <div style={{background:"rgba(5,12,20,0.6)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:rdColor(planet.rd||350)}}>{planet.r||1500}</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.3)"}}>±{planet.rd||350}</div>
        </div>
        <div style={{flex:1,minWidth:120}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em"}}>COMMUNITY RATING</span>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:rdColor(planet.rd||350)}}>{rdLabel(planet.rd||350)}</span>
          </div>
          <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
            <div style={{width:`${Math.round((1-Math.min(350,planet.rd||350)/350)*100)}%`,height:"100%",background:rdColor(planet.rd||350),borderRadius:2,transition:"width 0.5s"}}/>
          </div>
        </div>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.2)",maxWidth:160,lineHeight:1.5}}>
          {planet.matchups||0} matchups · more votes = narrower ±
        </div>
      </div>

      {/* PHI breakdown - advanced only */}
      {isAdvanced && (voted ? (
        <div style={{background:"rgba(5,12,20,0.82)",border:`0.5px solid ${habColor}44`,borderRadius:16,padding:"22px 28px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:5,height:5,borderRadius:"50%",background:habColor,boxShadow:`0 0 7px ${habColor}`}}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:habColor,letterSpacing:"0.15em"}}>HABITABILITY BREAKDOWN</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,color:habColor}}>{Math.round(hc.total*100)}<span style={{fontSize:11,opacity:0.6}}>/100</span></div><div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.35)"}}>{HAB_LABEL(hc.total)}</div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <ScoreBar value={hc.hz}  color="#1D9E75" label="HZ POSITION (eq. temp vs 255K) · 25%"/>
            <ScoreBar value={hc.rk}  color="#378ADD" label="ROCKY LIKELIHOOD (radius class) · 20%"/>
            <ScoreBar value={hc.tl}  color="#7F77DD" label="TIDAL LOCK SAFETY (period + star type) · 15%"/>
            <ScoreBar value={hc.act} color="#EF9F27" label="STELLAR ACTIVITY (star type + age) · 15%"/>
            <ScoreBar value={hc.atm} color="#B5D4F4" label="ATMOSPHERE RETENTION (gravity + temp) · 10%"/>
            <ScoreBar value={hc.esi} color="#9FE1CB" label="EARTH SIMILARITY INDEX (ESI) · 10%"/>
            <ScoreBar value={hc.obs} color="#888780" label="OBSERVABILITY (distance + transit freq) · 5%"/>
          </div>
          <div style={{marginTop:14,fontFamily:"'Crimson Pro',serif",fontSize:12,color:"rgba(255,255,255,0.35)",fontStyle:"italic",lineHeight:1.5}}>
            PHI - Probabilistic Habitability Index. Hidden ground truth for voter accuracy scoring.
            {planet.st && <span> Host star: <span style={{color:"rgba(255,255,255,0.55)"}}>{planet.st}-type</span>{planet.stAge ? `, ~${planet.stAge} Gyr` : ""}.</span>}
            {" "}Stellar activity and tidal lock use real data where available; proxied for deployed NASA catalog.
          </div>
        </div>
      ) : (
        <div style={{background:"rgba(5,12,20,0.6)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"22px 28px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:"0.15em",marginBottom:8}}>HABITABILITY BREAKDOWN · LOCKED</div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:14,color:"rgba(255,255,255,0.3)",fontStyle:"italic"}}>Vote on this planet in a matchup to unlock its full breakdown.</div>
        </div>
      ))}

      {/* Scientific brief - advanced only */}
      {isAdvanced && (voted ? (
        <div style={{background:"rgba(5,12,20,0.82)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px 28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}><div style={{width:5,height:5,borderRadius:"50%",background:c.accent,boxShadow:`0 0 7px ${c.accent}`}}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:c.accent,letterSpacing:"0.15em"}}>SCIENTIFIC BRIEF</div></div>
          {loading
            ?<div style={{display:"flex",flexDirection:"column",gap:9}}>{[100,86,92].map((w,i)=><div key={i} style={{height:12,width:`${w}%`,background:"rgba(255,255,255,0.05)",borderRadius:3,animation:"shimmer 1.5s ease-in-out infinite"}}/>)}<div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:6}}>Generating...</div></div>
            :<div>{analysis.split("\n\n").filter(Boolean).map((p,i)=><p key={i} style={{fontFamily:"'Crimson Pro',serif",fontSize:15,lineHeight:1.8,color:"rgba(255,255,255,0.72)",marginBottom:14,marginTop:0}}>{p}</p>)}</div>
          }
        </div>
      ) : (
        <div style={{background:"rgba(5,12,20,0.6)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"22px 28px",textAlign:"center"}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:"0.15em",marginBottom:8}}>SCIENTIFIC BRIEF · LOCKED</div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:14,color:"rgba(255,255,255,0.3)",fontStyle:"italic"}}>Vote on this planet in a matchup to unlock the scientific brief.</div>
        </div>
      ))}
    </div>
  );
}
