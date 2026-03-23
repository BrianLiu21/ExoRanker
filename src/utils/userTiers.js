// ─── JUDGMENT RATING TIER SYSTEM ─────────────────────────────────────────────────────
// JR starts from quiz score, moves up on correct scoreable votes,
// down on wrong ones. Tier is derived live - no floor, drops are real.
//
// Starting ELO from quiz:  0.0–2.0pts → 1100  (Explorer range)
//                          2.1–4.0pts → 1200  (Observer range)
//                          4.1–6.0pts → 1350  (Analyst range)
//                          6.1–7.8pts → 1500  (Astronomer range)
export const USER_ELO_START = { explorer:1000, observer:1100, analyst:1250, astronomer:1400 };

// ELO brackets that map to tiers - thresholds can be crossed in both directions
export const USER_ELO_TIERS = [
  { id:"astronomer", minElo:1400, weight:3.0, color:"#1D9E75", label:"Astronomer", desc:"Expert judgment",   k:96  },
  { id:"analyst",    minElo:1200, weight:2.0, color:"#7F77DD", label:"Analyst",    desc:"Strong grasp",      k:64  },
  { id:"observer",   minElo:1050, weight:1.5, color:"#378ADD", label:"Observer",   desc:"Working knowledge", k:48  },
  { id:"explorer",   minElo:0,    weight:1.0, color:"#888780", label:"Explorer",   desc:"Building skill",    k:32  },
];

export function getTierFromElo(jr) {
  return USER_ELO_TIERS.find(t => (jr||1000) >= t.minElo) || USER_ELO_TIERS[USER_ELO_TIERS.length-1];
}

export function quizStartElo(quizScore) {
  // Map weighted quiz score to starting ELO bracket
  if (quizScore >= 6.1) return USER_ELO_START.astronomer;
  if (quizScore >= 4.1) return USER_ELO_START.analyst;
  if (quizScore >= 2.1) return USER_ELO_START.observer;
  return USER_ELO_START.explorer;
}

export const BEGINNER_TIER = { id:"learner", label:"Learner", min:0, max:0, weight:0, color:"#378ADD", desc:"Learn mode · votes don't affect research rankings", k:0 };

// Effective tier: beginners always 0×; advanced players use live Judgment Rating
export function getEffectiveTier(jr, mode) {
  if (mode !== "advanced") return BEGINNER_TIER;
  return getTierFromElo(jr);
}
