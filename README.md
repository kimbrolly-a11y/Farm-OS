# FarmOS — the operating system for a one-person farm company

> **BUIDL_OPC_Hackathon_SG** · theme: *"One Person Company through Agentic Services"* · sponsors: **Claude + AWS** · team: **FarmOS Labs**

One founder runs **Crown Eagles Eco Farm**: a 100-acre, off-grid, self-sufficient eco-tourism
farm in Malaysia — 18 operating verticals from dairy cattle and aquaculture to palm
oil, a farm-to-table restaurant, a hotel, and a funworld. The entire operations
team is **one Claude agent**. It senses through a live digital twin, predicts hours
ahead, decides, acts through tools, and logs every decision with its reasoning —
even through a power or internet outage.

**The one-person company, literally:** the AI replaces the ops/monitoring/planning
layer. Humans do what only humans should — animal care, safety-critical guest
activities, craft.

**Live:** https://farmos-ochre.vercel.app · **Repo:** https://github.com/kimbrolly-a11y/farmos (auto-deploys on push) — browse everything (the twin ticks on
demand). For the interactive **crisis/outage demo**, run locally: the twin is
in-memory, and serverless instances don't share state between scenario clicks
(timeseries persistence is the planned P4 fix).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 — simulator + autopilot boot on start
```

No API key needed: without `ANTHROPIC_API_KEY` in `.env.local` the agent runs on a
deterministic rule engine (same priorities, same guardrails). Add a key and it runs
**Claude Fable 5** with real tool-use (server-side refusal fallback to Opus 4.8).

## The 3-minute demo

1. `/` Welcome → **Explore the farm** → 18 verticals with live sensors.
2. `/dashboard` → toggle **🛰 Autopilot ON** → `/controls` → **⚡ Crisis** (battery
   22%, heavy cloud) → *do nothing* → watch `/activity`: the agent sheds
   discretionary loads, **never touches life-support** (animals, incubators, cold
   chain, potable water — hard-guarded, even from the AI).
3. **🌩 Outage** → the OS keeps running offline: cached rules, queued syncs, banner.
   **Reconnect** → queue flushes. **Reset** → normal.
4. The breadth: `/twin` (living map + what-if console) · `/manage` (live P&L + CSV
   books) · `/loops` (92% circular zero-waste map) · `/water` (natural treatment,
   shortage ladder) · `/sustainability` (live ESG) · `/attractions` + `/guest`
   (the resort side) · `/console` (ask the farm anything) · `/brief` (what my
   company did while I slept) · `/controls` (autonomy trust dial:
   advise → approve → full auto, per domain).

## Why this wins the category

Enterprise precision-ag is row-crop only. Diversified farm software isn't
real-time. IoT stacks aren't management systems. **Nobody serves a diversified
one-person farm company with one real-time autonomous brain.** FarmOS is
real-time + autonomous + unified + off-grid-aware + offline-resilient, with the
business layer (P&L, inventory/HACCP, bookings, ESG) on the same twin.

## Architecture

**Now (hackathon):** Next.js 15 App Router + TypeScript + Tailwind v4 + Recharts.
The digital twin is an in-memory server-side singleton seeded from
`farm.config.yaml` (the farm-as-code artifact — replicate a farm by copying one
file). A sensor simulator emits readings; `instrumentation.ts` boots the sim +
autopilot loop. The agent is `@anthropic-ai/sdk` tool-runner with 12 tools; a
deterministic rule engine backs it offline.

**Every device is real:** each asset/sensor in `farm.config.yaml` names a buyable
product and its `ha_entity`/protocol. Flip `integration.simulated: false` and the
same code path talks to a Home Assistant hub — the demo and the real farm run the
same logic.

**Production topology (AWS):**

```
field sensors ──MQTT──▶ Home Assistant / ThingsBoard (on-site Raspberry Pi 5)
                              │  local-first: survives outages
                              ▼
                    AWS IoT Core ──▶ Lambda (agent tools) ──▶ Bedrock (Claude)
                              │
                              ▼
        InfluxDB/Grafana · Twilio WhatsApp · Beds24 · Loyverse POS · Wave
```

The on-site Pi runs the local stack so life-support automation survives internet
loss; the cloud layer adds the Claude brain, business integrations, and alerting.
FarmOS is the **agent layer on top of open-source farm tools** — it doesn't
rebuild them.

## Guardrails that matter

- **Life-support guard:** `never_shed` assets (animal vitals, incubation, cold
  chain, potable water treatment) are refused at the tool layer. No prompt, no
  autonomy level, no bug in the agent can switch them off.
- **Autonomy trust dial:** per-domain advise / approve / full-auto. Trust is
  earned incrementally; everything is logged with reasoning either way.
- **Offline-first:** no external runtime dependency in the core loop; weather is
  cached; external syncs queue and flush.

## Repo map

`farm.config.yaml` — the farm definition (source of truth) · `lib/` — twin, store,
simulator, agent + tools, rule engine, predict, economics, water, energy, sync,
autonomy, sustainability… · `app/` — pages + API routes · `HANDOFF.md` /
`FARMOS-MASTER-SPEC.md` — build plan + full farm spec.
