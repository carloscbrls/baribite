# 🌱 BariBite

A post-bariatric food companion app for sleeve gastrectomy patients and their partners. Phase-aware, allergy-first, couples-friendly.

**Live preview:** [BariBite v0.1](https://www.perplexity.ai/computer/a/baribite-Z9bIG2F5TD.KV0umBO1i7A)

---

## Why this exists

Built for Carlos Cabrales (CC3PO LLC) ahead of his sleeve gastrectomy surgery on June 24, 2026. Existing bariatric apps are generic, ignore food allergies, and treat the patient's partner as an afterthought. BariBite is the one that doesn't.

**Core differentiators:**
- **Phase-aware** — the whole app rewrites itself based on what day post-op you are
- **Allergy-first filtering** — peanut + shellfish (configurable) scrubbed from every food surface
- **Couples Mode** — partner is a first-class user, not a sidekick
- **PWA** — installs from a URL, no app store

---

## Stack

- **Frontend:** React + Vite + Tailwind CSS v3 + shadcn/ui
- **Routing:** Wouter (hash-based, iframe-safe)
- **State/Data:** TanStack Query v5
- **Backend:** Express + Drizzle ORM + SQLite (better-sqlite3)
- **PWA:** Hand-rolled service worker (cache-first shell, network-first API) + manifest

---

## Routes

| Route | Purpose |
|---|---|
| `#/` | Phase-aware dashboard — protein/water/meals targets, meal-spacing timer, quick-add |
| `#/where` | Restaurant safe-picks — 9 chains, top-3 picks each, allergy-filtered |
| `#/sprouts` | Sprouts shopping list — 30 items, 6 sections, partner-synced check-off |
| `#/wife` | Partner view — simplified status, Plate Split dinner ideas, red-flag watchlist |
| `#/emergency` | Red-flag screen — 911 + surgeon shortcuts, "Show this to ER" summary |

---

## Local development

```bash
npm install
npm run dev
```

Opens on http://localhost:5000 (Express + Vite on the same port).

### Build for production

```bash
npm run build
```

Output: `dist/public/` (static frontend) + `dist/index.cjs` (Express server).

---

## Deployment

### Option A — Static + Node host (current)
- Frontend: `dist/public/` → any static host (Netlify, Vercel, S3+CloudFront)
- Backend: `dist/index.cjs` → Node host (Render, Railway, Fly.io)

### Option B — Supabase migration (recommended next step)
- Frontend: Netlify static, pointed at `baribite.cc3po.app`
- Backend: replaced by Supabase Postgres + Edge Functions
- Bonus: unlocks real-time couples sync

See `/home/user/workspace/village/atlas-handoff/README.md` (in dev sandbox) for full pipeline notes.

---

## Project structure

```
baribite/
├── client/              # React frontend
│   └── src/
│       ├── pages/       # 5 route components
│       ├── components/  # shadcn UI + custom
│       └── index.css    # Sage/cream/coral palette
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   └── storage.ts       # Drizzle queries + seed data
├── shared/
│   └── schema.ts        # Drizzle schema (5 tables)
└── dist/public/         # PWA build output
```

---

## Data model

5 tables in `shared/schema.ts`:
- `users` — patient + partner with allergy profile
- `phases` — 5 phases from pre-op to maintenance
- `meals` — every water/shake/meal logged
- `restaurant_picks` — 19 curated allergy-safe restaurant items
- `sprouts_items` — 30 grocery items with allergen notes

---

## Roadmap

### v0.1 (shipped)
✅ 5 routes, PWA installable, allergy banner on every food surface, persistent quick-add + check-off

### v0.2 (next)
- Real auth (currently route-based "wife mode")
- Real-time couples sync (Supabase migration)
- Surgeon phone number on emergency screen
- Barcode scanner (mention "Coming soon" placeholder is already in UI)

### v1.0 (React Native port)
- Fork SafeBite OR build fresh with Expo + Vision Camera
- Native barcode scanner
- Push notifications
- Apple Health / wearable sync (resting HR alerts → instant red-flag prompt)

### v2.0 (AI layer)
- Photo Coach — multimodal LLM estimates tablespoons
- Voice-first restaurant agent ("Hey BariBite, I'm at Olive Garden, what can I order?")
- Plateau Whisperer — ML on the food log

---

## The Village

BariBite is built by the CC3PO Village multi-agent system:
- **Prometheus** — research, content, medical accuracy
- **Atlas** — build pipeline, infrastructure, deployment
- **Hermes** — ideas, growth, positioning
- **Cody** — implementation

---

## License

TBD — likely MIT for the allergy-filter logic, with the rest under a permissive license. Carlos's call.

---

Built with care for the moment Carlos needs it most. 🫶
