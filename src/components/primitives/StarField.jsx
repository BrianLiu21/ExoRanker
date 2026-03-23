export default function StarField() {
  const s = Array.from({length:140},(_,i)=>({x:(i*137.508)%100,y:(i*97.3)%100,r:i%7===0?1.5:i%3===0?1.0:0.6,o:0.2+(i%5)*0.12}));
  return (<div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}><svg width="100%" height="100%" style={{position:"absolute",inset:0}}>{s.map((s,i)=><circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o}/>)}</svg></div>);
}
