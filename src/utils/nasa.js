// ─── NASA DATA ENRICHMENT ─────────────────────────────────────────────────────
// ON DEPLOY: NASA API now supplies st_spectype and st_age for real stellar data

export function inferStarType(specType) {
  if (!specType) return null;
  const s = specType.trim().toUpperCase();
  if (s.startsWith("M")) return "M";
  if (s.startsWith("K")) return "K";
  if (s.startsWith("G")) return "G";
  if (s.startsWith("F")) return "F";
  if (s.startsWith("A") || s.startsWith("B")) return "A";
  return null;
}

export function calcESI(radius, temp) {
  if (!radius || !temp || temp <= 0) return 0;
  const rSim = Math.pow(1 - Math.abs(radius - 1.0) / (radius + 1.0), 0.57);
  const tSim = Math.pow(1 - Math.abs(temp - 288) / (temp + 288), 5.58);
  return parseFloat(Math.min(1, Math.max(0, Math.pow(rSim * tSim, 0.5))).toFixed(2));
}

export function classifyType(radius, temp) {
  if (radius < 1.25) return temp > 1200 ? "Lava World" : "Earth-size";
  if (radius < 2.0)  return temp > 1500 ? "Lava World" : "Super-Earth";
  if (radius < 4.0)  return temp > 180 && temp < 380 ? "Hycean World" : temp > 700 ? "Hot Sub-Neptune" : "Sub-Neptune";
  if (radius < 8.0)  return temp > 800 ? "Hot Neptune" : "Ice Giant";
  if (radius < 15.0) return temp > 900 ? "Hot Saturn" : "Gas Giant";
  return temp > 900 ? "Hot Jupiter" : "Cold Jupiter";
}

export function assignHue(type, temp) {
  if (["Earth-size","Super-Earth","Hycean World"].includes(type) && temp > 150 && temp < 380) return "teal";
  if (["Sub-Neptune","Hycean World"].includes(type)) return "blue";
  if (["Hot Jupiter","Hot Saturn","Hot Sub-Neptune"].includes(type)) return "amber";
  if (["Lava World"].includes(type) || temp > 2000) return "red";
  return "purple";
}

export function autoTags(radius, temp, dist, method, year) {
  const t = [];
  if (dist && dist < 50) t.push("nearby");
  if (temp > 180 && temp < 380 && radius < 2.5) t.push("HZ candidate");
  if (temp > 2000) t.push("extreme temp");
  if (method === "Imaging") t.push("directly imaged");
  if (year >= 2022) t.push("recent discovery");
  if (t.length < 2) t.push(radius < 1.5 ? "rocky" : "gas-dominated");
  return t.slice(0, 3);
}

// Fallback: infer star type from hostname patterns when spectype not available
export function inferStTypeFromName(hostname) {
  const h = hostname.toLowerCase();
  if (h.includes("trappist") || h.startsWith("gj") || h.startsWith("lhs") ||
      h.startsWith("wolf") || h.startsWith("teegarden") || h.startsWith("ltt") ||
      h.includes("proxima") || h.startsWith("gliese") || h.includes("toi 700") ||
      h.includes("toi-700") || h.includes("k2-18")) return "M";
  if (h.includes("kepler-442") || h.includes("kepler-62") || h.includes("hd 40307") ||
      h.includes("hd189733")) return "K";
  if (h.includes("tau ceti") || h.includes("51 peg") || h.includes("55 cancri") ||
      h.includes("kepler-452") || h.includes("kepler-22") || h.includes("sun")) return "G";
  if (h.includes("kelt-9") || h.includes("beta pic") || h.includes("hip 65426")) return "A";
  if (h.includes("wasp") || h.includes("hat-p-7") || h.includes("hr 8799")) return "F";
  return null;
}

export function enrichNASARow(r) {
  const radius = r.pl_rade != null ? +r.pl_rade : null;
  const mass   = r.pl_bmasse != null ? +r.pl_bmasse : null;
  const period = r.pl_orbper != null ? +r.pl_orbper : null;
  const temp   = r.pl_eqt != null ? +r.pl_eqt : null;
  const distPc = r.sy_dist != null ? +r.sy_dist : null;
  if (!radius || !period || !temp || temp <= 0) return null;
  const dist   = distPc ? parseFloat((distPc * 3.26156).toFixed(1)) : 9999;
  const esi    = calcESI(radius, temp);
  const type   = classifyType(radius, temp);
  // ON DEPLOY: st_spectype and st_age come directly from NASA API
  const st     = inferStarType(r.st_spectype) || inferStTypeFromName(r.hostname || "");
  const stAge  = r.st_age != null ? parseFloat((+r.st_age).toFixed(1)) : null;
  const ra  = r.ra  != null ? +r.ra  : null;
  const dec = r.dec != null ? +r.dec : null;
  return {
    id:     (r.pl_name || "").toLowerCase().replace(/[^a-z0-9]/g, "-"),
    name:   r.pl_name || "Unknown",
    host:   r.hostname || "Unknown",
    dist,   type, ra, dec,
    radius: parseFloat(radius.toFixed(2)),
    mass:   mass ? parseFloat(mass.toFixed(2)) : null,
    period: parseFloat(period.toFixed(2)),
    temp:   Math.round(temp),
    esi,    st, stAge,
    year:   r.disc_year || "?",
    scope:  r.disc_facility || r.discoverymethod || "Unknown",
    tags:   autoTags(radius, temp, dist, r.discoverymethod, r.disc_year),
    hue:    assignHue(type, temp),
  };
}
