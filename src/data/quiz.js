// ─── QUIZ QUESTION BANK ───────────────────────────────────────────────────────
// difficulty 1 = introductory, 2 = intermediate, 3 = expert
// Each session draws 3 from tier 1, 3 from tier 2, 2 from tier 3 (8 total)
// shuffled within each tier so order varies every attempt

export const QUESTION_BANK = [
  // ── TIER 1: Introductory ──────────────────────────────────────────────────
  { tier:1, q:"What does 'equilibrium temperature' measure on an exoplanet?",
    opts:["A theoretical average temperature calculated from starlight received and an assumed albedo", "The measured ground temperature derived from infrared telescope observations", "The boiling point of water adjusted for the planet's surface atmospheric pressure", "The temperature of the planet's iron-nickel core based on density models"],
    correct:0, explanation:"Equilibrium temperature is calculated from stellar flux and an assumed albedo — it's a theoretical baseline. Real surface temps can differ dramatically depending on greenhouse effects and internal heating." },

  { tier:1, q:"Which detection method has confirmed the most exoplanets to date?",
    opts:["Direct imaging", "Gravitational microlensing", "Transit photometry", "Radial velocity"],
    correct:2, explanation:"Transit photometry — watching a star dim as a planet crosses in front — dominates the confirmed catalog, largely because Kepler and TESS observed hundreds of thousands of stars continuously." },

  { tier:1, q:"Above roughly what radius does a planet likely retain a volatile gas envelope rather than a purely rocky surface?",
    opts:["1.6 R⊕", "0.8 R⊕", "2.4 R⊕", "1.2 R⊕"],
    correct:0, explanation:"The transition near 1.6 R⊕ marks where planets tend to retain significant volatile envelopes — this boundary corresponds to the upper edge of the Fulton gap and is a key threshold in planet classification." },

  { tier:1, q:"Why is JWST especially powerful for exoplanet atmosphere studies compared to Hubble?",
    opts:["JWST's mirror resolves individual clouds in exoplanet atmospheres", "JWST operates in infrared wavelengths where key molecules like CO₂, H₂O, and CH₄ have strong absorption features", "JWST can directly photograph exoplanet surfaces at sub-kilometer resolution", "JWST orbits at the L2 point, eliminating atmospheric interference from Earth"],
    correct:1, explanation:"Most biosignature-relevant molecules absorb infrared light. JWST's infrared sensitivity and 6.5m mirror give it far more diagnostic power for atmospheric chemistry than Hubble's primarily optical design." },

  { tier:1, q:"A planet orbits its star every 3 days. What does Kepler's third law immediately tell you?",
    opts:["The planet is very close to its star and therefore receives intense radiation", "The planet rotates slowly and is likely tidally locked to a cool red dwarf", "The planet's mass is roughly equal to Earth's based on its short period", "The planet has a long year and is far enough for a stable climate"],
    correct:0, explanation:"Orbital period directly reflects orbital distance via Kepler's third law. A 3-day period means extreme proximity to the star — far more radiation than Earth receives, producing very high equilibrium temperatures." },

  { tier:1, q:"What is the habitable zone of a star?",
    opts:["The range of distances where stellar flux allows liquid water on a rocky planetary surface", "The region where tidal forces are weak enough to permit plate tectonics", "The zone where a rocky planet can maintain a stable atmosphere against stellar wind erosion", "The orbital region where a planet is shielded from stellar flares by magnetic geometry"],
    correct:0, explanation:"The habitable zone is defined by the range of distances where stellar flux allows liquid water on a rocky surface. It shifts outward for hotter stars and inward for dim red dwarfs." },

  { tier:1, q:"PSR B1257+12 b is historically significant because it was:",
    opts:["The first exoplanet found with a mass below 0.5 Earth masses", "The first exoplanet confirmed outside our solar system", "The first exoplanet detected using the gravitational microlensing method", "The first exoplanet shown to have a nitrogen-rich atmosphere"],
    correct:1, explanation:"Announced in 1992 by Wolszczan and Frail, PSR B1257+12 b orbits a millisecond pulsar — the first confirmed exoplanet ever, discovered three years before the famous hot Jupiter 51 Peg b via a completely different method." },

  { tier:1, q:"A tidally locked planet permanently shows one face to its star. What is the most significant consequence for habitability?",
    opts:["One hemisphere is in permanent blazing daylight while the other is in permanent frozen darkness, creating extreme thermal gradients", "The planet's rotation generates intense cyclones that make the surface uninhabitable", "The planet's magnetic field is destroyed by differential rotation, removing protection from cosmic rays", "The planet's atmosphere is slowly stripped away because the night side cools faster than the day side can replenish it"],
    correct:0, explanation:"Tidal locking creates a permanent hot dayside and frozen nightside. The resulting atmospheric circulation, temperature extremes, and potential atmospheric collapse all complicate habitability assessments." },

  // ── TIER 2: Intermediate ──────────────────────────────────────────────────
  { tier:2, q:"A planet has radius 1.4 R⊕ and mass 2.0 M⊕. What does its bulk density most likely imply?",
    opts:["A mostly water-ice composition with minimal rocky core, similar to a Ganymede analog", "A mostly rocky iron-silicate composition, consistent with a denser-than-Earth interior", "An unusually high iron fraction suggesting a Mercury-like stripped mantle", "A low-density hydrogen-helium envelope wrapped around a small rocky seed"],
    correct:1, explanation:"Mean density ~4.5 g/cm³ (near Mars) suggests rocky composition. At 1.4 R⊕ rocky interiors remain plausible — above ~1.6 R⊕ the radius-mass relation flattens, indicating retained volatile envelopes." },

  { tier:2, q:"Transmission spectroscopy works by measuring:",
    opts:["Doppler shifts in the planet's own emitted light as it moves toward and away from us", "Reflected starlight from the planet's surface compared to a model stellar spectrum", "Starlight filtered through the planet's atmosphere during transit, revealing molecular absorption fingerprints", "Thermal emission from the planet's dayside captured at secondary eclipse"],
    correct:2, explanation:"During transit, the planet's atmosphere filters starlight at specific wavelengths corresponding to molecular absorption. It only works for transiting planets viewed edge-on." },

  { tier:2, q:"M-dwarf habitable zone planets are numerous and nearby, yet considered difficult JWST targets primarily because:",
    opts:["M-dwarf spectra contain so many molecular features that planetary signals cannot be separated reliably", "Tidal locking and intense stellar flares create hostile conditions and make spectral interpretation deeply ambiguous", "Their host stars are too dim for JWST's spectrographs to achieve sufficient signal-to-noise in a single transit", "Their orbital periods are typically decades long, making repeated transit observations impractical"],
    correct:1, explanation:"M-dwarfs emit intense UV/X-ray radiation especially when young, and their HZ planets are likely tidally locked. These factors make atmospheric retention uncertain and biosignature attribution far more ambiguous than around quieter G-dwarf hosts." },

  { tier:2, q:"The Fulton gap (radius gap near 1.5–2.0 R⊕) is most consistent with which process?",
    opts:["Collision and fragmentation cascades that break sub-Neptunes into super-Earths during late orbital instability", "A planet formation barrier that prevents accretion in that size range around FGK stars", "Photoevaporation stripping volatile envelopes from planets that received high UV flux, leaving a bimodal rocky/sub-Neptune distribution", "Tidal circularization converting eccentric mini-Neptunes into denser super-Earths over billions of years"],
    correct:2, explanation:"The gap appears to reflect photoevaporation stripping volatile envelopes from close-in planets — leaving dense rocky super-Earths below and sub-Neptunes that retained atmospheres above." },

  { tier:2, q:"A planet with a 4-day period is especially valuable for JWST atmospheric studies compared to one with a 200-day period. Why?",
    opts:["Shorter-period planets are hotter and therefore emit more infrared light detectable by JWST", "The 4-day planet is more likely to be tidally locked, simplifying atmospheric circulation models", "Short-period transits are geometrically deeper and easier to detect above stellar noise", "JWST can observe dozens of transits per year, accumulating signal-to-noise far faster than for long-period targets"],
    correct:3, explanation:"JWST time is precious and its mission lifetime is finite. A 4-day period yields ~90 transits per year; a 200-day period yields only a handful over the entire mission, dramatically limiting spectral depth." },

  { tier:2, q:"What distinguishes a Hycean world from a conventional ocean planet?",
    opts:["A Hycean world is a super-Earth where water has been delivered by late-stage cometary bombardment", "A Hycean world has a global ocean but no detectable atmosphere, making spectroscopy impossible", "A Hycean world has liquid water oceans under a thick hydrogen-dominated atmosphere, extending habitable conditions to a wider range of orbital distances", "A Hycean world has subsurface oceans beneath a frozen crust, like Europa, rather than a surface ocean"],
    correct:2, explanation:"Proposed by Madhusudhan et al. (2021), Hycean worlds (1.5–2.5 R⊕) have thick H₂ envelopes and underlying liquid water oceans — potentially habitable at stellar distances outside the conventional HZ." },

  { tier:2, q:"WASP-39b was the first exoplanet in which JWST made a landmark atmospheric detection. What was it?",
    opts:["The first detection of ozone in a hot Saturn atmosphere, suggesting photochemical complexity", "The first measurement of a planet's dayside-nightside temperature difference from phase curve data", "The first unambiguous CO₂ detection in any exoplanet atmosphere", "The first confirmed water vapour detection using infrared spectroscopy of a transiting planet"],
    correct:2, explanation:"In 2022, JWST's first exoplanet science observations of WASP-39b produced the first unambiguous CO₂ detection ever made in an exoplanet atmosphere — a direct demonstration of its power for atmospheric characterisation." },

  { tier:2, q:"A transiting planet has a high impact parameter (b close to 1). What does this mean observationally?",
    opts:["The planet passes close to the star's poles rather than equator, amplifying tidal locking effects", "The transit chord grazes the stellar limb, making the transit shorter, shallower, and noisier", "The planet's orbit is nearly circular, giving consistent transit depth across many observations", "The planet has a large moon that shifts apparent transit timing by several minutes"],
    correct:1, explanation:"Impact parameter b describes where the transit chord crosses the stellar disk. b near 1 means the planet barely clips the stellar limb — producing a shallow, brief, and noisy signal that is harder to characterize." },

  // ── TIER 3: Expert ────────────────────────────────────────────────────────
  { tier:3, q:"JWST detects a tentative DMS signal on a 2.6 R⊕ Hycean candidate at 265K. Why can't this confirm biology?",
    opts:["Photochemical reactions in hydrogen-rich reducing atmospheres can produce DMS abiotically, so the signal doesn't uniquely indicate life", "The planet's high gravity prevents DMS from reaching altitudes detectable by transmission spectroscopy", "DMS dissociates rapidly at 265K so any detected signal must originate in the stratosphere only", "JWST's spectral resolution at those wavelengths cannot distinguish DMS from methanol contamination"],
    correct:0, explanation:"Madhusudhan's group and critics debate whether K2-18b's tentative DMS signal (if real) could arise abiotically. H₂-rich atmospheres support non-biological DMS-producing pathways, making unambiguous bio-attribution impossible without further context." },

  { tier:3, q:"Why does the mass-radius relationship become degenerate for planets above roughly 4 R⊕?",
    opts:["Above 4 R⊕ tidal interactions with the host star destroy compositional stratification over Gyr timescales", "Above 4 R⊕ all planets enter the runaway greenhouse regime, making interior modelling unreliable", "A rocky core with a thin H₂ envelope and an icy core with a thick H₂O layer can produce identical observed radius and mass", "Radial velocity precision degrades for large planets because stellar activity noise exceeds the planetary signal"],
    correct:2, explanation:"Interior degeneracy is a fundamental problem. A given mass and radius can be reproduced by multiple compositional models — water world, mini-Neptune, rock + H₂ envelope — because their bulk densities converge. Spectroscopy, not bulk parameters alone, is required to distinguish them." },

  { tier:3, q:"What makes an astrophysical false positive in transit photometry difficult to rule out from photometry alone?",
    opts:["Hot Jupiters produce transit depths overlapping with expected signals from blended eclipsing binaries", "TESS pixels are large enough that every aperture contains multiple stars, making all detections automatically suspect", "A blended background eclipsing binary produces a diluted periodic flux dip photometrically indistinguishable from a planetary transit", "Stellar granulation produces periodic signals matching the orbital period of nearby background companions"],
    correct:2, explanation:"A blended background eclipsing binary mimics a transit — same period, similar depth, indistinguishable photometrically. Ruling it out requires radial velocity follow-up, high-resolution imaging, or detailed spectral analysis." },

  { tier:3, q:"Proxima Centauri b is 4.2 light years away and roughly Earth-mass. What is the critical practical barrier to characterising its atmosphere with JWST?",
    opts:["Proxima Centauri's X-ray luminosity saturates JWST's NIRSpec detector, preventing spectroscopic observation", "Proxima Centauri's proper motion is too fast for JWST to maintain stable pointing during a transit window", "The planet's orbital period of 11.2 days places it permanently below JWST's minimum angular separation from its host", "At ~1.5% transit probability, the planet almost certainly doesn't transit - removing transmission spectroscopy as an option"],
    correct:3, explanation:"Transit probability for Proxima b is ~1.5% — it almost certainly doesn't transit. Without transits, transmission spectroscopy is impossible. Direct imaging at 4.2 ly in principle requires a starshade far beyond current JWST capability." },

  { tier:3, q:"Secondary eclipse spectroscopy and transmission spectroscopy probe different parts of a planet's atmosphere. What does secondary eclipse uniquely reveal?",
    opts:["The composition of the planet's lower troposphere, inaccessible to transmission spectroscopy at the day-night terminator", "The mean molecular weight of the atmosphere derived from measuring the difference between ingress and egress spectra", "The dayside thermal emission and reflection spectrum, isolating temperature-pressure structure and dayside chemistry", "The night side temperature derived from flux anomalies immediately after the planet re-emerges from behind the star"],
    correct:2, explanation:"At secondary eclipse, the planet disappears behind the star. Subtracting star-only flux isolates the planet's dayside emission — probing temperature-pressure profiles and dayside chemistry, a different atmospheric layer from the limb probed during transit." },

  { tier:3, q:"Zahnle and Catling's 'cosmic shoreline' separates atmosphere-bearing worlds from bare rocks. What two quantities define the boundary?",
    opts:["Escape velocity and cumulative stellar EUV/XUV flux received over the planet's lifetime", "Magnetic moment strength and orbital eccentricity, with eccentric planets losing atmospheres during periastron flares", "Surface gravity and equilibrium temperature, dividing runaway greenhouse from habitable outcomes", "Planetary radius and stellar age, with older stars producing less atmospheric stripping over time"],
    correct:0, explanation:"Zahnle and Catling's log-log plot of escape velocity vs incident EUV/XUV flux explains the atmospheric inventory of solar system bodies and predicts which exoplanets are likely to have retained atmospheres." },
];

// Build a randomized quiz: 3 tier-1, 3 tier-2, 2 tier-3 questions
export function buildQuiz() {
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const t1 = shuffle(QUESTION_BANK.filter(q => q.tier === 1)).slice(0, 3);
  const t2 = shuffle(QUESTION_BANK.filter(q => q.tier === 2)).slice(0, 3);
  const t3 = shuffle(QUESTION_BANK.filter(q => q.tier === 3)).slice(0, 2);
  return [...t1, ...t2, ...t3]; // ordered easy → hard
}

export const QUIZ_LENGTH = 8; // 3 + 3 + 2
export const TIER_LABELS  = ["","INTRODUCTORY","INTERMEDIATE","EXPERT"];
export const TIER_COLORS  = ["","#888780","#378ADD","#7F77DD"];
