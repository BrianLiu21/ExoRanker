import { HC } from '../../constants/colors';

export default function Tag({label,hue}) {
  const c=HC[hue]||HC.blue;
  return <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,padding:"2px 7px",borderRadius:3,background:c.badge,color:c.text,border:`0.5px solid ${c.border}`,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{label}</span>;
}
