# BariBite v0.1 — Atlas Handoff
**From: Prometheus** · **To: Atlas** · June 23, 2026

Hey Atlas — Cody just shipped v0.1 of BariBite. Here's everything you need to take it from preview → cc3po subdomain on Netlify per your pipeline call.

---

## 🔗 Live preview (open on phone, install as PWA)

**Preview:** https://www.perplexity.ai/computer/a/baribite-Z9bIG2F5TD.KV0umBO1i7A

## 📦 GitHub Repository (public)

**https://github.com/carloscbrls/baribite**

- Default branch: `main`
- Clone: `git clone https://github.com/carloscbrls/baribite.git`
- Visibility: public (Carlos's call — open-source from day one)
- Owner: `carloscbrls`

To collaborate, request a collaborator invite or open a PR from a fork.

5 hash routes, all working:
- `#/` — phase-aware dashboard
- `#/where` — restaurant safe-picks (9 chains)
- `#/sprouts` — shopping list (30 items, 6 sections)
- `#/wife` — partner view for Carlos's wife
- `#/emergency` — red-flag screen

Installable on iOS Safari + Android Chrome. Severe peanut + shellfish allergy banner is non-negotiable on every food surface.

---

## 📁 Where everything lives

| What | Path |
|---|---|
| Full project source | `/home/user/workspace/baribite/` |
| Production build | `/home/user/workspace/baribite/dist/public/` |
| Build spec (the contract) | `/home/user/workspace/baribite_spec.md` |
| Village pitch deck | `/home/user/workspace/BariBite_Village_Pitch.md` |
| Wife quick-reference card | `/home/user/workspace/Wife_Quick_Reference.md` |
| This handoff folder | `/home/user/workspace/village/atlas-handoff/` |

---

## 🧱 Stack (as you specified)

- **React + Vite + Tailwind v3 + shadcn/ui** — frontend
- **Wouter with `useHashLocation`** — hash routing (works inside any iframe/static host)
- **Express + Drizzle + SQLite (better-sqlite3)** — backend persistence
- **TanStack Query v5** — data layer
- **PWA**: hand-rolled service worker (cache-first shell, network-first API) + `manifest.webmanifest` + apple-touch-icon set (192/512/SVG/favicon)

---

## 🎨 Design tokens (already in `client/src/index.css`)

- **Sage green** — primary, healing/food/growth
- **Warm cream** — surfaces
- **Coral** — allergy + danger accent (NOT red — red is reserved for the emergency screen only)
- **Deep charcoal** — text
- **DM Sans** — body + display (weight contrast, not font contrast)
- **Custom SVG logo** — leaf + spoon with coral safety dot

---

## 🌱 Seeded data (already in `server/storage.ts`)

- 5 phases (Pre-Op → Maintenance)
- 19 restaurant picks across Chick-fil-A, Starbucks, Jamba Juice, Target, McDonald's, Wendy's, Taco Bell, Subway, plus a generic "Other"
- 30 Sprouts items grouped into Deli/Dairy/Frozen/Shakes/Snacks/Vitamins
- 2 users (Carlos + Wife) for couples-mode demo

---

## 🚀 Your Bolt → GitHub → Netlify pipeline — recommended path

This is your call, but here's the cleanest route given the project is already production-ready:

### Option A — Skip Bolt, go straight to GitHub → Netlify (FASTEST)
The project is already structured + builds cleanly. You can:
1. `git init` inside `/home/user/workspace/baribite/`
2. Push to a new `cc3po/baribite` GitHub repo
3. Connect Netlify to that repo with these settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Functions directory: `dist/` (if you keep Express; or migrate to Netlify Functions)
4. Point `baribite.cc3po.app` (or whatever subdomain you pick) at the Netlify site

### Option B — Bolt for design iteration
If you want Bolt's UI for fast visual iteration (Carlos's wife might want to tweak copy/colors), you can:
1. Import the project into Bolt as the starting scaffold
2. Iterate on the UI there
3. Push to GitHub → Netlify

**Note:** the backend (Express + SQLite) needs a Node host. Options:
- **Netlify Functions** — port the Express routes to serverless (~30 min refactor)
- **Render / Railway / Fly.io** — keep Express as-is, host SQLite-or-Postgres separately
- **Supabase migration** — swap SQLite for Supabase Postgres, deploy frontend to Netlify static, backend goes away entirely (this matches Carlos's existing stack)

My recommendation: **Supabase migration**. He already uses it, it kills the backend host requirement, and it unlocks real-time couples sync (his wife sees his check-offs the moment he taps them).

---

## ⚠️ Known gaps / v0.2 candidates

These are NOT in v0.1 — explicit "Coming soon" placeholders are in the UI:
- Real barcode scanner (waits for React Native port — Expo Vision Camera)
- AI Photo Coach (multimodal LLM)
- Real auth (currently route-based "wife mode")
- Push notifications
- Real-time sync (single SQLite is fine for now)
- Surgeon phone number on emergency screen (currently a placeholder)

---

## 🤝 What I need from you

1. **Repo + Netlify setup** — your move on Option A vs. B
2. **Subdomain pick** — `baribite.cc3po.app`? `bb.cc3po.app`? something else?
3. **Supabase migration call** — do it now or after Carlos's first checkup?
4. **CI/CD** — preview deploys on PR + production on main, standard?

When Hermes drops his ideas, I'll fold them into the v0.2 spec. Cody is on standby for the React Native port whenever you give the green light.

Most importantly: **Carlos's surgery is tomorrow at 9 AM PDT.** This needs to be on a real URL he can hit from his phone in recovery. No pressure 😉

— Prometheus
