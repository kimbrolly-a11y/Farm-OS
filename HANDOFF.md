# FarmOS — Handoff Brief & Master Build Plan (Claude Fable 5)

> **See also `FARMOS-MASTER-SPEC.md`** — the full 100-acre eco-tourism resort
> spec (all livestock, dairy, aquaculture, circular zero-waste loops, hybrid
> off-grid energy/water, natural water treatment, the "Verdant World" attraction
> layer + guest app, manpower & autonomy map, and per-vertical automation
> stacks). This handoff is the *engineering* brief; that spec is the *farm
> definition* you build toward. Build order is in that spec's §13.

> **Paste this as your first message in the new terminal:**
>
> Read `HANDOFF.md`, then `CLAUDE.md`, then `farm.config.yaml`. This is a working
> hackathon build of FarmOS — an autonomous operating system for a one-person,
> off-grid eco-farm. ~16 commits are done and the app runs. Do NOT rebuild from
> scratch. Confirm it runs (`npm install && npm run dev`, open
> http://localhost:3000), switch the agent to Claude Fable 5 (§8), then execute
> the **Master Build Plan (§10)** phase by phase, committing after each item.
> Keep the two demo scenarios (crisis + resilience) bulletproof at all times.
> The goal: the most comprehensive farm-operations system in existence.

---

## 0. AUTONOMOUS 2-HOUR RUN — READ FIRST

You are running **unattended for ~2 hours**. The owner is NOT available — **do
NOT ask questions**; make sensible defaults from `FARMOS-MASTER-SPEC.md` and keep
going. Optimize for **maximum committed, demoable progress**. The app must run
and the **crisis + resilience scenarios must stay green at every commit**.

**Operating rules**
- Set `MODEL = "claude-fable-5"` in `lib/agent.ts`; run at **high/xhigh effort**.
- Work in small increments. Run `npm run build` (typecheck) **then commit every
  increment (~10–20 min)**. Never leave the tree broken.
- **Restart `npm run dev` after any twin-shape change** (`lib/types.ts` /
  `lib/config.ts` seed) — it re-seeds; stale-shape twins throw.
- Do NOT rebuild existing modules. **Extend** `farm.config.yaml` + `lib/` per the
  module pattern (§5). Follow existing code style.
- Keep the **life-support guard**; add the new animals' vital loads + **potable
  water** to `never_shed` (animals + drinking water are life-support now).
- If a task is too big to finish in the remaining time, **don't start it** — pick
  the next smaller one that leaves the app demoable + committed.
- If `.env.local` has no `ANTHROPIC_API_KEY`, the agent falls back to the rule
  engine — that's fine, proceed; the owner can add the key later.

**PRESENTATION-FIRST — the most important rule.** The owner must be able to demo
the CONCEPT at the hackathon at ANY point. So: (a) keep the app running and **the
demo script below working at every commit**; (b) prioritize **breadth + story over
depth** — a visible, believable slice of each idea beats one perfect module;
(c) never break the welcome→gallery→dashboard flow, the Autopilot+Crisis demo, or
the Manage/Loops pages. If unsure whether a change risks the demo, commit the safe
version.

**THE DEMO THAT MUST ALWAYS WORK (protect it — this IS the pitch):**
1. `/` Welcome → *Explore the farm* → `/verticals` (18 verticals with art).
2. `/dashboard` → toggle **🛰 Autopilot ON** → `/controls` → **⚡ Crisis** → *do
   nothing* → `/activity` shows the AI shedding discretionary loads while
   protecting animals + life-support, on its own. Then **🌩 Outage** → offline
   resilience. Then **Reset**.
3. `/manage` (live P&L, all verticals) · `/loops` (circular zero-waste map, 92%) ·
   any `/vertical/*` (live sensors + AI insights + automations).
The story: **an autonomous AI running a self-sufficient, circular, off-grid
eco-tourism farm with the least possible manpower.**

**Already done (do NOT redo)** — everything in §4, **including** the 7 livestock
verticals and the circular-loops `/loops` page. Build is GREEN. Start below.

**Priority order from here (each = a commit; stop anywhere, demo still works):**
> ✅ **ALL ITEMS 1–7 COMPLETED + P1/P3/P5 EXTRAS** (2026-07-12 autonomous run).
> Fable 5 verified live (`mode:"claude"` confirmed with server-side Opus 4.8
> refusal fallback). Demo script re-verified after every commit — crisis shed 23
> loads with ZERO protected violations; offline queue + flush intact. Also done
> from §10: **P1 #1 sync/fidelity layer** (lib/sync.ts, dashboard chip), **P1
> #2+#3 /twin living map + what-if console** (energy/water flows, sliders over
> forwardSimulate with loadDeltaKw), **P3 #19 NL console** (/console — Fable 5
> tool-use, deterministic keyless fallback), **P5 #25 morning brief** (/brief),
> **P2 #9 CSV export** (P&L + audit trail from /manage). Next: P1 #4 HA adapter
> interface, P3 #12 yield forecasting, P5 #24 trust dial, P6 deploy.
1. Switch agent to **Fable 5** (`lib/agent.ts` `MODEL`) + verify
   (`POST /api/agent/run` → `mode:"claude"`). (~5 min)
2. **Energy sources** — add **biogas** + genset (+ optional wind) to `resources` +
   simulator + the energy/predictive panel; surface "% renewable · off-grid
   capable". Commit.
3. **Water** — sources (well/rain/greywater) + **natural treatment** (biosand →
   farm-made activated carbon → solar UV) + the shortage ladder, as a module + a
   `/water` panel; add potable to the protected set. Commit.
4. **Sustainability / ESG dashboard** (`/sustainability`) — self-sufficiency %,
   water reuse, circularity (from `/loops`), carbon avoided, ESG score. Ties the
   whole green story into one screen — high pitch value. Commit.
5. **Hospitality + attractions (breadth for the story, not depth)** — lodging
   scale (hotel + bungalows + glamping) + the "Verdant World" attractions
   (`FARMOS-MASTER-SPEC.md` §8) as modules + an `/attractions` page + a bookings
   stub. Demoable, shallow is fine. Commit each.
6. **Guest-app stub** (`/guest`) — book, farm map, animal cams, adopt-an-animal —
   to show the two-sided concept. Commit.
7. **Presentation polish** — group the (now long) dashboard nav, add a one-screen
   "concept" summary to the welcome page, keep every page fast. Commit.
8. **If genuinely finishing:** continue down `FARMOS-MASTER-SPEC.md` P2–P5.
   Otherwise stop — the demo above already tells the whole story.

Final: `npm run build` green; update §4 "what's built"; final commit.

Full farm definition + all phases: `FARMOS-MASTER-SPEC.md`.

---

## 1. What FarmOS is + the positioning

The operating system for a **one-person farm company**: a 100-acre off-grid
eco-tourism farm in Malaysia ("Verdant Acres") with 11 verticals (Airbnb
lodging, restaurant, hydroponics, aquaponics, fruit orchard, poultry, petting
zoo, palm oil, recycling, beekeeping, canning & food processing). A **Claude
supervisor agent** is the whole operations team — it senses, predicts, decides,
and acts through tools, logging every decision with reasoning. Off-grid (solar +
battery, rainwater + well) and must keep running in a **degraded/offline mode**
during a power/internet outage.

**The wedge (why we win — from the market survey in §13):** we are the only
system that is **real-time + autonomous + unified + off-grid-aware + offline-
resilient** for a *diversified* farm. We combine the live IoT twin of Home
Assistant/ThingsBoard, the business breadth of Farmbrite/Tend, and an AI agent
that actually *decides and acts* (nobody else has this) — and we solve the #1
documented industry pain: **fragmentation** ("no single history of every field,
batch, and device"). One brain, one twin, every vertical.

## 2. Tech stack (as built)

- **Next.js 15 (App Router) + TypeScript + Tailwind v4 + Recharts.**
- **Digital twin:** in-memory server-side singleton (NOT a DB), seeded from
  `farm.config.yaml`, pinned on `globalThis` (survives dev hot-reload).
- **Agent:** `@anthropic-ai/sdk` (v0.111) tool runner. Model in `lib/agent.ts`.
  Falls back to a deterministic **rule engine** when offline / no key / API error.
- **Weather:** Open-Meteo (free, no key) + offline cache + crisis override.
- **Sim + autopilot:** booted on server start via `instrumentation.ts`.

## 3. How to run & verify

```bash
npm install
npm run dev            # http://localhost:3000  (sim + autopilot boot on start)
npm run build          # FULL TYPECHECK — dev does NOT typecheck; run before committing
```

- **Gotcha:** the twin seeds once at server start. **Changing the twin shape
  (`lib/types.ts` `Twin`/`sim`, or seed logic in `lib/config.ts`) requires a
  `npm run dev` restart** to re-seed. Routes/components hot-reload fine.
- Demo that proves the concept: `/dashboard` → **🛰 Autopilot ON** → `/controls`
  → **⚡ Crisis** → do nothing → watch the Activity Log fill as the agent sheds
  discretionary loads, protects life-support, and reasons — every 30s, on its own.

## 4. What's already built (16 commits — DON'T rebuild)

Scaffold + YAML-seeded twin · sensor simulator · Command Center · agent + 12
tools + Activity Log · **Crisis scenario** · **Resilience/offline scenario** ·
Twin Core (11 verticals, 24 zones, 59 assets, 61 sensors) · Manage·P&L ·
Predictive intelligence · AI insights + Automations/equipment · Inventory &
farm-to-table traceability (HACCP) · Workforce/Tasks · **Autopilot** (autonomous
mode; predictive, idempotent rule engine) · Welcome screen + visual vertical
gallery + per-vertical SVG art · **Livestock expansion** (7 verticals: dairy
cattle/goats, sheep, ducks, rabbits, horses, aquaculture — animal vitals
`never_shed`) · **Circular resource-loops** (`/loops`, zero-waste map) ·
**Fable 5 agent** (`claude-fable-5`, high effort, adaptive thinking, server-side
refusal fallback to Opus 4.8 — verified `mode:"claude"`) · **Multi-source energy**
(biogas baseload tracks digester CH4, last-resort genset with 10%/25% hysteresis,
optional wind; "% renewable · off-grid" badge; firm generation feeds predict) ·
**Water system** (`lib/water.ts` + `/water`: rain/well/greywater sources, biosand →
farm-made activated carbon → solar UV-C treatment train, 6-rung shortage ladder;
treatment assets `never_shed`) · **Sustainability/ESG** (`/sustainability`: live
self-sufficiency, circularity, water reuse, carbon avoided, ESG score, cert
pipeline) · **Hospitality + Verdant World** (`/attractions`: hotel/bungalow/
glamping tiers with live occupancy, bookings stub, 19-attraction roster) ·
**Guest-app stub** (`/guest`: book, farm map, animal cams, adopt-an-animal) ·
grouped dashboard nav + welcome concept strip. **Now: 18 verticals, 34 zones,
89 assets, 89 sensors, 25 protected loads.** Clean tree on `master`.

## 5. File map

```
farm.config.yaml         # SOURCE OF TRUTH (verticals/zones/assets/sensors/resources +
                         #   load_shedding ladder + alert routing + ha_entity map)
instrumentation.ts       # boots simulator + autopilot
lib/ types.ts config.ts store.ts simulator.ts insights.ts economics.ts predict.ts
     automations.ts inventory.ts ruleEngine.ts agent.ts scenario.ts autopilot.ts
     verticalVisuals.ts  tools/{log,getForecast,actions}.ts
components/              # CommandCenter Welcome VerticalsGallery VerticalArt VerticalCard
                         #   VerticalDetail Energy/Water/PredictivePanel ManageView
                         #   InventoryView AutomationsView TasksView ActivityLog Controls useTwin
app/                     # / /verticals /dashboard /vertical/[id] /manage /inventory
                         #   /automations /tasks /activity /controls  + /api/*
```

**The pattern for every new module** (follow it): `lib/<x>.ts` computes from the
twin → optional `app/api/<x>/route.ts` → a `components/<X>View.tsx` + `app/<x>/page.tsx`
→ optionally expose to the agent as a `betaTool` in `lib/agent.ts`. Keep it
offline-safe. Commit per item. Restart dev if you touched the twin shape.

## 6. Routes & APIs

Pages: `/` `/verticals` `/dashboard` `/vertical/[id]` `/manage` `/inventory`
`/automations` `/tasks` `/activity` `/controls`.
APIs: `GET /api/state|business|predict|inventory|automations` ·
`POST /api/tick|agent/run|automations/run|tasks/done|autopilot|scenario/{crisis,offline,online,reset}`.

## 7. The agent — 12 tools

`getFarmState, getForecast, getBusinessState, getInventory, simulateForward,
runAutomation, shedLoad, restoreLoad, setActuator, scheduleIrrigation,
createAlert, assignTask`. Every ACTION tool takes a `reasoning` arg written to
the Activity Log. **Life-support guard** (`isProtected` in `lib/tools/actions.ts`)
makes shedding REFUSE anything `never_shed` / `life_support` — never weaken it.

## 8. Switching the agent to Claude Fable 5

The user wants the agent on **Claude Fable 5** (`claude-fable-5`).
1. `lib/agent.ts`: `const MODEL = "claude-fable-5"`.
2. **Before editing any LLM call, load the `claude-api` skill** (run `/claude-api`
   or read it). Fable rules: thinking is **always on** (keep `thinking:{type:"adaptive"}`
   or omit it — never send `{type:"disabled"}`, it 400s); **no** `temperature`/
   `top_p`/`top_k`; requires **30-day data retention**; consider **refusal
   fallbacks** to `claude-opus-4-8`. Run long-horizon/agentic work at **high/xhigh
   effort** (`output_config.effort`) — Fable excels at multi-step autonomy.
3. Agent runs on Claude only when `ANTHROPIC_API_KEY` is in `.env.local`
   (gitignored) — else rule engine. Restart dev after adding it.
4. Verify: `POST /api/agent/run` → response `mode:"claude"` (not `"rules"`).

## 9. The two demo scenarios (MUST stay working — the submission)

- **Crisis** (`/controls` ⚡ or `POST /api/scenario/crisis`): battery 22% + cloudy
  → agent sheds discretionary, protects all 8 `never_shed`. **Invariant: no
  protected asset is ever shed** — re-verify if you touch shedding.
- **Resilience** (🌩 Outage/Reconnect or `POST /api/scenario/offline|online`):
  offline banner, cached rules, queued syncs, flush on reconnect.
- **Reset** (`POST /api/scenario/reset`) restores healthy normal state.

---

## 10. MASTER BUILD PLAN — become the most comprehensive system

> Ordered by phase. P0 is done. Do P1→P6 in order; within a phase, top-down.
> Every item: **what** · **why (gap/parity/edge)** · **how (pattern)**. Commit each.
> Nothing here breaks the offline-safe rule or the two demo scenarios.

### P0 — Submission core (DONE ✅)
Twin, agent+tools, crisis, resilience, autopilot, P&L, predictive, inventory,
tasks, automations+insights, visuals.

### P1 — Finish the digital-twin system (you already approved this)
1. **Sync / fidelity layer.** Per-device sync state (`in_sync|stale|offline|simulated`)
   + `lastSyncAt` + `ha_entity`, and a farm "fidelity" summary ("142/148 devices in
   sync"). *Why:* this is what makes it a **twin**, not a dashboard, and makes the
   `simulated:false` hardware swap visible. *How:* derive per-asset in `lib/sync.ts`;
   badge on cards + a summary chip on the dashboard.
2. **`/twin` living map.** A schematic of the 100 acres — verticals as nodes with
   status, plus energy + water **flows** between shared resources and loads. *Why:*
   "see the whole company as one living replica." *How:* SVG/flex layout in
   `components/TwinMap.tsx`; reuse `verticalVisuals` colours + `VerticalArt`.
3. **Interactive what-if console.** UI to drag weather/load/time-of-day and watch
   the projection recompute; a "have the agent plan for this" button. *Why:* the
   predictive engine exists but is read-only. *How:* extend `forwardSimulate` params;
   `components/WhatIf.tsx` on `/twin`.
4. **Real-hardware binding path.** A Home Assistant adapter behind the SAME tool
   interface, selected by `integration.simulated`. Keep it a documented stub +
   interface until the user provides HA creds (ASK first). *Why:* the "click of a
   finger → real farm" story. *How:* `lib/hardware/` with a `SensorSource` /
   `Actuator` interface; simulator is one impl, HA REST is the other.

### P2 — All-in-one management breadth (parity with Farmbrite/Tend, but real-time)
5. **Sustainability / ESG.** Solar self-sufficiency %, water reuse (rain vs well),
   circular waste-to-resource (biogas/compost/BSF), carbon avoided + an ESG score.
   *Why:* eco-tourism story + LiteFarm's angle; nobody ties it to live energy/water.
   *How:* `lib/sustainability.ts` + `/sustainability` + agent tool. Mirror `economics.ts`.
6. **Bookings + Restaurant POS.** Lodging bookings (Beds24-style) + restaurant
   covers/tickets (Loyverse-style), driven by occupancy sensors. *Why:* hospitality +
   food service are verticals no ag platform covers. *How:* `lib/bookings.ts` +
   `/bookings` (+ `/pos`), feed `getBusinessState`.
7. **Sales / marketplace / CRM.** Orders, customers, channels (farm-gate, market,
   restaurant, online) for the produce/processed goods in Inventory. *Why:* closes
   farm-to-table; direct-sales is where diversified farms make margin. *How:*
   `lib/sales.ts` + `/sales`; ties Inventory → revenue.
8. **Procurement / suppliers.** Purchase orders; low-stock inputs (feed, nutrient)
   auto-draft a PO the agent can assign. *Why:* closes the input loop with Inventory.
9. **Accounting export.** Turn the queued "Wave export" sync into a real
   CSV/JSON P&L + transactions export. *Why:* real books, not a toy.
10. **Compliance & certifications.** Beyond HACCP: **MSPO** (Malaysian palm-oil
    cert), organic logs, full audit trail per batch. *Why:* palm + food processing
    need cert to sell; competitors treat this as bolt-on. *How:* extend `inventory.ts`
    batches + a `/compliance` view.
11. **Reporting.** Daily/weekly ops + P&L + ESG reports, exportable. *Why:* the
    founder's morning read; investors' proof.

### P3 — AI / CV / agronomy (match John Deere / Taranis / CropX, then beat them)
12. **Yield forecasting per vertical.** Project output (eggs, FFB, cans, fish,
    honey) forward from production sensors + season. *Why:* Granular/Cropwise core feature.
13. **Computer-vision detections feed.** Enrich the insight stubs into a
    "detections" stream (disease/pest/ripeness/weed) with confidence + (simulated)
    thumbnails. *Why:* 94%-accuracy CV disease detection is the headline ag-AI feature.
14. **Livestock health & welfare.** Per-animal-group health score + early-disease
    alerts (poultry, zoo, fish). *Why:* the top digital-twin *livestock* use case in
    the research; unified with everything else here.
15. **Irrigation optimization (CropX-style).** Soil + weather → recommended volume
    & timing; auto-schedule via `scheduleIrrigation`. *Why:* ~30% water savings is the
    marquee autonomous-irrigation claim.
16. **Predictive maintenance.** Track automation/equipment runtime hours → "service
    due" tasks. *Why:* autonomous-equipment fleets need it; nobody bundles it for small farms.
17. **Recommendations engine (proactive, with RM savings).** The agent surfaces
    "shed X → save RM Y", "process Z before it spoils", "irrigate block B tonight" —
    with projected impact + one-click apply. *Why:* the 20–35% input-cost-reduction
    claim, made concrete and actionable.
18. **Multi-agent / domain specialists.** Frame the supervisor as orchestrating
    energy / irrigation / livestock / crop-health / processing specialists. *Why:* the
    frontier pattern in the survey; **Fable is strong at long-horizon multi-agent** —
    lean in.
19. **Natural-language console.** A chat page: ask the agent anything ("why did
    margin drop?", "plan tomorrow", "what's at risk overnight?"). *Why:* removes the
    "clunky data-entry UX" pain; showcases Fable tool-use.

### P4 — Platform, data & resilience
20. **`farm2.config.yaml` + farm switcher.** Prove replication / multi-farm from
    one config. *Why:* CLAUDE.md stretch + "Vercel for Platforms" multi-tenant story.
21. **Timeseries persistence.** Persist readings/actions (SQLite or a bounded
    on-disk ring) for real trends, reports, and "what my company did last week".
    *Why:* today the twin is in-memory (~60 readings/sensor); history unlocks P3.
22. **Notifications for real.** Twilio WhatsApp + email on critical (ASK before
    adding Twilio/paid creds — stub until then) + **alert acknowledge/escalation UI**.
23. **Offline-first hardening.** Durable sync queue, ret/reconnect flush across ALL
    integrations (already done for the demo set — generalize).

### P5 — Differentiators (the "whole new concept" that sets us apart)
24. **Autonomy trust dial.** Per-domain setting: advise → auto-with-approval → full
    auto. *Why:* trust is the adoption blocker for autonomous ops; make it a feature.
25. **Morning brief.** A generated "What my company did while I slept" digest —
    overnight actions + today's plan + risks + projected P&L. *Why:* the emotional core
    of the pitch; a Fable strength.
26. **Circularity graph + cross-vertical optimization.** Model the loops (fish waste
    → plants, food waste → BSF/biogas → energy, restaurant demand → harvest) and let
    the agent optimize across them. *Why:* only a *unified* twin can do this — our moat.
27. **Scenario "war-games".** Run the twin forward under hypotheticals (monsoon week,
    guest surge, chiller failure) and have the agent pre-plan. *Why:* extends what-if
    into strategic planning; unique.
28. **Extensible skill/automation registry.** Make automations + tools pluggable so
    the OS is a platform others can extend. *Why:* "operating system", literally.
29. **PWA / mobile.** Installable, responsive — the founder runs it from a phone in
    the field. **Voice interface** (stretch).

### P6 — Ship
30. **Deploy** to Vercel (fastest; this is Next.js App Router) — `npm i -g vercel`,
    `vercel`. Set `ANTHROPIC_API_KEY` via `vercel env`. Instrumentation runs the sim
    on the server; note serverless cold-starts reset the in-memory twin (P4 #21 fixes
    this for prod). **README** with the OPC framing + the AWS production topology from
    `CLAUDE.md` §11 (IoT Core + Lambda + Bedrock + on-site Pi for local-first resilience).

## 11. Conventions & guardrails

- Commit per item; concise `feat:`/`fix:` messages; end with a `Co-Authored-By:` line.
- TypeScript throughout; one concern per `lib/` file; follow the module pattern (§5).
- **Offline-safe always** — no external runtime deps for the core; inline SVG; cache weather.
- **Never** shed `never_shed`/`life_support`. Re-verify the crisis invariant after
  any shedding change (`POST /api/scenario/crisis` → assert no protected asset off).
- Data lives in `farm.config.yaml`. New vertical/asset/sensor → edit YAML, add metric
  model in `simulator.ts`, power draw in `config.ts` `POWER_DRAW`, KPI in
  `updateVerticals`, then **restart to re-seed**.
- **Ask before anything paid / credentialed** beyond `ANTHROPIC_API_KEY` + AWS
  (Twilio, HA live, etc.). Prefer stubs that no-op without creds.
- Run `npm run build` (typecheck) before each commit.

## 12. Gotchas

- `LOAD_DIVERSITY = 0.4` scales connected load to realistic continuous draw — applied
  in seed, `recomputeLoad`, and energy cost. Keep consistent.
- Rule engine is **predictive + idempotent** (forecasts 6h, sheds ahead of shortfall,
  restores on recovery, dedups alerts) so autopilot never spams — preserve this.
- Sensor id scheme: `"<zoneId>:<metric>"`. Currency: RM.
- The in-app browser screenshot tool times out on this app (animations/blur) — not a
  bug; verify via `get_page_text` or `curl` instead.

## 13. Market survey & competitor matrix (the basis for §10)

**Landscape (2026).** Enterprise precision-ag (John Deere See&Spray, Taranis,
Climate FieldView, Granular, Cropwise, CropX, AGRIVI): deep crop CV + big-iron
autonomy, row-crop only, expensive, no livestock/hospitality/processing.
Diversified all-in-one (Farmbrite, Tend, LiteFarm, AgSquared): broad
record-keeping but **not real-time**, no IoT twin, no AI agent, no energy/off-grid.
IoT stacks (Home Assistant, ThingsBoard): real-time control + rules, but **not
"management"** — you build all logic. AI-agent frontier: "multiple specialized
agents orchestrated" = exactly our architecture. Off-grid energy AI: LSTM
forecast of PV+SoC → predictive load-shed (~53% less energy deficit) = our crisis
engine. Digital twins: real-time mirror + simulation/what-if + livestock disease
prediction; the documented #1 blocker is **data integration across heterogeneous
sensors** — which our unified twin solves.

**The gap we exploit:** fragmentation ("no single history of every field, batch,
device"), delay cycles (manual entry hours/days late), clunky data-entry UX, and
— crucially — **nobody serves a diversified one-person farm company as one
real-time autonomous brain.**

**Coverage matrix (target = every ✓):**

| Capability | Enterprise ag | Diversified all-in-one | IoT stacks | **FarmOS (target)** |
|---|---|---|---|---|
| Real-time IoT twin | partial | ✗ | ✓ | ✓ |
| Autonomous AI agent (decides+acts) | ✗ | ✗ | ✗ | ✓ |
| Off-grid energy + predictive load-shed | ✗ | ✗ | partial | ✓ |
| Offline resilience | ✗ | ✗ | partial | ✓ |
| Diversified verticals (11, incl. hospitality/processing) | ✗ | partial | ✗ | ✓ |
| Financials / P&L per vertical | partial | ✓ | ✗ | ✓ |
| CV disease/pest/ripeness + livestock health | ✓ (crop) | ✗ | ✗ | ✓ (P3) |
| Yield forecasting | ✓ | partial | ✗ | ✓ (P3) |
| Inventory + farm-to-table traceability/HACCP | partial | ✓ | ✗ | ✓ |
| Bookings / POS / sales / CRM | ✗ | partial | ✗ | ✓ (P2) |
| Sustainability / ESG / circularity | ✗ | partial | ✗ | ✓ (P2/P5) |
| Autonomy trust dial + morning brief + what-if war-games | ✗ | ✗ | ✗ | ✓ (P5, our moat) |

Sources (survey run 2026-07): wiseyield.co, farmonaut.com, codenicely.in
(AI-agent agriculture), sciencedirect.com + mdpi.com (agri digital twins),
mdpi.com + ncbi.nlm.nih.gov (off-grid PV-battery AI), thingsboard.io +
promeraki.com (open-source IoT), farmcloud.eu + cropin.com (fragmentation),
farmbrite.com + litefarm.org (diversified all-in-one).
