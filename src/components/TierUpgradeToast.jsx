import { useEffect } from 'react';
import TierBadge from './primitives/TierBadge';

export default function TierUpgradeToast({tier, reason, wentUp, onDismiss}) {
  useEffect(()=>{const t=setTimeout(onDismiss,5000);return()=>clearTimeout(t);},[]);
  const borderColor = wentUp ? tier.color : "#E24B4A";
  return (
    <div style={{position:"fixed",top:72,left:"50%",transform:"translateX(-50%)",zIndex:201,background:"rgba(4,10,22,0.97)",border:`1.5px solid ${borderColor}`,borderRadius:12,padding:"18px 28px",minWidth:320,textAlign:"center",boxShadow:`0 0 40px ${borderColor}44`}}>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:borderColor,letterSpacing:"0.2em",marginBottom:8}}>{wentUp?"TIER UPGRADE":"TIER DROP"}</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:900,color:tier.color,marginBottom:4}}>{tier.label}</div>
      <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.5)",fontStyle:"italic",marginBottom:12}}>{reason}</div>
      <TierBadge tier={tier}/>
    </div>
  );
}
