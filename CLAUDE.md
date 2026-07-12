# CLAUDE.md — FarmOS

> **This file is the handoff brief for Claude Code.** Place it at the repo root; Claude Code loads it automatically as project memory. It is self-contained — everything needed to build the MVP is here.

---

## ▶ Kickoff prompt (paste this as your first message to Claude Code)

> Read CLAUDE.md. Build the FarmOS MVP described here, in the build order given. Start with steps 1–3 (scaffold + digital twin + sensor simulator + dashboard) and get a working live view before touching the agent. Commit after every numbered step with a clear message. After each step, tell me what to click to verify it. Ask me before installing paid services; prefer free/no-key options (e.g. Open-Meteo for weather). Keep it demoable at every stage.

---

## 1. What we're building

**FarmOS** — the operating system for a **one-person farm company**. One founder runs a 100-acre eco-tourism farm in **Malaysia** with ten verticals (Airbnb lodging, restaurant, hydroponics, aquaponics, fruit orchard, poultry, petting zoo, palm oil, recycling, beekeeping). A **Claude supervisor agent** acts as the whole operations team: it reads farm state, makes operational decisions, takes actions, and logs each decision with its reasoning.

The farm is **off-grid**: solar + battery, rainwater + well water, irrigation. FarmOS must keep operating in a **degraded/offline mode** during a power or internet outage.

**Hackathon context:** BUIDL_OPC_Hackathon_SG · theme *"One Person Company through Agentic Services"* · sponsors **Claude + AWS** · solo build, ~9 hours.

**Definition of done for the MVP:** a working web app with (1) a live dashboard of the whole farm, (2) an autonomous Claude agent with tools + a reasoning log, and (3) two scripted demo scenarios (crisis + offline). Physical sensors are **simulated**; build the software real and keep the sensor feed swappable for real MQTT/AWS IoT later.

## 2. Tech stack

- **Frontend:** Next.js (App Router) + Tailwind + Recharts. Clean dashboard, dark theme OK.
- **Data:** SQLite via Prisma (or a JSON store if faster). Seeded from `farm.config.yaml`.
- **Agent:** Claude with tool use (Agent SDK or Messages API + tools). One supervisor agent.
- **Weather:** Open-Meteo (free, no key) — see `getForecast()` in §5.
- **Sensor simulator:** a Node script emitting readings on an interval.
- **Deploy:** AWS Amplify or Lambda + API Gateway if smooth; else Vercel, with the AWS production topology described in README.
- **Optional:** Twilio WhatsApp for real high-severity alerts.
- **Do NOT** add paid/no-key-friction services without asking. Prefer free/open.

## 2b. The seed file — `farm.config.yaml`

A ready `farm.config.yaml` ships with this project. Seed the twin from it. Notes for parsing:
- It has `farm` (name, location lat/lon → feed `getForecast()`), `resources` (energy + water), and `verticals[]` with `zones[]` → `assets[]` and `sensors[]`.
- Each asset has `criticality` (`life_support` | `important` | `discretionary`) and a `hardware`/`ha_entity`/`protocol` triplet describing the **real device** it maps to. For the MVP ignore the hardware fields except to display them; they matter when `integration.simulated` flips to `false` (live farm).
- Use the top-level **`load_shedding`** ladder (`shed_first` → `shed_next`, `never_shed`) as the ground truth for the crisis scenario — the agent must never shed anything in `never_shed`.
- Use `alerts` for channel routing (WhatsApp for critical).
- `integration.simulated: true` → the sensor simulator generates readings. Keep the code path identical for `false` (real Home Assistant API) so the demo and the real farm run the same logic.

## 3. Repo structure (target)

```
/app            Next.js routes (command-center, activity-log, vertical/[id], controls)
/components     dashboard widgets (gauges, vertical cards, alert strip, activity feed)
/lib            twin store, agent, tools, simulator
/lib/tools      one file per agent tool (getForecast, shedLoad, ...)
/prisma         schema + seed (or /data/*.json)
farm.config.yaml   the farm definition (also the replication artifact)
farm2.config.yaml  a second farm, to prove replication
README.md       OPC framing + AWS production architecture
```

## 4. Data model (the digital twin)

- `Farm` (name, location{lat,lon}, config)
- `Vertical` (id, name, type, status, kpis) — the ten modules
- `Zone` (id, verticalId, name)
- `Asset` (id, zoneId, type[pump|incubator|aerator|chiller|fan|light|charger], criticality[life_support|important|discretionary], powerDraw, state[on|off])
- `Resource` — energy{batterySoC, solarInputKw}, water{tanks[{id,capacity,current}], wellStatus}
- `SensorReading` (assetId|zoneId, metric, value, unit, timestamp)
- `AgentAction` (timestamp, trigger, decision, reasoning, toolCalled, params, result) — **powers the activity log**
- `Alert` (severity, message, channel[whatsapp|dashboard], acknowledged)
- `Task` (assignee, description, verticalId, status)

## 5. Agent design

A supervisor agent runs on demand ("Run agent now" button) and/or on an interval. It reads current state, decides, and acts through **tools** (each mutates the store and returns a result; each call is written to `AgentAction` with the agent's stated reasoning):

- `getFarmState()` — full twin snapshot
- `getForecast()` — Open-Meteo, implementation below
- `shedLoad(assetId, reason)` / `restoreLoad(assetId)` — never sheds `life_support`
- `setActuator(assetId, state)` — fans, aerators, pumps, valves
- `scheduleIrrigation(zoneId, when, volume)`
- `createAlert(severity, message, channel)`
- `assignTask(assignee, description, verticalId)`

**`getForecast()` — ready implementation (Open-Meteo, no key, no signup).** Lat/lon from `farm.config.yaml` (default ≈ Kuala Lumpur). `cloud_cover` + `shortwave_radiation` drive solar/battery load-shedding; `precipitation` + `precipitation_probability` drive irrigation. Caches last result so it still works offline.

```javascript
// lib/tools/getForecast.js — free weather, no API key. Falls back to last cached result when offline.
let lastForecast = null;
export async function getForecast(lat = 3.14, lon = 101.69) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover`
    + `&hourly=precipitation_probability,shortwave_radiation`
    + `&daily=precipitation_sum,temperature_2m_max`
    + `&timezone=Asia/Kuala_Lumpur`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
    lastForecast = await r.json();
    return lastForecast;
  } catch {
    return lastForecast ?? { offline: true, note: "no cached forecast yet" };
  }
}
// Malaysia-official alternative: https://developer.data.gov.my/realtime-api/weather
```

**System prompt for the agent:** *You are the operations team for a one-person, off-grid eco-farm in Malaysia. Your priorities, in order: (1) protect life-support loads and animals, (2) preserve water and battery through monsoon/cloud spells, (3) keep guests comfortable and revenue flowing, (4) minimise the founder's manual work. Explain every decision in one or two sentences. Never shed a life_support load.*

## 6. Screens

1. **Command Center (home)** — energy gauge (battery SoC + solar), water tanks, one card per vertical (status + 1 KPI), an alerts strip.
2. **Agent Activity Log** — reverse-chronological `AgentAction` feed: trigger → decision → reasoning → result. Header: *"What my company did while I slept."*
3. **One rich vertical detail view** (build Poultry or Aquaponics fully) — sensors, actuators, agent notes.
4. **Controls** — "Run agent now" + the two demo toggles.

## 7. The two demo scenarios (MUST work — these ARE the submission)

1. **Crisis — "Cloudy day, battery low":** set `batterySoC=22%`, forecast cloudy. Running the agent must shed discretionary loads (pool pump, EV charger, decorative lighting) while explicitly protecting life-support (incubator, aquaponics aerator, cold storage), and log the reasoning.
2. **Resilience — "Grid + internet outage":** flip `online=false`. App keeps working in degraded mode — agent falls back to cached rules/`getForecast` cache/last plan, keeps life-support on, queues external syncs/alerts, UI shows an **"OFFLINE — running autonomously"** banner. Toggling back online flushes the queue.

## 8. Build order (ship + commit each before the next)

1. Scaffold Next.js + Tailwind; seed twin from `farm.config.yaml`. *(commit)*
2. Sensor simulator emitting readings. *(commit)*
3. Command Center dashboard rendering live state + gauges. *(commit)*
4. Agent + tools + Activity Log; "Run agent now" works end to end. *(commit)*
5. Crisis scenario wired + verified. *(commit)*
6. Resilience/offline scenario wired + verified. *(commit)*
7. Polish: one rich vertical view + Twilio WhatsApp alert on high severity. *(commit)*
8. Stretch: `farm2.config.yaml` replication; deploy to AWS; README with production architecture. *(commit)*

## 9. Conventions & guardrails

- Commit after each numbered step; concise messages (`feat: sensor simulator`).
- After each step, state exactly what to click to verify it.
- TypeScript. Keep functions small; one tool per file under `lib/tools`.
- Three richly-working verticals beat ten stubs. Never sacrifice the two demo scenarios.
- No browser localStorage/sessionStorage assumptions; keep state server-side or in-memory.
- Ask before anything paid or requiring an API key beyond Claude/AWS.

## 10. Acceptance criteria

Dashboard shows live changing data; "Run agent" produces real tool calls logged with reasoning; crisis scenario visibly sheds loads while protecting life-support; offline scenario keeps running with the banner and flushes on reconnect; repo builds clean; README explains the OPC framing + AWS production topology.

## 11. Production architecture (for README / future farm)

FarmOS is the **agent layer** on top of open-source farm tools — don't rebuild them:
`sensors → MQTT → Home Assistant / ThingsBoard → InfluxDB + Grafana → FarmOS agent (Claude) → WhatsApp/Twilio + business apps (Beds24 bookings, Loyverse POS, Odoo/Wave accounting)`. Real deployment target: AWS IoT Core (sensors) + Lambda (tools) + Bedrock (Claude), with an on-site Raspberry Pi running the local-first stack so it survives outages.
