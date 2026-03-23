import { HC } from '../../constants/colors';

export default function PlanetOrb({planet,size=48,pulse=false}) {
  const c=HC[planet.hue]||HC.blue;
  const rings=planet.type.includes("Jupiter")||planet.type.includes("Saturn")||planet.type.includes("Giant");
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      {/* Ambient outer glow */}
      <div style={{position:"absolute",inset:`-${Math.round(size*0.12)}px`,borderRadius:"50%",background:`radial-gradient(circle, ${c.accent}22 0%, transparent 70%)`,pointerEvents:"none"}}/>
      {/* Planet body */}
      <div style={{
        width:size,height:size,borderRadius:"50%",
        background:`radial-gradient(circle at 32% 28%, ${c.accent}ee 0%, ${c.bg} 68%)`,
        border:`1.5px solid ${c.border}`,
        boxShadow:`0 0 ${Math.round(size*0.55)}px ${c.accent}3a, inset 0 0 ${Math.round(size*0.3)}px rgba(0,0,0,0.55)`,
        animation:pulse?"orb-pulse 3s ease-in-out infinite":"none",
        position:"relative",
      }}/>
      {/* Specular highlight */}
      <div style={{
        position:"absolute",
        top:`${Math.round(size*0.14)}px`,
        left:`${Math.round(size*0.19)}px`,
        width:`${Math.round(size*0.33)}px`,
        height:`${Math.round(size*0.17)}px`,
        borderRadius:"50%",
        background:"radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, transparent 100%)",
        transform:"rotate(-28deg)",
        pointerEvents:"none",
      }}/>
      {/* Ring (gas giants) */}
      {rings&&<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotateX(68deg)",width:size*1.7,height:size*1.7,borderRadius:"50%",border:`1.5px solid ${c.accent}55`,pointerEvents:"none"}}/>}
    </div>
  );
}
