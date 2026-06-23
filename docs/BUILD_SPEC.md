# BariBite — Build Spec for Prototype v0.1

## What this is
A Progressive Web App (PWA) for Carlos (post-sleeve gastrectomy bariatric patient) and his wife. Phase 1 of an eventual native app. Built to be deployed to Netlify via Bolt → GitHub. Tonight's job: produce a working, installable PWA prototype that demonstrates the core experience for Ayla and Hermes to react to.

## User context (critical)
- **Carlos**: 36yo male, owner of CC3PO LLC, IT consultant + AI automation specialist, lives in Lathrop/Modesto CA
- **Surgery**: Wed June 24, 2026 at 9:00 AM (sleeve gastrectomy)
- **Allergies**: SEVERE peanut + shellfish (must be impossible to ignore in every UI surface)
- **Frequents**: Sprouts, Target, Starbucks, Chick-fil-A, Jamba Juice
- **Wife**: support partner — must have her own simplified view

## Design direction
**Concept:** Calm, clinical, but warm. Not "medical app cold" and NOT "fitness app neon." Think Headspace meets Apple Health meets a thoughtful restaurant menu.
- **Palette:** Sage green primary (healing, food, growth) + warm cream surfaces + a soft coral accent for allergy/danger warnings + deep charcoal text. Avoid red except for emergency/red-flag screens — red there is intentional and serious.
- **Type:** Body in a humanist sans (Inter or DM Sans via CDN). Display weight (semibold/bold) for headings, never larger than text-xl per webapp rules.
- **Motion:** Minimal. Gentle transitions only. This is a tool used in moments of stress and uncertainty.
- **Density:** Generous whitespace. One-thing-per-screen on mobile. Bottom nav for the 4 core sections.

## Tech stack (matches Ayla's plan)
- Use the fullstack webapp template (`skills/website-building/webapp/template`)
- React + Vite + Tailwind + shadcn/ui
- Hash-based routing with wouter
- PWA manifest + service worker for installability + offline shell
- SQLite via Drizzle for persistence (food logs, water intake, etc.)
- NO localStorage/sessionStorage (sandboxed iframe blocks them)

## Routes / Pages (4 core + emergency)

### 1. `/` — Dashboard (Today)
The home screen. Phase-aware.
- **Phase indicator banner** at top: "Day -1: Pre-Op Clear Liquids" → counts up after surgery. User can manually advance phases or auto-advance based on surgery date.
- **Three big stat rings/cards**: Protein (Xg / 60–80g goal), Water (Xoz / 64oz goal), Meals today (X/6)
- **"Next action" card** — context-aware based on phase + time of day: e.g. "It's 10:42 AM — you can drink water until 11:15, then eat your next protein at 11:45"
- **Meal-spacing timer** — the 30/60 min rule timer. Big, obvious. "Eating window: OPEN" / "Wait 28 min before drinking"
- Quick-add buttons: + Water, + Protein shake, + Meal
- Bottom of screen: "Red flag? Tap here →" (small but always visible link to /emergency)

### 2. `/where` — Where am I eating?
Restaurant decision helper.
- Top: chip selector with the user's frequent spots — Sprouts, Chick-fil-A, Starbucks, Jamba Juice, Target, McDonald's, Wendy's, Taco Bell, Subway, "Other..."
- Selecting a chip filters to "Your top 3 picks at [chain]" — pre-curated, hard-coded for v0.1
- Each pick card shows: dish name, protein/carb/sugar macros, **explicit allergy banner** (✅ Peanut-safe ✅ Shellfish-safe + any caveats), order instructions ("ask for grilled, no bun, no mayo"), what stage it's appropriate for
- "Allergy script" button at bottom — opens a card with the exact words to say to the server

### 3. `/sprouts` — Sprouts Shopping List
The most-used screen for him + his wife.
- Pre-loaded checklist of bariatric+allergy-safe Sprouts items, grouped by section (Deli, Dairy, Frozen, Protein shakes, Snacks for later stages, Vitamins)
- Each item has: name, why it's recommended, protein/serving, allergy verification note
- Wife can check items off as she shops. State syncs via backend (couples mode).
- "Add custom item" with allergen check prompt

### 4. `/wife` — Couples Mode (Partner View)
A simplified view his wife sees when she logs in (for v0.1, just a different route — no real auth)
- Today's status: "Carlos is on Day X, Phase Y"
- His current stats (protein/water progress)
- "What to make for dinner" — phase-appropriate suggestions she can cook with Plate Split (his portion + her portion)
- Red flag checklist she can review
- Big button: "Send Carlos encouragement" (just shows toast for v0.1)

### `/emergency` — Red Flag Screen
Standalone, accessible from every screen via small persistent link.
- Big bold list of red-flag symptoms with severity
- "Call 911" button (tel: link)
- "Call surgeon" button (placeholder tel: link — user fills in)
- "Show this to ER" — printable summary of: surgery date, surgeon, allergies, current meds, current phase

## Data model (shared/schema.ts)

```ts
users: { id, name, role ('patient' | 'partner'), surgery_date, allergies (JSON string) }
phases: { id, name, day_start, day_end, volume_per_meal, allowed_categories (JSON), forbidden_categories (JSON) }
meals: { id, user_id, timestamp, type ('water' | 'shake' | 'meal'), protein_g, carbs_g, calories, notes }
restaurant_picks: { id, chain, dish_name, protein_g, carbs_g, sugar_g, peanut_safe (bool), shellfish_safe (bool), allergy_notes, order_instructions, min_phase }
sprouts_items: { id, section, name, why, protein_per_serving, allergy_notes, checked (bool) }
```

Seed restaurant_picks with the data from the research already done (Chick-fil-A grilled nuggets, Starbucks egg bites, etc. — all in the prior turn's context). Seed sprouts_items with the shopping list from the wife reference card.

## PWA requirements
- `manifest.webmanifest` with icon set (use a simple sage-green leaf-and-spoon SVG icon)
- Service worker for offline shell (Workbox or hand-rolled, simple)
- Installable on iOS Safari + Android Chrome
- `apple-touch-icon` link tags

## Build order (per skill rules)
1. Schema in `shared/schema.ts`
2. Seed data file (`server/seed.ts` or inline in storage)
3. Frontend: 5 pages with stub data
4. Wire to backend with TanStack Query + apiRequest
5. PWA manifest + service worker
6. Custom SVG logo (sage leaf + spoon)
7. Playwright QA at mobile (375px) + desktop (1280px)
8. Deploy preview

## Non-goals for v0.1 (save for v0.2+)
- Real auth (just route-based "wife mode")
- Barcode scanner (mention "Coming soon")
- Photo coach / AI meal estimator (mention "Coming soon")
- Real Sprouts API / restaurant API
- Push notifications
- Real-time couples sync (single SQLite DB is enough for prototype)

## What success looks like for v0.1
Carlos can:
1. Open the URL on his phone, install it as a PWA
2. See his current phase + today's targets
3. Tap "Chick-fil-A" and instantly see his 3 safe picks with allergy warnings
4. Check off items on the Sprouts list
5. Hit the red flag screen in <2 taps from any screen

His wife can:
1. Open `/wife` and see his current status
2. Browse a "what to make tonight" list
3. Know exactly what to watch for in case of emergency

## Deploy
Use `deploy_website()` to produce the preview URL for Ayla / Hermes review.
