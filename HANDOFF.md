# FarmOS — Handoff Brief (for a fresh Claude Code session on Claude Fable 5)

> **Paste this as your first message in the new terminal:**
>
> Read `HANDOFF.md`, then `CLAUDE.md`, then `farm.config.yaml`. This is a working
> hackathon build of FarmOS — an autonomous operating system for a one-person,
> off-grid eco-farm. ~15 commits are already done and the app runs. Do NOT
> rebuild from scratch. Confirm you can run it (`npm install && npm run dev`,
> open http://localhost:3000), then continue from the **"What remains"** section
> below, committing after each numbered item. Switch the agent to Claude Fable 5
> per the **"Switching the agent to Fable 5"** section. Keep the two demo
> scenarios (crisis + resilience) bulletproof at all times.

---

## 1. What FarmOS is

The operating system for a **one-person farm company**: a 100-acre off-grid
eco-tourism farm in Malaysia ("Verdant Acres") with 11 verticals (Airbnb
lodging, restaurant, hydroponics, aquaponics, fruit orchard, poultry, petting
zoo, palm oil, recycling, beekeeping, **canning & food processing**). A **Claude
supervisor agent** acts as the whole operations team — it reads farm state,
predicts, decides, acts through tools, and logs each decision with reasoning.
The farm is off-grid (solar + battery, rainwater + well) and must keep running
in a **degraded/offline mode** during a power/internet outage.

Full original spec is in `CLAUDE.md`. This file is the *current-state* addendum.

## 2. Tech stack (as built)

- **Next.js 15 (App Router) + TypeScript + Tailwind v4 + Recharts.**
- **Digital twin:** in-memory, server-side singleton (NOT a database), seeded
  from `farm.config.yaml`. Pinned on `globalThis` so it survives dev hot-reload.
- **Agent:** `@anthropic-ai/sdk` (v0.111) tool runner (`client.beta.messages.toolRunner`).
  Model constant is in `lib/agent.ts`. Falls back to a deterministic **rule
  engine** when offline, when `ANTHROPIC_API_KEY` is unset, or on API error.
- **Weather:** Open-Meteo (free, no key), with an offline cache + a synthetic
  crisis-forecast override.
- **Sim + autopilot:** booted on server start via `instrumentation.ts`.

## 3. How to run & verify

```bash
npm install
npm run dev            # http://localhost:3000
```

- The **sensor simulator** ticks every 3s and the **autopilot loop** arms on
  server start (see console: `[simulator] started` / `[autopilot] loop armed`).
- `npm run build` runs a full **typecheck** — dev mode does NOT typecheck, so run
  `npm run build` before committing anything nontrivial. Last known state: build
  is GREEN.
- **IMPORTANT gotcha:** the twin is seeded once at server start. **If you change
  the twin shape (anything in `lib/types.ts` `Twin` / `sim`, or seed logic in
  `lib/config.ts`), you MUST restart `npm run dev`** to re-seed — hot reload does
  not re-run the seed, and stale-shape twins throw. Route/component/UI changes
  hot-reload fine.

Demo flow that proves it's an autonomous OS: open `/dashboard` → toggle
**🛰 Autopilot ON** → go to `/controls` → hit **⚡ Crisis** → do nothing → watch
the **Activity Log** fill as the agent sheds discretionary loads, protects
life-support, and logs reasoning on its own every 30s.

## 4. Current state — what's already built (15 commits, all working)

| Area | Status |
|---|---|
| Scaffold + digital twin seeded from YAML | ✅ |
| Sensor simulator (mean-reverting per-metric models, energy/water dynamics) | ✅ |
| Command Center dashboard (energy/water/predictive panels, vertical cards, alerts) | ✅ |
| Agent + 12 tools + Activity Log ("Run agent now") | ✅ |
| **Crisis scenario** (battery 22% + cloudy → sheds discretionary, protects never_shed) | ✅ (submission-critical) |
| **Resilience/offline scenario** (outage → degraded, queued syncs, flush on reconnect) | ✅ (submission-critical) |
| Twin Core: all 11 verticals deep — 24 zones, 59 assets, 61 sensors | ✅ |
| Manage · P&L (per-vertical revenue/cost/margin, farm rollup) | ✅ |
| Predictive intelligence (12h forward-sim of battery + `simulateForward` tool) | ✅ |
| AI insight signals per vertical + Automations/equipment layer + `runAutomation` | ✅ |
| Production, Inventory & farm-to-table traceability (HACCP) | ✅ |
| Workforce/Tasks board | ✅ |
| **Autopilot** — autonomous mode (agent self-runs every 30s; rule engine is predictive + idempotent) | ✅ |
| Welcome screen + visual vertical gallery + per-vertical SVG art/colour identity | ✅ |

Working tree is clean on branch `master` (default branch for PRs is `main`).

## 5. File map (the important bits)

```
farm.config.yaml         # SOURCE OF TRUTH — verticals/zones/assets/sensors/resources
                         #   + load_shedding ladder + alert routing + ha_entity map
instrumentation.ts       # boots simulator + autopilot on server start
lib/
  types.ts               # the Twin data model (Farm/Vertical/Zone/Asset/Sensor/etc.)
  config.ts              # YAML -> Twin seed; POWER_DRAW map; LOAD_DIVERSITY (0.4)
  store.ts               # in-memory twin singleton (globalThis); recomputeLoad()
  simulator.ts           # per-metric reading models + energy/water tick; updateVerticals()
  insights.ts            # AI/CV-derived per-vertical signals (deriveInsights)
  economics.ts           # per-vertical P&L (getBusiness)
  predict.ts             # non-destructive forward-sim (forwardSimulate)
  automations.ts         # autonomous-equipment registry (getAutomations, runAutomation)
  inventory.ts           # stock + batches + HACCP (getInventory)
  ruleEngine.ts          # deterministic fallback (PREDICTIVE: sheds ahead of shortfall)
  agent.ts               # Claude tool runner (12 betaTool tools) + rule fallback. MODEL const here.
  scenario.ts            # armCrisis / goOffline / goOnline / resetScenario
  autopilot.ts           # 30s autonomous loop
  verticalVisuals.ts     # per-vertical colour/gradient/tagline
  tools/log.ts           # logAction() -> AgentAction (the Activity Log) + setTrigger()
  tools/getForecast.ts   # Open-Meteo + offline cache + crisisForecast + getTwinForecast
  tools/actions.ts       # tool impls: getFarmState/shedLoad/restoreLoad/setActuator/
                         #   scheduleIrrigation/createAlert/assignTask (+ life-support guard)
components/              # CommandCenter, Welcome, VerticalsGallery, VerticalArt, VerticalCard,
                         #   VerticalDetail, EnergyPanel, WaterPanel, PredictivePanel, ManageView,
                         #   InventoryView, AutomationsView, TasksView, ActivityLog, Controls, useTwin
app/                     # routes (below)
```

## 6. Routes & APIs

**Pages:** `/` (Welcome) · `/verticals` (visual gallery) · `/dashboard` (Command
Center) · `/vertical/[id]` · `/manage` · `/inventory` · `/automations` · `/tasks`
· `/activity` · `/controls`

**APIs:** `GET /api/state` · `POST /api/tick` · `POST /api/agent/run` ·
`GET /api/business` · `GET /api/predict` · `GET /api/inventory` ·
`GET /api/automations` · `POST /api/automations/run` · `POST /api/tasks/done` ·
`POST /api/autopilot` · `POST /api/scenario/{crisis,offline,online,reset}`

## 7. The agent — 12 tools

`getFarmState`, `getForecast`, `getBusinessState`, `getInventory`,
`simulateForward`, `runAutomation`, `shedLoad`, `restoreLoad`, `setActuator`,
`scheduleIrrigation`, `createAlert`, `assignTask`. Every ACTION tool takes a
`reasoning` argument that is written to the Activity Log (`AgentAction`). Read
tools don't log. The life-support guard (`isProtected` in `lib/tools/actions.ts`)
makes `shedLoad`/`setActuator(off)` REFUSE anything in `never_shed` or with
`criticality: life_support`. Never weaken this — it's the core safety invariant
of the crisis demo.

## 8. Switching the agent to Claude Fable 5

The user wants the agent to run on **Claude Fable 5** (`claude-fable-5`).

1. In `lib/agent.ts`, change `const MODEL = "claude-opus-4-8"` → `"claude-fable-5"`.
2. **Fable 5 API differences to respect** (verify against the `claude-api` skill —
   run `/claude-api` or read it before editing LLM calls):
   - **Thinking is always on.** Do NOT send `thinking: {type: "disabled"}` (400).
     The current code sends `thinking: {type: "adaptive"}` which is accepted, but
     you can also omit the `thinking` param entirely. Keep `output_config.effort`.
   - **No `temperature`/`top_p`/`top_k`** (already absent — don't add them).
   - **Requires 30-day data retention** (not available under zero-data-retention orgs).
   - Consider adding **refusal fallbacks** to `claude-opus-4-8` for robustness
     (see the claude-api skill's Fable section). Optional for the demo.
3. The agent only runs on Claude when `ANTHROPIC_API_KEY` is set (else rule
   engine). Create `.env.local` with `ANTHROPIC_API_KEY=sk-ant-...` (already
   gitignored). Restart `npm run dev` after adding it.
4. Verify live: `POST /api/agent/run` and check `mode: "claude"` in the response
   (not `"rules"`), and that new Activity Log entries have real generated reasoning.

## 9. The two demo scenarios (MUST stay working — they are the submission)

- **Crisis** (`/controls` → ⚡ Crisis, or `POST /api/scenario/crisis`): sets
  battery 22% + forces a cloudy forecast, runs the agent, sheds discretionary
  loads, protects all 8 `never_shed` assets. There is an invariant: **no
  protected asset is ever shed**. If you touch shedding logic, re-verify this.
- **Resilience** (`/controls` → 🌩 Outage / Reconnect, or `POST /api/scenario/offline|online`):
  flips `online=false` → OFFLINE banner, agent on cached rules + last forecast,
  external syncs (Beds24/Loyverse/Open-Meteo/Wave) queue, flush on reconnect.
- **Reset** (`POST /api/scenario/reset`) restores a healthy normal state.

## 10. What remains (continue here, commit each)

1. **Twilio WhatsApp alert on critical severity** (CLAUDE.md step 7). Currently
   `createAlert` routes critical → `whatsapp` channel and queues offline, but
   there is **no real send**. Add a `lib/tools/sendWhatsApp.ts` that no-ops/logs
   unless `TWILIO_*` env vars are present (ASK the user before adding the Twilio
   dependency or any paid/credentialed service — prefer a stub).
2. **Sustainability / ESG module** (not built): solar self-sufficiency %, water
   reuse (rain vs well), circular waste-to-resource (biogas/compost/BSF), carbon
   avoided. Add `lib/sustainability.ts` + `/sustainability` page + agent tool,
   mirroring the shape of `economics.ts` + `ManageView.tsx`.
3. **Bookings / POS view** (not built): lodging bookings (cabins) + restaurant
   covers, from the existing occupancy sensors. New page + optional agent tool.
4. **Stretch (CLAUDE.md step 8):** `farm2.config.yaml` to prove replication
   (seed is config-driven, so this is mostly a second YAML + a farm switch);
   deploy (Vercel is simplest — this repo is Next.js App Router; AWS topology is
   described in `CLAUDE.md` §11); write `README.md` with the OPC framing + the
   AWS production architecture.
5. **Polish:** the header nav on `/dashboard` is getting long — consider grouping.
   The in-app browser screenshot tool times out on this app (animation/blur) —
   not a bug; verify via `get_page_text` or curl instead.

## 11. Conventions & guardrails

- Commit after each numbered step with a concise `feat:`/`fix:` message.
  End commit messages with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  (or your own model tag).
- TypeScript throughout. One tool impl per concern under `lib/tools`.
- Keep everything **offline-safe** — the core app must not depend on any external
  service at runtime (Open-Meteo is cached; no CDN/remote assets; SVG art is inline).
- **Never** shed a `never_shed` / `life_support` load. It's the #1 agent priority.
- Data lives in `farm.config.yaml` (source of truth + replication artifact). To add
  a vertical/asset/sensor, edit the YAML, then add any new metric model in
  `simulator.ts`, asset-type power draw in `config.ts` `POWER_DRAW`, and (if it has
  a headline) KPI logic in `simulator.ts` `updateVerticals`. Restart to re-seed.
- Ask before anything paid or requiring a credential beyond `ANTHROPIC_API_KEY` /
  AWS (e.g. Twilio).

## 12. Notes / gotchas

- `LOAD_DIVERSITY = 0.4` (`lib/config.ts`) scales connected load to a realistic
  continuous draw (equipment duty-cycles). It's applied in seed, `recomputeLoad`,
  and energy-cost calc. Keep them consistent if you change it.
- The rule engine is **predictive**: above 30% SoC it forward-simulates 6h and
  sheds discretionary loads if projected to hit 20% within 120 min; restores them
  above 60% in normal scenario. It's idempotent (alert dedupe + idempotent shed)
  so the autopilot loop never spams — preserve that if you edit `ruleEngine.ts`.
- Sensor id scheme is `"<zoneId>:<metric>"` (e.g. `plantation-block-3:ffb_yield`).
- Currency in the P&L is RM (Malaysian ringgit).
```
