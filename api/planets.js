// Vercel serverless function — proxies NASA Exoplanet Archive to avoid CORS
// Called by the frontend at /api/planets (only works when deployed to Vercel)

const NASA_TAP =
  "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

const COLUMNS = [
  "pl_name",
  "hostname",
  "pl_rade",
  "pl_bmasse",
  "pl_orbper",
  "pl_eqt",
  "sy_dist",
  "ra",
  "dec",
  "st_spectype",
  "st_age",
  "disc_year",
  "disc_facility",
  "discoverymethod",
].join(",");

// Return up to 2000 confirmed planets that have the key columns filled in
const QUERY = `SELECT ${COLUMNS} FROM ps WHERE default_flag=1 AND pl_rade IS NOT NULL AND pl_eqt IS NOT NULL AND pl_orbper IS NOT NULL`;

export default async function handler(req, res) {
  // Allow the frontend to call this
  res.setHeader("Access-Control-Allow-Origin", "*");

  const url =
    `${NASA_TAP}?query=${encodeURIComponent(QUERY)}&format=json&maxrec=2000`;

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "ExoRanker/1.0" },
      signal: AbortSignal.timeout(12000), // 12 s timeout
    });

    if (!r.ok) {
      res.status(502).json({ error: "NASA API returned " + r.status });
      return;
    }

    const data = await r.json();
    res.status(200).json(Array.isArray(data) ? data : []);
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
}
