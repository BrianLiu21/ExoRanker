// Vercel serverless function — generates scientific briefs via Anthropic
// API key stays server-side in ANTHROPIC_API_KEY env var, never exposed to browser

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

async function getCached(planetId) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/briefs?planet_id=eq.${encodeURIComponent(planetId)}&select=text`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0].text : null;
  } catch { return null; }
}

async function saveCache(planetId, text) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/briefs`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify([{ planet_id: planetId, text }]),
    });
  } catch {}
}

const safe = (v, max = 80) =>
  String(v ?? "").replace(/[\n\r]/g, " ").replace(/[`$]/g, "").slice(0, max);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  if (!ANTHROPIC_KEY) { res.status(500).json({ error: "API key not configured" }); return; }

  const { planet } = req.body || {};
  if (!planet?.id || !planet?.name) {
    res.status(400).json({ error: "Missing planet data" }); return;
  }

  // Return cached brief if available
  const cached = await getCached(planet.id);
  if (cached) { res.status(200).json({ text: cached, cached: true }); return; }

  const prompt = `You are an expert exoplanet astronomer writing for a crowdsourced JWST observation planning platform.\n\nWrite a 3-paragraph scientific brief about ${safe(planet.name)} (${safe(planet.type)}, orbiting ${safe(planet.host)}).\nData: radius ${safe(planet.radius)}x Earth, mass ${planet.mass ? safe(planet.mass) + "x Earth" : "unknown"}, period ${safe(planet.period)} days, equilibrium temperature ${safe(planet.temp)}K, discovered ${safe(planet.year)} by ${safe(planet.scope)}.\n\nParagraph 1: Physical nature and scientific distinctiveness.\nParagraph 2: What JWST could realistically learn from observing it.\nParagraph 3: Honest priority vs other targets - including limitations.\n\nPrecise, compelling scientific prose. No bullets, no markdown, no mention of ESI score.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": ANTHROPIC_KEY,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 900,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!r.ok) {
      const err = await r.text();
      res.status(502).json({ error: "Anthropic error: " + err }); return;
    }

    const data = await r.json();
    const text = data.content?.find(b => b.type === "text")?.text || "Unavailable.";

    await saveCache(planet.id, text);
    res.status(200).json({ text, cached: false });
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
}
