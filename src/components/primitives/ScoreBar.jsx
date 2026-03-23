export default function ScoreBar({value,color,label}) {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"0.08em"}}>{label}</span>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color}}>{Math.round(value*100)}%</span>
      </div>
      <div style={{height:3,background:"rgba(255,255,255,0.08)",borderRadius:2}}><div style={{width:`${Math.round(value*100)}%`,height:"100%",background:color,borderRadius:2,transition:"width 0.5s ease"}}/></div>
    </div>
  );
}
