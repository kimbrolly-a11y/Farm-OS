# FarmOS — Claude Code Build Brief + Plugin Guide

*Hand this to Claude Code to build the hackathon MVP. BUIDL_OPC_Hackathon_SG · today, 9 hrs · solo · Claude + AWS · farm in Malaysia.*

---

## Part 1 — Which plugins & connectors to install

Two categories: **plugins that help you BUILD fast today**, and **connectors the FarmOS itself USES** (some double as demo material). Install only what you'll actually show.

### A. Build accelerators (pick your lane)

| Plugin | Use it for | Verdict |
|---|---|---|
| **base44** | Full-stack app builder with **entities + backend functions + built-in AI agents + connectors**. Your digital twin = entities, agent tools = backend functions, and it ships a working web app fast. | **Strongest solo-in-9-hrs option.** Maps 1:1 to the OPC theme (an agentic app out of the box). Use this if you want maximum working software, minimum plumbing. |
| **Hand-code (Claude Code + Next.js)** | Full control; Next.js + Tailwind + Claude Agent SDK, deploy to AWS Amplify/Lambda. | Best if you want a clean repo you'll keep and deploy on **AWS** (prize alignment). More setup time. |
| **Vercel** | One-command deploy of a Next.js demo. | Use for a fast live URL if AWS deploy eats too much time. Have AWS as the "production" story on a slide. |
| **Airtable** | Instant data backend / ops board if you don't want a DB. | Optional shortcut for the digital twin + task board. |

**Recommendation:** if you want the surest working demo, **build on base44**. If you'd rather own a deployable AWS repo, **hand-code with Claude Code** and keep base44 as the fallback. Don't run both.

### B. Connectors the FarmOS uses (these also make great live demo beats)

| Connector | Why it matters for a Malaysian one-person farm company |
|---|---|
| **Twilio — WhatsApp** (twilio-developer-kit) | **Highest-impact add.** Malaysia runs on WhatsApp. The agent messages the founder *"Coop 3 at 34°C — fans on, come check"* and guests get booking confirmations. A live WhatsApp ping mid-demo is a showstopper and pure OPC leverage. |
| **Twilio SendGrid** (email) | Guest confirmations, staff daily digest, supplier reorders. |
| **Weather API/MCP** | Feeds irrigation, harvest, and energy-shedding decisions. Search the MCP registry for a weather connector, or call a free weather API from a backend function. |
| **Google Calendar / Sheets** (via MCP) | Bookings calendar + a human-readable ops sheet the agent writes to — reads as a real back-office. |
| **Stripe / payments** (optional) | For the "agent commerce" angle: agent takes a deposit or sells surplus produce. |
| **AWS** (IoT Core / Lambda / Bedrock) | Your production story: real sensors → IoT Core, agent tools → Lambda, Claude → Bedrock. Show the architecture even if the demo is simulated. |

**Do this first:** install **base44** (or set up Next.js), then **Twilio WhatsApp**. Those two alone give you a working agentic app + a jaw-drop demo moment. Everything else is optional polish.

---

## Part 2 — The build brief for Claude Code

> **Paste the block below into Claude Code as your opening instruction.** It's written as a spec Claude Code can execute directly.

---

### PROJECT: FarmOS — the operating system for a one-person farm company

**Context.** Hackathon MVP for BUIDL_OPC_Hackathon_SG (theme: *One Person Company through Agentic Services*, sponsors Claude + AWS). One founder runs a 100-acre eco-tourism farm in Malaysia with ten verticals (Airbnb lodging, restaurant, hydroponics, aquaponics, fruit orchard, poultry, petting zoo, palm oil, recycling, beekeeping). FarmOS lets that one person run all of it like a company, with a **Claude supervisor agent** acting as the operations team. The farm is off-grid: solar + battery, rainwater + well water, irrigation. The system must keep operating in a degraded/offline mode during a power/internet outage.

**Goal for this build.** A working web app with (1) a live dashboard of the whole farm, (2) an autonomous Claude agent that reads farm state, makes operational decisions, takes actions, and logs each decision with its reasoning, and (3) two scripted demo scenarios. Physical sensors are **simulated** — build the software real, fake only the sensor feed (make it swappable for real MQTT/AWS IoT later).

**Tech stack.**
- Frontend: Next.js (App Router) + Tailwind + Recharts. Clean, dashboard-style, dark theme OK.
- State/data: SQLite (via Prisma) or a JSON store — whatever is fastest. Seeded from a `farm.config.yaml`.
- Agent: **Claude** with tool use (Agent SDK or Messages API + tools). One supervisor agent that calls tools.
- Sensor simulator: a Node script that emits readings on an interval into the store (or an event bus). Realistic ranges.
- Deploy: AWS Amplify or Lambda + API Gateway if time allows; otherwise Vercel, and describe the AWS production topology in the README.
- Optional: Twilio WhatsApp for real alerts.

**Data model (the digital twin).** Define these entities:
- `Farm` (name, location, config)
- `Vertical` (id, name, type, status, KPIs) — the ten modules
- `Zone` (id, verticalId, name)
- `Asset` (id, zoneId, type e.g. pump/incubator/aerator/chiller, criticality: life_support | important | discretionary, powerDraw)
- `Resource` (energy: batterySoC, solarInput; water: tankLevels[], wellStatus; each with capacity + current)
- `SensorReading` (assetId/zoneId, metric, value, unit, timestamp)
- `AgentAction` (timestamp, trigger, decision, reasoning, toolCalled, params, result) — this powers the activity log
- `Alert` (severity, message, channel, acknowledged)
- `Task` (assignee, description, verticalId, status) — work the agent delegates to humans

**Agent design.** A supervisor agent runs on a loop (or on-demand "Run agent" button). It reads current state and decides. Give it these **tools** (implement each as a function that mutates the store and returns a result):
- `getFarmState()` — full twin snapshot
- `getForecast()` — weather + solar forecast via **Open-Meteo** (free, no API key, no signup). Implementation below.
- `shedLoad(assetId, reason)` / `restoreLoad(assetId)` — turn discretionary loads off/on, never life_support
- `setActuator(assetId, state)` — fans, aerators, pumps, valves
- `scheduleIrrigation(zoneId, when, volume)`
- `createAlert(severity, message, channel)` — channel can be `whatsapp` (Twilio) or `dashboard`
- `assignTask(assignee, description, verticalId)`
- Every tool call must be written to `AgentAction` with the agent's stated reasoning.

**`getForecast()` — ready implementation (Open-Meteo, no key, no signup).** Set the farm's lat/lon from `farm.config.yaml` (default below is near Kuala Lumpur). Returns `cloud_cover` + `shortwave_radiation` for the solar/battery load-shedding decision and `precipitation` + `precipitation_probability` for irrigation ("rain coming → skip watering"). Cache the last successful response in the store so the tool still returns a usable forecast in offline/degraded mode.

```javascript
// tools/getForecast.js — free weather, no API key. Falls back to last cached result when offline.
let lastForecast = null;
async function getForecast(lat = 3.14, lon = 101.69) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover`
    + `&hourly=precipitation_probability,shortwave_radiation`   // shortwave_radiation = solar potential
    + `&daily=precipitation_sum,temperature_2m_max`
    + `&timezone=Asia/Kuala_Lumpur`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
    lastForecast = await r.json();
    return lastForecast;
  } catch (e) {
    // Offline/degraded mode: return last known forecast so the agent can still reason.
    return lastForecast ?? { offline: true, note: "no cached forecast yet" };
  }
}
// Optional Malaysia-official source for district forecasts/warnings: https://developer.data.gov.my/realtime-api/weather
```

The agent's system prompt: it is the operations team for a one-person, off-grid Malaysian eco-farm; its priorities in order are (1) protect life-support loads and animals, (2) preserve water and battery through monsoon/cloud spells, (3) keep guests comfortable and revenue flowing, (4) minimize the founder's manual work. It must explain every decision briefly.

**Screens.**
1. **Command Center (home)** — energy gauge (battery SoC + solar), water tanks, a card per vertical (status + 1 KPI), an alerts strip.
2. **Agent Activity Log** — reverse-chronological feed of `AgentAction`s: trigger → decision → reasoning → result. Headline it *"What my company did while I slept."*
3. **A vertical detail view** (build ONE richly, e.g. Poultry or Aquaponics) — sensors, actuators, agent notes.
4. **Controls** — buttons: "Run agent now", and the two demo toggles below.

**The two demo scenarios (must work — these ARE the submission).**
1. **Crisis toggle → "Cloudy day, battery low":** sets batterySoC to 22% and forecast to cloudy. Running the agent should make it shed discretionary loads (pool pump, EV charger, decorative lighting) while explicitly protecting life-support (incubator, aquaponics aerator, cold storage), and log the reasoning.
2. **Resilience toggle → "Grid + internet outage":** flips `online=false`. The app must keep functioning in degraded mode — the agent falls back to cached rules/last plan, keeps life-support on, queues any external syncs/alerts, and the UI shows an "OFFLINE — running autonomously" banner. When toggled back online, queued items flush.

**Replication proof (stretch).** Load a second `farm.config.yaml` ("Farm #2") and show the whole system reboot for a different farm from config alone.

**Build order (ship each before the next — commit at every step):**
1. Scaffold Next.js + Tailwind, seed the twin from `farm.config.yaml`. *(commit)*
2. Sensor simulator emitting readings. *(commit)*
3. Command Center dashboard rendering live state + gauges. *(commit)*
4. Agent + tools + Activity Log; "Run agent now" works end to end. *(commit)*
5. Crisis scenario wired and verified. *(commit)*
6. Resilience/offline scenario wired and verified. *(commit)*
7. Polish: one rich vertical view, Twilio WhatsApp alert on high severity. *(commit)*
8. Stretch: Farm #2 replication, deploy to AWS, README with production architecture. *(commit)*

**Acceptance criteria.** The dashboard shows live changing data; clicking "Run agent" produces real tool calls logged with reasoning; the crisis scenario visibly sheds loads and protects life-support; the offline scenario keeps running and shows the banner; the repo builds clean and has a README explaining the OPC framing and the AWS production topology.

**Keep it demoable.** Three richly-working verticals beat ten stubs. Never sacrifice the two demo scenarios. Favor clarity and a clean live URL over feature count.

---

### END OF PASTE BLOCK

---

## Part 3 — Suggested 9-hour timeline (solo)

- **Hr 0–0.5** — Install base44 **or** scaffold Next.js; install Twilio WhatsApp. Write `farm.config.yaml`.
- **Hr 0.5–2** — Digital twin + sensor simulator + Command Center dashboard rendering live.
- **Hr 2–4.5** — Claude supervisor agent + tools + Activity Log working end to end.
- **Hr 4.5–6** — Crisis scenario, then offline/resilience scenario. Verify both.
- **Hr 6–7.5** — One rich vertical view + Twilio WhatsApp alert. Deploy to a live URL (AWS if smooth, else Vercel).
- **Hr 7.5–8.5** — Farm #2 replication (if time), README, screenshots.
- **Hr 8.5–9** — Rehearse the 3-minute demo twice. Lock the build; stop coding.

**Golden rule:** at every hour mark, make sure you still have a *working, demoable* version deployed. A rough end-to-end demo beats a half-finished perfect one.
