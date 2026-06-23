# Deployment Guide

Everything Atlas needs to deploy BariBite to production, independent of any sandbox.

---

## Quick Deploy to Netlify (recommended)

This repo is **already configured** for Netlify via `netlify.toml`. Just connect the repo:

1. Go to https://app.netlify.com/start
2. Click **"Import from Git"** → choose GitHub → select `carloscbrls/baribite`
3. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/public`
4. Click **Deploy**
5. After first deploy, go to **Domain settings** → add custom domain `baribite.cc3po.app`
6. Update your DNS (Cloudflare or wherever cc3po.app is managed) with the CNAME Netlify gives you

### ⚠️ Important: Backend caveat

The Express + SQLite backend will **not** work on Netlify's static hosting. The frontend renders fine but quick-add/check-off persistence will break.

**Three options to fix:**

### Option A — Migrate to Supabase (RECOMMENDED, ~2 hours)
Carlos already uses Supabase. This kills the backend host requirement AND unlocks real-time couples sync (his wife sees check-offs live).

Steps:
1. Create a new Supabase project at https://supabase.com
2. Run the schema migration (see `docs/SUPABASE_MIGRATION.md` — to be written)
3. Replace `server/storage.ts` Drizzle calls with `@supabase/supabase-js` calls
4. Delete `server/` entirely — frontend talks to Supabase directly
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Netlify env vars

### Option B — Keep Express, host backend separately
- Frontend: Netlify (static)
- Backend: Render / Railway / Fly.io (~$5/month)
- Frontend hits backend via `VITE_API_URL` env var

### Option C — Netlify Functions (serverless port)
- ~30 min refactor of `server/routes.ts` into individual Netlify Functions
- SQLite won't work serverless — needs Postgres or Supabase anyway
- Not recommended; if you're migrating storage, just do Supabase

---

## Cloudflare Pages alternative

If you'd rather use Cloudflare Pages (cheaper at scale, Carlos has the Cloudflare connector):

1. https://dash.cloudflare.com → Pages → Connect to Git
2. Select `carloscbrls/baribite`
3. Build command: `npm run build`
4. Build output: `dist/public`
5. Same Supabase migration applies for the backend

---

## DNS for `baribite.cc3po.app`

Assuming `cc3po.app` is in Cloudflare:

```
Type:   CNAME
Name:   baribite
Target: <netlify-or-cloudflare-pages-default-domain>
Proxy:  on (orange cloud) if using Cloudflare
TTL:    Auto
```

Netlify will give you the exact target after deploy (usually `<random-slug>.netlify.app`).

---

## CI/CD Setup

Once Netlify is connected:
- **Production deploys**: every push to `main` → auto-deploy to `baribite.cc3po.app`
- **Preview deploys**: every PR → auto-deploy to `deploy-preview-N--<site>.netlify.app`
- **Branch deploys**: optional, for staging branches

No GitHub Actions needed — Netlify handles everything.

---

## Environment variables to set in Netlify

For v0.1 (no backend on Netlify):
- None required — the static frontend works as-is, just without persistence

For v0.2 (after Supabase migration):
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key (safe to expose)

---

## Production checklist before going live

- [ ] Supabase migration complete (or backend hosted)
- [ ] Surgeon phone number filled in on emergency screen (currently placeholder)
- [ ] `baribite.cc3po.app` DNS pointing at Netlify
- [ ] HTTPS verified (Netlify auto-issues Let's Encrypt cert)
- [ ] PWA manifest icon URLs work on the production domain
- [ ] Test "Add to Home Screen" on iOS Safari + Android Chrome
- [ ] Test the red-flag screen `tel:` link triggers phone dialer
- [ ] Lighthouse PWA audit ≥ 90 score

---

## Rollback plan

Netlify keeps every deploy as an immutable snapshot. To rollback:
1. Netlify dashboard → Deploys → find the previous good deploy
2. Click "Publish deploy"
3. Live in <30 seconds

---

— Prometheus
