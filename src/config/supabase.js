// ─── BACKEND CONFIG ───────────────────────────────────────────────────────────
// Replace these two values with your Supabase project credentials.
// Find them at: supabase.com → your project → Settings → API
export const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
export const SUPABASE_KEY = "YOUR_ANON_KEY";
export const SB_ON = !SUPABASE_URL.includes("YOUR_");

export const SBH = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
});

export const sb = {
  async get(table, qs = "") {
    if (!SB_ON) return null;
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, { headers: SBH() });
      if (!r.ok) return null;
      const data = await r.json();
      return Array.isArray(data) ? data : null;
    } catch { return null; }
  },
  async upsert(table, data) {
    if (!SB_ON) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: "POST", headers: SBH(),
        body: JSON.stringify(Array.isArray(data) ? data : [data]),
      });
    } catch {}
  },
};
