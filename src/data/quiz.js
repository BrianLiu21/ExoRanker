// ─── QUIZ QUESTION BANK ───────────────────────────────────────────────────────
// difficulty 1 = introductory, 2 = intermediate, 3 = expert
// Each session draws 3 from tier 1, 3 from tier 2, 2 from tier 3 (8 total)
// shuffled within each tier so order varies every attempt

export const QUESTION_BANK = [
  // ── TIER 1: Introductory ──────────────────────────────────────────────────
  { tier:1, q:"What does 'equilibrium temperature' measure on an exoplanet?",
    opts:["A theoretical average temperature calculated from starlight received and an assumed albedo", "The measured surface temperature derived from direct infrared thermal emission observations at secondary eclipse", "The average atmospheric temperature at the tropopause, derived from pressure-broadened molecular spectral line ratios", "The temperature at which the planet's radiative and convective zones reach thermal equilibrium, used to constrain interior models"],
    correct:0, explanation:"Equilibrium temperature is calculated from stellar flux and an assumed albedo — it's a theoretical baseline. Real surface temps can differ dramatically depending on greenhouse effects and internal heating." },

  { tier:1, q:"Which detection method has confirmed the most exoplanets to date?",
    opts:["Direct imaging of planetary thermal emission using coronagraphic suppression of starlight", "Gravitational microlensing of background stars by planetary systems along the line of sight", "Transit photometry measuring periodic stellar flux dips as planets cross the stellar disk", "Radial velocity monitoring of Doppler shifts in stellar spectra induced by planetary companions"],
    correct:2, explanation:"Transit photometry — watching a star dim as a planet crosses in front — dominates the confirmed catalog, largely because Kepler and TESS observed hundreds of thousands of stars continuously." },

  { tier:1, q:"Above roughly what radius does a planet likely retain a volatile gas envelope rather than a purely rocky surface?",
    opts:["1.6 R⊕", "0.8 R⊕", "2.4 R⊕", "1.2 R⊕"],
    correct:0, explanation:"The transition near 1.6 R⊕ marks where planets tend to retain significant volatile envelopes — this boundary corresponds to the upper edge of the Fulton gap and is a key threshold in planet classification." },

  { tier:1, q:"Why is JWST especially powerful for exoplanet atmosphere studies compared to Hubble?",
    opts:["JWST's segmented 6.5m mirror achieves angular resolution sufficient to map large-scale cloud structures across nearby exoplanet disks", "JWST operates in infrared wavelengths where key molecules like CO₂, H₂O, and CH₄ have strong absorption features", "JWST can directly image exoplanetary surfaces using coronagraphic blocking of starlight, resolving features down to continental scales", "JWST's L2 orbit removes all atmospheric dispersion effects that degraded Hubble's near-infrared sensitivity below 1.4 microns"],
    correct:1, explanation:"Most biosignature-relevant molecules absorb infrared light. JWST's infrared sensitivity and 6.5m mirror give it far more diagnostic power for atmospheric chemistry than Hubble's primarily optical design." },

  { tier:1, q:"A planet orbits its star every 3 days. What does Kepler's third law immediately tell you?",
    opts:["The planet is very close to its star and therefore receives intense radiation", "The planet rotates slowly and is almost certainly tidally locked, keeping one hemisphere in permanent daylight regardless of stellar type", "The planet's mass is constrained to between 0.5 and 2 Earth masses based on the period-density relationship from transit timing", "The planet experiences a stable climate because its short orbital period synchronises with the stellar rotation, suppressing flare activity"],
    correct:0, explanation:"Orbital period directly reflects orbital distance via Kepler's third law. A 3-day period means extreme proximity to the star — far more radiation than Earth receives, producing very high equilibrium temperatures." },

  { tier:1, q:"What is the habitable zone of a star?",
    opts:["The range of distances where stellar flux allows liquid water on a rocky planetary surface", "The region where tidal forces are weak enough to permit the plate tectonics necessary for long-term carbon cycling", "The orbital range where a rocky planet can maintain a stable nitrogen-oxygen atmosphere against stellar wind erosion over Gyr timescales", "The zone where planetary magnetic geometry provides sufficient shielding from stellar flares to prevent lethal surface radiation doses"],
    correct:0, explanation:"The habitable zone is defined by the range of distances where stellar flux allows liquid water on a rocky surface. It shifts outward for hotter stars and inward for dim red dwarfs." },

  { tier:1, q:"PSR B1257+12 b is historically significant because it was:",
    opts:["The first exoplanet detected with a mass below 0.5 Earth masses, making it the smallest confirmed world outside the solar system at the time of its announcement", "The first exoplanet confirmed outside our solar system", "The first exoplanet detected using gravitational microlensing, when a background source was briefly amplified by the host system in 1991", "The first exoplanet shown to retain a nitrogen-oxygen atmosphere detectable through ultraviolet absorption spectroscopy with the Hubble Space Telescope"],
    correct:1, explanation:"Announced in 1992 by Wolszczan and Frail, PSR B1257+12 b orbits a millisecond pulsar — the first confirmed exoplanet ever, discovered three years before the famous hot Jupiter 51 Peg b via a completely different method." },

  { tier:1, q:"A tidally locked planet permanently shows one face to its star. What is the most significant consequence for habitability?",
    opts:["One hemisphere is in permanent blazing daylight while the other is in permanent frozen darkness, creating extreme thermal gradients", "Synchronous rotation drives powerful equatorial jet streams that generate continent-scale cyclones, preventing stable accumulation of surface liquid water", "Tidal locking eliminates the differential rotation needed to sustain a magnetic dynamo, exposing the surface to unattenuated stellar particle radiation", "Atmospheric mass is gradually lost because nightside condensation traps volatiles as ice, which the dayside cannot replenish at an equal rate over geological time"],
    correct:0, explanation:"Tidal locking creates a permanent hot dayside and frozen nightside. The resulting atmospheric circulation, temperature extremes, and potential atmospheric collapse all complicate habitability assessments." },

  // ── TIER 2: Intermediate ──────────────────────────────────────────────────
  { tier:2, q:"A planet has radius 1.4 R⊕ and mass 2.0 M⊕. What does its bulk density most likely imply?",
    opts:["A mostly water-ice composition with a minimal rocky core, analogous to a scaled-up Ganymede with a deep global subsurface ocean", "A mostly rocky iron-silicate composition, consistent with a denser-than-Earth interior", "An anomalously high iron fraction suggesting the outer silicate mantle was stripped by an early giant impact, leaving a Mercury-like differentiated remnant", "A low-density hydrogen-helium envelope wrapped around a small rocky seed, producing a density profile inconsistent with a solid surface"],
    correct:1, explanation:"Mean density ~4.5 g/cm³ (near Mars) suggests rocky composition. At 1.4 R⊕ rocky interiors remain plausible — above ~1.6 R⊕ the radius-mass relation flattens, indicating retained volatile envelopes." },

  { tier:2, q:"Transmission spectroscopy works by measuring:",
    opts:["Doppler shifts in the planet's own thermally emitted photons as it moves toward and away from the observer during its orbit", "Reflected starlight from the planet's dayside surface compared against a modelled stellar spectrum to extract an albedo-corrected residual", "Starlight filtered through the planet's atmosphere during transit, revealing molecular absorption fingerprints at specific wavelengths", "Thermal emission from the planet's dayside hemisphere captured by subtracting the stellar flux during secondary eclipse"],
    correct:2, explanation:"During transit, the planet's atmosphere filters starlight at specific wavelengths corresponding to molecular absorption. It only works for transiting planets viewed edge-on." },

  { tier:2, q:"M-dwarf habitable zone planets are numerous and nearby, yet considered difficult JWST targets primarily because:",
    opts:["M-dwarf spectra contain overlapping molecular absorption bands so dense that planetary atmospheric signals cannot be disentangled from stellar contamination at current spectral resolution", "Tidal locking and intense stellar flares create hostile conditions and make spectral interpretation deeply ambiguous", "Their habitable zone orbital periods of 20–90 days mean JWST can observe only two or three transits per year, fatally limiting the achievable signal-to-noise within the mission lifetime", "Their habitable zone orbital distances place them within the stellar co-rotation radius, where magnetic interactions generate photometric noise that drowns transit signals"],
    correct:1, explanation:"M-dwarfs emit intense UV/X-ray radiation especially when young, and their HZ planets are likely tidally locked. These factors make atmospheric retention uncertain and biosignature attribution far more ambiguous than around quieter G-dwarf hosts." },

  { tier:2, q:"The Fulton gap (radius gap near 1.5–2.0 R⊕) is most consistent with which process?",
    opts:["Collision and fragmentation cascades that shatter sub-Neptunes into super-Earths during late-stage orbital instability triggered by giant planet migration", "A primordial accretion barrier arising from opacity transitions in protoplanetary disk midplanes that suppresses planetesimal growth specifically in the 1.5–2.0 R⊕ size range", "Photoevaporation stripping volatile envelopes from planets that received high UV flux, leaving a bimodal rocky/sub-Neptune distribution", "Tidal circularization gradually compressing eccentric mini-Neptunes into denser super-Earths as orbital energy is deposited into tidal heating over billions of years"],
    correct:2, explanation:"The gap appears to reflect photoevaporation stripping volatile envelopes from close-in planets — leaving dense rocky super-Earths below and sub-Neptunes that retained atmospheres above." },

  { tier:2, q:"A planet with a 4-day period is especially valuable for JWST atmospheric studies compared to one with a 200-day period. Why?",
    opts:["Shorter orbital periods produce higher equilibrium temperatures, increasing dayside thermal emission and making secondary eclipse spectroscopy significantly more sensitive to atmospheric composition differences", "The 4-day planet is more likely to be tidally locked, eliminating day-night wind variability and simplifying one-dimensional atmospheric circulation models", "Short-period transits have higher geometric probability and produce marginally deeper signals due to reduced stellar limb-darkening effects near the equatorial transit chord", "JWST can observe dozens of transits per year, accumulating signal-to-noise far faster than for long-period targets"],
    correct:3, explanation:"JWST time is precious and its mission lifetime is finite. A 4-day period yields ~90 transits per year; a 200-day period yields only a handful over the entire mission, dramatically limiting spectral depth." },

  { tier:2, q:"What distinguishes a Hycean world from a conventional ocean planet?",
    opts:["A Hycean world is a volatile-rich super-Earth where global ocean coverage results from late-stage cometary bombardment, with a thin water-vapour atmosphere analogous to a scaled-up early Earth", "A Hycean world has a planet-wide liquid ocean but lacks a substantial atmosphere, making its surface detectable through direct thermal emission rather than transmission spectroscopy", "A Hycean world has liquid water oceans under a thick hydrogen-dominated atmosphere, extending habitable conditions to a wider range of orbital distances", "A Hycean world hosts subsurface liquid water trapped beneath a thick frozen crust by tidal or radiogenic heating, analogous to Europa or Enceladus"],
    correct:2, explanation:"Proposed by Madhusudhan et al. (2021), Hycean worlds (1.5–2.5 R⊕) have thick H₂ envelopes and underlying liquid water oceans — potentially habitable at stellar distances outside the conventional HZ." },

  { tier:2, q:"WASP-39b was the first exoplanet in which JWST made a landmark atmospheric detection. What was it?",
    opts:["The first detection of ozone in a hot Saturn atmosphere, providing evidence for unexpected photochemical complexity driven by high UV irradiation from the host star", "The first measurement of a planet's dayside-to-nightside temperature contrast from a full-orbit infrared phase curve at wavelengths beyond 5 microns", "The first unambiguous CO₂ detection in any exoplanet atmosphere", "The first confirmed water vapour detection at spectral resolution sufficient to resolve individual ro-vibrational absorption lines in a transiting exoplanet"],
    correct:2, explanation:"In 2022, JWST's first exoplanet science observations of WASP-39b produced the first unambiguous CO₂ detection ever made in an exoplanet atmosphere — a direct demonstration of its power for atmospheric characterisation." },

  { tier:2, q:"A transiting planet has a high impact parameter (b close to 1). What does this mean observationally?",
    opts:["The planet passes near the stellar poles rather than the equator, producing asymmetric ingress and egress profiles that mimic the signature of an oblate rapidly rotating host star", "The transit chord grazes the stellar limb, making the transit shorter, shallower, and noisier", "The planet's orbit is nearly circular, producing consistent transit depth and duration across all observed epochs without the timing variations expected from eccentricity", "The planet hosts a large Galilean-scale moon whose gravitational influence shifts the apparent transit timing by several minutes and distorts the ingress-egress symmetry"],
    correct:1, explanation:"Impact parameter b describes where the transit chord crosses the stellar disk. b near 1 means the planet barely clips the stellar limb — producing a shallow, brief, and noisy signal that is harder to characterize." },

  // ── TIER 3: Expert ────────────────────────────────────────────────────────
  { tier:3, q:"JWST detects a tentative DMS signal on a 2.6 R⊕ Hycean candidate at 265K. Why can't this confirm biology?",
    opts:["Photochemical reactions in hydrogen-rich reducing atmospheres can produce DMS abiotically, so the signal doesn't uniquely indicate life", "The planet's surface gravity of ~1.8g compresses the atmospheric scale height so severely that DMS mixing ratios above the photosphere fall below NIRSpec's detection threshold even at biogenic concentrations", "At 265K the DMS photodissociation lifetime drops below 10 years, meaning any detected signal must originate in the lower stratosphere where JWST's limb geometry cannot probe reliably", "JWST NIRSpec's spectral resolution of R~2700 cannot separate the 3.3μm DMS feature from overlapping methanol and ethane absorption bands, making unambiguous molecular attribution statistically impossible"],
    correct:0, explanation:"Madhusudhan's group and critics debate whether K2-18b's tentative DMS signal (if real) could arise abiotically. H₂-rich atmospheres support non-biological DMS-producing pathways, making unambiguous bio-attribution impossible without further context." },

  { tier:3, q:"Why does the mass-radius relationship become degenerate for planets above roughly 4 R⊕?",
    opts:["Differential tidal heating above 4 R⊕ drives convective overturn throughout the envelope on Gyr timescales, erasing primordial compositional stratification and producing uniform density profiles regardless of formation history", "Above 4 R⊕ incident stellar flux invariably triggers runaway greenhouse feedback across all plausible atmospheric compositions, inflating radii in ways that depend on irradiation history rather than bulk composition", "A rocky core with a thin H₂ envelope and an icy core with a thick H₂O layer can produce identical observed radius and mass", "Stellar radial velocity jitter from chromospheric activity and convective granulation noise at the relevant host star luminosities exceeds the gravitational signal of the planetary companion"],
    correct:2, explanation:"Interior degeneracy is a fundamental problem. A given mass and radius can be reproduced by multiple compositional models — water world, mini-Neptune, rock + H₂ envelope — because their bulk densities converge. Spectroscopy, not bulk parameters alone, is required to distinguish them." },

  { tier:3, q:"What makes an astrophysical false positive in transit photometry difficult to rule out from photometry alone?",
    opts:["Hot Jupiter transit depths of 1–3% overlap completely with signals from blended eclipsing binaries at similar dilution ratios, producing light curves that are mathematically identical without radial velocity or high-resolution imaging constraints", "TESS 21-arcsecond pixels routinely blend three to eight background sources into a single aperture, meaning any transit signal could originate from any of those sources and photometric centroid motion cannot always localise the true host", "A blended background eclipsing binary produces a diluted periodic flux dip photometrically indistinguishable from a planetary transit", "Stellar granulation generates quasi-periodic photometric modulations with amplitudes of 10–100 ppm and timescales of hours to days that can constructively interfere with background binary signals, mimicking both period and depth"],
    correct:2, explanation:"A blended background eclipsing binary mimics a transit — same period, similar depth, indistinguishable photometrically. Ruling it out requires radial velocity follow-up, high-resolution imaging, or detailed spectral analysis." },

  { tier:3, q:"Proxima Centauri b is 4.2 light years away and roughly Earth-mass. What is the critical practical barrier to characterising its atmosphere with JWST?",
    opts:["Proxima Centauri's elevated X-ray and EUV luminosity during frequent superflare events saturates JWST's NIRSpec detector arrays, making spectroscopic observations during active periods scientifically unusable", "Proxima Centauri's exceptionally high proper motion of 3.85 arcseconds per year causes sufficient positional drift across an 11-day orbital period that JWST cannot maintain the sub-arcsecond pointing stability required for precision transit spectroscopy", "At 4.2 light years the planet's maximum angular separation of 37 milliarcseconds from its host falls below JWST's inner working angle for all coronagraphic modes, making direct imaging physically impossible with current instrumentation", "At ~1.5% transit probability, the planet almost certainly doesn't transit - removing transmission spectroscopy as an option"],
    correct:3, explanation:"Transit probability for Proxima b is ~1.5% — it almost certainly doesn't transit. Without transits, transmission spectroscopy is impossible. Direct imaging at 4.2 ly in principle requires a starshade far beyond current JWST capability." },

  { tier:3, q:"Secondary eclipse spectroscopy and transmission spectroscopy probe different parts of a planet's atmosphere. What does secondary eclipse uniquely reveal?",
    opts:["The composition of the planet's lower troposphere below the cloud deck, which is inaccessible to transmission spectroscopy because the terminator limb probes only upper atmospheric layers", "The mean molecular weight of the atmosphere derived from comparing ingress and egress spectra to isolate refraction-induced asymmetries in the transit light curve", "The dayside thermal emission and reflection spectrum, isolating temperature-pressure structure and dayside chemistry", "The nightside brightness temperature derived from the flux anomaly that appears immediately after the planet re-emerges from behind the stellar disk"],
    correct:2, explanation:"At secondary eclipse, the planet disappears behind the star. Subtracting star-only flux isolates the planet's dayside emission — probing temperature-pressure profiles and dayside chemistry, a different atmospheric layer from the limb probed during transit." },

  { tier:3, q:"Zahnle and Catling's 'cosmic shoreline' separates atmosphere-bearing worlds from bare rocks. What two quantities define the boundary?",
    opts:["Escape velocity and cumulative stellar EUV/XUV flux received over the planet's lifetime", "Magnetic moment strength and orbital eccentricity, with eccentric planets losing atmospheres during periastron passage through the stellar wind acceleration zone", "Surface gravity and equilibrium temperature computed from the Stefan-Boltzmann law, defining a threshold below which runaway greenhouse feedback strips any nitrogen-oxygen atmosphere within the first billion years", "Planetary radius and host stellar age integrated over the pre-main-sequence phase, during which elevated XUV luminosity strips atmospheres from planets that subsequently migrate into the habitable zone"],
    correct:0, explanation:"Zahnle and Catling's log-log plot of escape velocity vs incident EUV/XUV flux explains the atmospheric inventory of solar system bodies and predicts which exoplanets are likely to have retained atmospheres." },
];

// Build a randomized quiz: 3 tier-1, 3 tier-2, 2 tier-3 questions
export function buildQuiz() {
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  // Shuffle answer options and update correct index to match
  const shuffleOpts = q => {
    const tagged = q.opts.map((opt, i) => ({ opt, isCorrect: i === q.correct }));
    const shuffled = shuffle(tagged);
    return { ...q, opts: shuffled.map(x => x.opt), correct: shuffled.findIndex(x => x.isCorrect) };
  };

  const t1 = shuffle(QUESTION_BANK.filter(q => q.tier === 1)).slice(0, 3).map(shuffleOpts);
  const t2 = shuffle(QUESTION_BANK.filter(q => q.tier === 2)).slice(0, 3).map(shuffleOpts);
  const t3 = shuffle(QUESTION_BANK.filter(q => q.tier === 3)).slice(0, 2).map(shuffleOpts);
  return [...t1, ...t2, ...t3]; // ordered easy → hard
}

export const QUIZ_LENGTH = 8; // 3 + 3 + 2
export const TIER_LABELS  = ["","INTRODUCTORY","INTERMEDIATE","EXPERT"];
export const TIER_COLORS  = ["","#888780","#378ADD","#7F77DD"];
