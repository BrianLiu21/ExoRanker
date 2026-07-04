import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Same query as api/planets.js — the Vercel proxy handles production;
// this dev proxy gives local dev live NASA data too (the archive has no CORS headers).
const COLUMNS = "pl_name,hostname,pl_rade,pl_bmasse,pl_orbper,pl_eqt,sy_dist,ra,dec,st_spectype,st_age,disc_year,disc_facility,discoverymethod,disc_pubdate,releasedate";
const QUERY = `SELECT ${COLUMNS} FROM ps WHERE default_flag=1 AND pl_rade IS NOT NULL AND pl_eqt IS NOT NULL AND pl_orbper IS NOT NULL`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/planets': {
        target: 'https://exoplanetarchive.ipac.caltech.edu',
        changeOrigin: true,
        rewrite: () => `/TAP/sync?query=${encodeURIComponent(QUERY)}&format=json&maxrec=2000`,
      },
    },
  },
});
