import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from './utils/useIsMobile';
import { FONTS } from './constants/fonts';
import { HC } from './constants/colors';
import { SB_ON, sb } from './config/supabase';
import { FALLBACK_PLANETS } from './data/planets';
import { enrichNASARow } from './utils/nasa';
import { calcHabitability } from './utils/phi';
import { glicko2Matchup } from './utils/glicko2';
import { initPlanets } from './utils/elo';
import { getStreak } from './utils/streak';
import { getEffectiveTier, quizStartElo } from './utils/userTiers';
import StarField from './components/primitives/StarField';
import TierBadge from './components/primitives/TierBadge';
import CreateAccount from './components/CreateAccount';
import Quiz from './components/Quiz';
import VoteArena from './components/VoteArena';
import PlanetRankings from './components/PlanetRankings';
import UserLeaderboard from './components/UserLeaderboard';
import PlanetDetail from './components/PlanetDetail';
import MyProfile from './components/MyProfile';
import ExoMap from './components/ExoMap';
import AccuracyToast from './components/AccuracyToast';
import TierUpgradeToast from './components/TierUpgradeToast';

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [stage,setStage]=useState("account");
  const [view,setView]=useState("vote");
  const [lastVotedPair,setLastVotedPair]=useState(null);
  const [detail,setDetail]=useState(null);
  const [prevView,setPrevView]=useState("vote");
  const [planets,setPlanets]=useState(()=>initPlanets());
  const [planetCount,setPlanetCount]=useState(FALLBACK_PLANETS.length);
  const [liveData,setLiveData]=useState(false);
  const [toast,setToast]=useState(null);
  const [tierUpgradeToast,setTierUpgradeToast]=useState(null);
  const [lastSync,setLastSync]=useState(null);
  const [votedIds,setVotedIds]=useState(()=>{
    try{const p=JSON.parse(localStorage.getItem("er_voted1")||"[]");return new Set(Array.isArray(p)?p:[]);}catch{return new Set();}
  });
  const [recentVotedList,setRecentVotedList]=useState(()=>{
    try{const p=JSON.parse(localStorage.getItem("er_voted1")||"[]");return Array.isArray(p)?p:[];}catch{return [];}
  });
  const [user,setUser]=useState({username:"",quizScore:0,jr:1000,totalVotes:0,weightedCorrect:0,weightedTotal:0,accuracy:0,influence:0,streak:0,bestStreak:0,voteHistory:[],tutorialDone:false});
  const [allUsers,setAllUsers]=useState([]);

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(()=>{
    // Restore user from localStorage
    try {
      const u=localStorage.getItem("er_user1");
      if(u){const d=JSON.parse(u);setUser(d);setStage("app");}
    } catch {}

    async function loadPlanets() {
      let rawPlanets = null;
      let isLive = false;

      // Helper: parse and enrich a raw NASA TAP response array
      const parseNASARows = (rows) => {
        if (!Array.isArray(rows) || rows.length <= 10) return null;
        const seen = new Set();
        const enriched = [];
        for (const row of rows) {
          if (!row.pl_name || seen.has(row.pl_name)) continue;
          seen.add(row.pl_name);
          const p = enrichNASARow(row);
          if (p) enriched.push(p);
        }
        return enriched.length > 10 ? enriched : null;
      };

      // 1a. Try Vercel /api/planets proxy (works when deployed)
      try {
        const r = await fetch("/api/planets", { signal: AbortSignal.timeout(10000) });
        if (r.ok) {
          const rows = await r.json();
          const parsed = parseNASARows(rows);
          if (parsed) { rawPlanets = parsed; isLive = true; }
        }
      } catch {}

      // 1b. Try NASA Exoplanet Archive directly (works in local dev)
      if (!rawPlanets) {
        try {
          const cols = "pl_name,hostname,pl_rade,pl_bmasse,pl_orbper,pl_eqt,sy_dist,ra,dec,st_spectype,st_age,disc_year,disc_facility,discoverymethod";
          const q = `SELECT ${cols} FROM ps WHERE default_flag=1 AND pl_rade IS NOT NULL AND pl_eqt IS NOT NULL AND pl_orbper IS NOT NULL`;
          const url = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(q)}&format=json&maxrec=2000`;
          const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
          if (r.ok) {
            const rows = await r.json();
            const parsed = parseNASARows(rows);
            if (parsed) { rawPlanets = parsed; isLive = true; }
          }
        } catch {}
      }

      // 2. Fall back to built-in dataset
      if (!rawPlanets) rawPlanets = FALLBACK_PLANETS;

      setLiveData(isLive);
      setPlanetCount(rawPlanets.length);

      // 3. Merge with Supabase ELO data (shared rankings)
      const sbData = await sb.get("planets", "select=id,r,rd,sigma,matchups");
      const sbMap = {};
      if (Array.isArray(sbData)) sbData.forEach(p => { if (p && p.id) sbMap[p.id] = p; });

      // 4. Merge with localStorage ELO (local fallback)
      let localMap = {};
      try { const s=localStorage.getItem("er_planets1"); if(s) localMap=JSON.parse(s); } catch {}

      const initialized = initPlanets(rawPlanets).map(p => ({
        ...p,
        ...(localMap[p.id]||{}),
        ...(sbMap[p.id]||{}), // Supabase wins over local
      }));
      setPlanets(initialized);

      // 5. Load shared user leaderboard from Supabase
      const sbUsers = await sb.get("users", "select=*&order=accuracy.desc");
      if (Array.isArray(sbUsers) && sbUsers.length > 0) {
        setAllUsers(sbUsers);
        setLastSync(new Date().toLocaleTimeString());
      } else {
        // Fall back to localStorage users
        try { const u=localStorage.getItem("er_allusers1"); if(u){const p=JSON.parse(u);if(Array.isArray(p))setAllUsers(p);} } catch {}
      }
    }

    loadPlanets();

    // Poll Supabase every 60s for live leaderboard + ELO updates
    const poll = setInterval(async () => {
      const [sbPlanets, sbUsers] = await Promise.all([
        sb.get("planets", "select=id,r,rd,sigma,matchups"),
        sb.get("users", "select=*&order=accuracy.desc"),
      ]);
      if (Array.isArray(sbPlanets)) {
        const m = {}; sbPlanets.forEach(p => { if (p && p.id) m[p.id] = p; });
        setPlanets(prev => prev.map(p => m[p.id] ? { ...p, ...m[p.id] } : p));
      }
      if (Array.isArray(sbUsers) && sbUsers.length > 0) {
        setAllUsers(sbUsers);
        setLastSync(new Date().toLocaleTimeString());
      }
    }, 60000);

    return () => clearInterval(poll);
  }, []);

  const saveLocal = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

  const handleAccount = (username, mode) => {
    const u = { username, mode, quizScore:0, jr:1000, totalVotes:0, weightedCorrect:0, weightedTotal:0, accuracy:0, influence:0, streak:0, bestStreak:0, voteHistory:[], tutorialDone:false };
    setUser(u);
    if (mode === "advanced") {
      setStage("quiz");
    } else {
      saveLocal("er_user1", u);
      sb.upsert("users", u);
      setStage("app");
    }
  };

  const handleLogin = (existingUser) => {
    setUser(existingUser);
    saveLocal("er_user1", existingUser);
    setStage("app");
  };

  const handleQuizDone = async (score) => {
    const u = { ...user, quizScore: score, jr: quizStartElo(score) };
    setUser(u);
    saveLocal("er_user1", u);
    await sb.upsert("users", u);
    const next = allUsers.filter(x => x.username !== u.username).concat(u);
    setAllUsers(next);
    saveLocal("er_allusers1", next);
    setStage("app");
  };

  const handleVote = useCallback(async (aId, bId, winnerId) => {
    const tier = getEffectiveTier(user.jr||1000, user.mode);
    const pa = planets.find(x => x.id === aId);
    const pb = planets.find(x => x.id === bId);

    // Accuracy scoring against PHI ground truth
    const habA = calcHabitability(pa || {});
    const habB = calcHabitability(pb || {});
    const gap = Math.abs(habA - habB);
    const correctId = habA > habB ? aId : habB > habA ? bId : null;
    const correct = correctId !== null && winnerId === correctId;
    const MEANINGFUL_GAP = 0.08;
    const scoreable = gap >= MEANINGFUL_GAP;
    const points = scoreable ? parseFloat((gap * 100).toFixed(2)) : 0;

    // Streak multiplier - only scoreable votes affect streak
    const currentStreak = user.streak || 0;
    const newStreak = scoreable ? (correct ? currentStreak + 1 : 0) : currentStreak;
    const streakInfo = getStreak(currentStreak); // use pre-vote streak for this vote's multiplier
    const streakMult = streakInfo.mult;
    const effectiveK = Math.round(tier.k * streakMult);

    const isAdvanced = user.mode === "advanced";
    // ELO winner = PHI-correct planet, not user's vote.
    // This means voting for the wrong planet pushes the rankings toward ground truth
    // rather than rewarding the user's incorrect judgment with ELO for their chosen planet.
    // Planet ratings update via Glicko-2 - advanced mode only
    // Winner = PHI-correct planet so wrong votes push rankings toward ground truth
    const glickoWinnerId = correctId || winnerId;
    if (isAdvanced) {
      setPlanets(prev => {
        const pA = prev.find(x => x.id === aId);
        const pB = prev.find(x => x.id === bId);
        if (!pA || !pB) return prev;
        const { pa: newA, pb: newB } = glicko2Matchup(pA, pB, glickoWinnerId, tier.weight);
        const next = prev.map(p =>
          p.id === aId ? newA : p.id === bId ? newB : p
        );
        // Persist locally
        const m = {};
        next.forEach(p => m[p.id] = { r:p.r, rd:p.rd, sigma:p.sigma, matchups:p.matchups });
        saveLocal("er_planets1", m);
        // Async Supabase sync
        [newA, newB].forEach(p => sb.upsert("planets", { id:p.id, r:p.r, rd:p.rd, sigma:p.sigma, matchups:p.matchups }));
        return next;
      });
    }

    // Update voted IDs (unlocks detail breakdown)
    setVotedIds(prev => {
      const next = new Set([...prev, aId, bId]);
      saveLocal("er_voted1", [...next]);
      return next;
    });
    // Track recency order (newest first)
    setRecentVotedList(prev => {
      const updated = [bId, aId, ...prev.filter(id => id !== aId && id !== bId)];
      return updated.slice(0, 120);
    });

    // Update user accuracy, jr, and influence
    setUser(prev => {
      const wt = prev.weightedTotal + (scoreable ? points : 0);
      const wc = prev.weightedCorrect + (scoreable && correct ? points : 0);
      const acc = wt > 0 ? Math.round((wc / wt) * 100) : 0;
      const newVotes = prev.totalVotes + 1;
      const newHistory = scoreable ? [...(prev.voteHistory||[]).slice(-49), correct?1:0] : (prev.voteHistory||[]);

      // JR: shifts on every scoreable vote based on gap size + streak
      // Correct → gain points. Wrong → lose points. Bigger gap = bigger swing.
      const eloShift = scoreable ? Math.max(4, Math.round(gap * effectiveK)) : 0;
      const newUserElo = Math.max(700, (prev.jr||1000) + (correct ? eloShift : -eloShift));
      const newTier = getEffectiveTier(newUserElo, prev.mode);

      const u = { ...prev, totalVotes:newVotes, weightedCorrect:wc, weightedTotal:wt, accuracy:acc, jr:newUserElo, influence:Math.round(acc*newTier.weight*newVotes/10), streak:newStreak, bestStreak:Math.max(prev.bestStreak||0, newStreak), voteHistory:newHistory };
      saveLocal("er_user1", u);
      sb.upsert("users", u);
      setAllUsers(au => { const next = au.filter(x => x.username !== u.username).concat(u); saveLocal("er_allusers1", next); return next; });

      // Detect tier change in either direction
      const prevTier = getEffectiveTier(prev.jr||1000, prev.mode);
      if (newTier.id !== prevTier.id) {
        const wentUp = newTier.weight > prevTier.weight;
        const reasons = {
          astronomer: wentUp ? "JR reached 1400. Expert-level judgment confirmed." : "JR dropped below 1400",
          analyst:    wentUp ? "JR reached 1200. Strong grasp of habitability factors." : "JR dropped below 1200",
          observer:   wentUp ? "JR reached 1050. Working knowledge of exoplanet science established." : "JR dropped below 1050",
          explorer:   wentUp ? "" : "JR dropped below 1050. Keep voting to rebuild your tier.",
        };
        setTimeout(() => setTierUpgradeToast({ tier:newTier, reason:reasons[newTier.id]||"", wentUp }), 1200);
      }

      return u;
    });

    // Always show toast
    setToast({ correct, scoreable, gap, points, correctId, winnerId, planetA:pa, planetB:pb, streakMult, newStreak, streakInfo:getStreak(newStreak) });
    // Track last voted pair for planet rankings highlight
    setLastVotedPair(new Set([aId, bId]));
  }, [user, planets, allUsers]);

  const goDetail = (planet) => { setPrevView(view); setDetail(planet); setView("detail"); };
  const goBack = () => { setView(prevView); setDetail(null); };

  const signOut = () => {
    try {
      localStorage.removeItem("er_user1");
      localStorage.removeItem("er_voted1");
    } catch {}
    setUser({username:"",quizScore:0,jr:1000,totalVotes:0,weightedCorrect:0,weightedTotal:0,accuracy:0,influence:0,streak:0,bestStreak:0,voteHistory:[],tutorialDone:false});
    setVotedIds(new Set());
    setView("vote");
    setDetail(null);
    setStage("account");
  };

  const sorted = [...planets].sort((a, b) => (b.r||1500) - (a.r||1500));
  const topPlanet = sorted[0];

  const CSS = `${FONTS}*{box-sizing:border-box;margin:0;padding:0}body{background:#020a12}@keyframes orb-pulse{0%,100%{opacity:.8;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}@keyframes shimmer{0%,100%{opacity:.35}50%{opacity:.7}}@keyframes rare-pulse{0%,100%{opacity:.7}50%{opacity:1}}@keyframes rainbow-shift{0%{filter:hue-rotate(0deg) brightness(1.4)}100%{filter:hue-rotate(360deg) brightness(1.4)}}@keyframes rainbow-radiate{0%,100%{text-shadow:0 0 10px #ff0080,0 0 30px #ff008088,0 0 60px #ff008044,0 0 120px #ff008022}25%{text-shadow:0 0 10px #00ffcc,0 0 30px #00ffcc88,0 0 60px #00ffcc44,0 0 120px #00ffcc22}50%{text-shadow:0 0 10px #0080ff,0 0 30px #0080ff88,0 0 60px #0080ff44,0 0 120px #0080ff22}75%{text-shadow:0 0 10px #ffcc00,0 0 30px #ffcc0088,0 0 60px #ffcc0044,0 0 120px #ffcc0022}}@keyframes float-up{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-52px) scale(0.8)}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#020a12}::-webkit-scrollbar-thumb{background:#1D9E7533;border-radius:2px}.nav-btn{transition:all 0.18s ease!important}.nav-btn:hover{transform:scale(1.09)!important;opacity:1!important}.signout-btn{transition:all 0.18s ease!important}.signout-btn:hover{transform:scale(1.08)!important;color:rgba(255,255,255,0.55)!important;border-color:rgba(255,255,255,0.28)!important}`;

  const Header = ({showNav=true, onSignOut=null}) => {
    const mob = useIsMobile();
    const DESKTOP_NAV = [["vote","VOTE"],["planets","PLANETS"],["voted","VOTED"],["map","EXOMAP"],["users","LEADERBOARD"],["profile","MY PROFILE"]];
    const MOBILE_NAV  = [["vote","VOTE"],["planets","PLANETS"],["voted","VOTED"],["map","MAP"],["users","BOARD"],["profile","PROFILE"]];
    const SVG_LOGO = (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
        <ellipse cx="15" cy="15" rx="13.5" ry="5" stroke="#1D9E75" strokeWidth="1.1" opacity="0.45"/>
        <circle cx="15" cy="15" r="7" fill="#1D9E75" opacity="0.18"/>
        <circle cx="15" cy="15" r="5.5" fill="#0d3d30"/>
        <circle cx="15" cy="15" r="5.5" fill="url(#pg)" opacity="0.9"/>
        <circle cx="13" cy="13" r="1.8" fill="#1D9E75" opacity="0.25"/>
        <ellipse cx="15" cy="15" rx="13.5" ry="5" stroke="#1D9E75" strokeWidth="1.1" strokeDasharray="9 33" opacity="0.85"/>
        <circle cx="28.5" cy="15" r="1.8" fill="#e8f4ff"/>
        <circle cx="28.5" cy="15" r="1.8" fill="#e8f4ff" opacity="0.4" style={{filter:"blur(1px)"}}/>
        <defs><radialGradient id="pg" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#2dd4a0"/><stop offset="100%" stopColor="#0a2820"/></radialGradient></defs>
      </svg>
    );
    const userInfo = stage==="app"
      ?<div style={{display:"flex",alignItems:"center",gap:8}}>
          <TierBadge tier={getEffectiveTier(user.jr||1000, user.mode)} sm/>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.22)"}}>{user.totalVotes}v</span>
          {onSignOut && <button className="signout-btn" onClick={onSignOut} style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.25)",background:"transparent",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:5,padding:"3px 8px",cursor:"pointer",letterSpacing:"0.08em"}}>sign out</button>}
        </div>
      :<div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.3)"}}>{planetCount} planets</div>;

    if (mob) return (
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(2,10,18,0.93)",backdropFilter:"blur(10px)",borderBottom:"0.5px solid rgba(255,255,255,0.06)",padding:"0 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:46}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {SVG_LOGO}
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#e8f4ff",letterSpacing:"0.12em",marginRight:"-0.12em"}}>EXO</span><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:400,color:"#1D9E75",letterSpacing:"0.12em"}}>RANKER</span>
            {SB_ON&&<div style={{width:5,height:5,borderRadius:"50%",background:"#1D9E75",boxShadow:"0 0 6px #1D9E75",marginLeft:4}}/>}
          </div>
          {userInfo}
        </div>
        {showNav && (
          <div style={{display:"flex",gap:3,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:6}}>
            {MOBILE_NAV.map(([v,l])=>(
              <button key={v} className="nav-btn" onClick={()=>{setView(v);setDetail(null);}} style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.1em",padding:"7px 10px",borderRadius:6,cursor:"pointer",flexShrink:0,background:(view===v&&view!=="detail")?"rgba(29,158,117,0.14)":"transparent",color:(view===v&&view!=="detail")?"#1D9E75":"rgba(255,255,255,0.38)",border:(view===v&&view!=="detail")?"0.5px solid #1D9E7544":"0.5px solid transparent"}}>{l}</button>
            ))}
          </div>
        )}
      </div>
    );

    // ── Desktop (unchanged from original) ──
    return (
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(2,10,18,0.93)",backdropFilter:"blur(10px)",borderBottom:"0.5px solid rgba(255,255,255,0.06)",padding:"0 24px"}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {SVG_LOGO}
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#e8f4ff",letterSpacing:"0.12em",marginRight:"-0.12em"}}>EXO</span><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:400,color:"#1D9E75",letterSpacing:"0.12em"}}>RANKER</span>
            {SB_ON&&<div style={{width:5,height:5,borderRadius:"50%",background:"#1D9E75",boxShadow:"0 0 6px #1D9E75",marginLeft:4}} title="Shared backend connected"/>}
          </div>
          {showNav&&<div style={{display:"flex",gap:3}}>{DESKTOP_NAV.map(([v,l])=>(
            <button key={v} className="nav-btn" onClick={()=>{setView(v);setDetail(null);}} style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.12em",padding:"7px 12px",borderRadius:6,cursor:"pointer",background:(view===v&&view!=="detail")?"rgba(29,158,117,0.14)":"transparent",color:(view===v&&view!=="detail")?"#1D9E75":"rgba(255,255,255,0.38)",border:(view===v&&view!=="detail")?"0.5px solid #1D9E7544":"0.5px solid transparent"}}>{l}</button>
          ))}</div>}
          {userInfo}
        </div>
      </div>
    );
  };

  if (stage === "account") return (
    <><style>{CSS}</style>
    <div style={{minHeight:"100vh",background:"#020a12",color:"white",position:"relative"}}>
      <StarField/><Header showNav={false}/>
      <div style={{padding:"60px 24px 80px",position:"relative",zIndex:1}}>
        <CreateAccount onComplete={handleAccount} onLogin={handleLogin} planetCount={planetCount} liveData={liveData}/>
      </div>
    </div></>
  );

  if (stage === "quiz") return (
    <><style>{CSS}</style>
    <div style={{minHeight:"100vh",background:"#020a12",color:"white",position:"relative"}}>
      <StarField/><Header showNav={false}/>
      <div style={{padding:"48px 24px 80px",position:"relative",zIndex:1}}>
        <Quiz username={user.username} onComplete={handleQuizDone}/>
      </div>
    </div></>
  );

  return (
    <><style>{CSS}</style>
    <div style={{minHeight:"100vh",background:"#020a12",color:"white",position:"relative"}}>
      <StarField/>
      <Header onSignOut={signOut}/>

      {view !== "detail" && (
        <div style={{background:"rgba(3,10,18,0.65)",borderBottom:"0.5px solid rgba(255,255,255,0.04)",padding:"8px 24px"}}>
          <div style={{maxWidth:960,margin:"0 auto",display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.55)"}}>TOP PLANET: <span style={{color:"#FFD700"}}>{topPlanet?.name}</span><span style={{margin:"0 8px",color:"rgba(255,255,255,0.3)"}}>|</span><span style={{color:"#1D9E75"}}>{topPlanet?.r||1500}<span style={{opacity:0.65,fontSize:8}}> ±{topPlanet?.rd||350}</span></span></div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.55)"}}>YOUR JR: <span style={{color:getEffectiveTier(user.jr||1000,user.mode).color}}>{user.mode==="advanced"?user.jr||1000:"learn mode"}</span></div>
            <div style={{marginLeft:"auto",fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.42)"}}>{planetCount} planets · {liveData?"live NASA data":"built-in dataset"}{SB_ON?" · shared backend":""}</div>
          </div>
        </div>
      )}

      <div style={{padding:"36px 24px 80px",position:"relative",zIndex:1}}>
        {/* Keep VoteArena mounted when navigating to detail so the pair is preserved */}
        {(view==="vote" || (view==="detail" && prevView==="vote")) && (
          <div style={{display:view==="vote"?"block":"none"}}>
            <VoteArena planets={planets} user={user} onVote={handleVote} onViewDetail={goDetail} onNextPair={()=>setToast(null)} votedIds={votedIds}/>
          </div>
        )}
        {view==="planets" && <PlanetRankings planets={planets} onViewDetail={goDetail} lastVotedIds={lastVotedPair}/>}
        {view==="voted"   && (() => {
          const votedPlanets = recentVotedList.length > 0
            ? recentVotedList.map(id => planets.find(p => p.id === id)).filter(Boolean)
            : [...planets].filter(p => votedIds.has(p.id)).sort((a,b) => (b.r||1500)-(a.r||1500));
          return (
            <div style={{maxWidth:680,margin:"0 auto"}}>
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.2em",color:"rgba(255,255,255,0.3)",marginBottom:6}}>MOST RECENT FIRST</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:700,color:"#e8f4ff",marginBottom:6}}>Recently Voted</div>
                <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"rgba(255,255,255,0.35)",fontStyle:"italic"}}>{votedPlanets.length} of {planets.length} planets seen</div>
              </div>
              {votedPlanets.length === 0 && (
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"rgba(255,255,255,0.25)",textAlign:"center",padding:"60px 0"}}>No votes yet — head to VOTE to get started.</div>
              )}
              {votedPlanets.map((p,i) => {
                const c = HC[p.hue]||HC.blue;
                return (
                  <div key={p.id} onClick={()=>goDetail(p)}
                    style={{display:"grid",gridTemplateColumns:"32px 1fr auto",alignItems:"center",gap:14,padding:"12px 14px",marginBottom:5,borderRadius:10,
                      background:"rgba(5,12,20,0.72)",border:"0.5px solid rgba(255,255,255,0.06)",
                      cursor:"pointer",transition:"background 0.25s,border-color 0.25s,transform 0.22s ease,box-shadow 0.22s ease",willChange:"transform"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${c.bg}bb`;e.currentTarget.style.borderColor=c.accent;e.currentTarget.style.transform="scale(1.018) translateX(3px)";e.currentTarget.style.boxShadow=`0 4px 20px ${c.accent}22`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(5,12,20,0.72)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                    <div style={{textAlign:"center",fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.25)"}}>#{i+1}</div>
                    <div>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#e8f4ff",marginBottom:2}}>{p.name}</div>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.4)"}}>{p.type} · {p.host}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:c.accent}}>{p.r||1500}</div>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.25)"}}>{p.matchups||0}v</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
        {view==="map"     && <ExoMap planets={planets} votedIds={votedIds} onViewDetail={goDetail}/>}
        {view==="users"   && <UserLeaderboard allUsers={allUsers} currentUser={user} lastSync={lastSync}/>}
        {view==="profile" && <MyProfile user={user} onRetakeQuiz={()=>setStage("quiz")} onSwitchToAdvanced={()=>{setUser(u=>{const n={...u,mode:"advanced"};saveLocal("er_user1",n);return n;});setStage("quiz");}} onSignOut={signOut}/>}
        {view==="detail"  && detail && <PlanetDetail planet={detail} onBack={goBack} voted={votedIds.has(detail.id)} userMode={user.mode}/>}
      </div>

      <div style={{borderTop:"0.5px solid rgba(255,255,255,0.08)",padding:"16px 24px",textAlign:"center",fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:"0.1em"}}>
        EXORANKER · KNOWLEDGE-WEIGHTED CROWDSOURCED JWST PRIORITIES · OPEN DATASET
      </div>

      {toast && <AccuracyToast result={toast} onDismiss={()=>setToast(null)} onViewDetail={goDetail}/>}
      {tierUpgradeToast && <TierUpgradeToast tier={tierUpgradeToast.tier} reason={tierUpgradeToast.reason} wentUp={tierUpgradeToast.wentUp} onDismiss={()=>setTierUpgradeToast(null)}/>}
    </div></>
  );
}
