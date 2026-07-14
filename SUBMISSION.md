# FarmOS — Hackathon Submission Kit

> BUIDL_OPC_Hackathon_SG · theme **"One Person Company through Agentic Services"**
> · sponsors **Claude + AWS**. Copy the fields below into the submission form.
> Fill the bracketed **[TODO]** items (repo URL, video, deployed URL, team).

---

## Project name
**FarmOS — the autonomous operating system for a one-person farm company**

## Tagline (one line)
An AI agent that runs an entire off-grid, self-sustaining eco-tourism farm by
itself — and keeps it alive through a power or internet blackout.

## Elevator pitch (2–3 sentences)
FarmOS turns a Claude agent into the whole operations team for a 100-acre,
18-vertical off-grid farm company in Malaysia. It senses the farm through a live
digital twin, **predicts and acts** — shedding power, scheduling irrigation,
dispatching autonomous equipment, protecting the animals — and logs every
decision with its reasoning. One person (plus the AI) runs what normally takes a
department, and it keeps operating autonomously even when the grid and internet
go down.

## The theme fit — "One Person Company through Agentic Services"
A diversified farm (lodging, restaurant, dairy, poultry, aquaculture, palm oil,
processing, beekeeping, eco-tourism…) normally needs a full ops team. FarmOS
replaces that team with **one autonomous Claude agent** acting through tools —
the literal embodiment of a one-person company run by agentic services. The human
sets intent and approves the sensitive calls (animal treatment, spending, guest
messaging); the AI does everything else, continuously.

## What it does
- **Live digital twin** of the whole farm: 18 verticals, ~32 zones, ~84 assets,
  ~85 sensors, seeded from one config file and evolving in real time.
- **Autonomous Claude agent** ("Autopilot") that runs on its own every 30s: reads
  state + forecast, **forward-simulates** the battery, and acts through 12+ tools
  (shed/restore load, set actuators, schedule irrigation, run automations, create
  alerts, assign tasks) — every action logged with a one-sentence rationale.
- **Crisis demo:** cloudy day + low battery → the AI sheds discretionary loads
  (pool pumps, decorative lighting, processing) while **protecting life-support**
  (animals' feed/water/ventilation, incubators, cold chain) — an invariant it can
  never violate.
- **Resilience demo:** grid + internet outage → the app keeps running in degraded
  mode on cached rules, protects life-support, and **queues external syncs** that
  flush on reconnect.
- **It's a business, not just telemetry:** live per-vertical **P&L**, production,
  **inventory + farm-to-table HACCP traceability**, workforce tasks.
- **Circular & self-sufficient:** a **zero-waste resource map** (palm waste →
  charcoal/biochar/biogas, manure → insect feed, fish water → irrigation) at ~92%
  circularity, off-grid solar + battery + biogas energy, natural water treatment.
- **AI insights per vertical:** CV/collar-derived health, disease-risk, ripeness,
  water-quality, herd-welfare signals feeding the agent's decisions.

## How Claude is used (sponsor)
Claude **is** the product's brain — not a chatbot bolted on. The supervisor agent
uses the Anthropic SDK **tool runner** with adaptive thinking and a 12+ tool
surface; each action tool requires a `reasoning` argument so every autonomous
decision is explainable and audited in the Activity Log. It runs in an
**autonomous loop** (sense → predict → act) and degrades gracefully to a
deterministic rule engine when offline or keyless, so the demo never breaks.
Built on **Claude Opus 4.8 / Claude Fable 5** at high effort for long-horizon
autonomous operation.

## How AWS is used / production architecture (sponsor)
FarmOS is the **agent layer** on top of open farm-IoT tooling, architected for
AWS in production:
`sensors → MQTT → AWS IoT Core → Lambda (agent tools) → Amazon Bedrock (Claude) →
WhatsApp/Twilio + business apps`, with an **on-site Raspberry Pi** running the
local-first stack (Home Assistant + Node-RED) so the farm survives cloud/internet
outages. Every asset in the config already carries its real `ha_entity` +
protocol, so flipping `integration.simulated: false` swaps the simulator for live
hardware with the same code path. Deployable on AWS Amplify / Lambda.

## How we built it (tech stack)
Next.js 15 (App Router) + TypeScript + Tailwind + Recharts. In-memory server-side
digital twin seeded from `farm.config.yaml`. Anthropic SDK tool-runner agent
(Claude) + deterministic rule-engine fallback. Sensor simulator + autonomous
autopilot booted via Next instrumentation. Open-Meteo for weather (free, no key,
cached for offline). Fully offline-safe (no external runtime deps; inline SVG
art). Architected for Home Assistant / MQTT / AWS IoT for the real farm.

## Accomplishments
- A genuinely **autonomous** system (not scripted): the AI runs the company on a
  loop and you can watch it react to a crisis live, with reasoning.
- A **safety invariant** that holds under autonomy — life-support is never shed.
- **Offline resilience** — the whole thing keeps running through a simulated
  blackout, which matters for a real off-grid farm.
- Breadth **and** believability: 18 real verticals, live P&L, circular-economy
  loops, farm-to-table traceability — one coherent operating system.

## Challenges
Keeping the autonomous loop **idempotent and safe** (no alert spam, never shedding
life-support) while still being genuinely reactive; making an off-grid energy
model that's realistic (load diversity, predictive overnight shedding); and
covering enormous breadth (a diversified farm + resort) without the demo becoming
fragile — solved by a config-driven twin and a demo that degrades gracefully at
every step.

## What we learned
Agentic autonomy is most convincing when every action is **explainable** and the
system **fails safe**. Grounding the agent in a unified digital twin (one "source
of truth") is what lets a single agent reason across ten+ domains — which is
exactly the fragmentation gap real farm software has.

## What's next
Real Home Assistant / AWS IoT hardware binding (the code path already exists);
hybrid energy (biogas + wind) and natural water treatment; the eco-tourism guest
app (bookings, animal cams, adopt-an-animal); computer-vision livestock/crop
detection; carbon-credit / ESG reporting; multi-farm replication.

## Demo script (90 seconds — this is the live walkthrough)
1. **Welcome screen** → "FarmOS, an autonomous OS for a one-person, off-grid,
   self-sustaining eco-tourism farm." → **Explore the farm** → the 18-vertical
   visual gallery.
2. **Dashboard** → flip **🛰 Autopilot ON** → **Controls → ⚡ Crisis** → *touch
   nothing* → **Activity Log**: watch the AI shed discretionary loads while
   protecting the animals, every 30s, explaining each decision. → **🌩 Outage** →
   offline resilience → **Reset**.
3. **Loops** → the zero-waste circular map (92% circularity, products sold from
   waste). → **Manage** → live P&L across every vertical.
4. **Farm Map** → the whole of Crown Eagles Eco Farm on one page (AI-rendered, 4 styles)
   with every zone tappable → live detail. → the **eco-tourism experience**
   (weddings, glamping, pool & lazy river, horse riding, ATV, fishing, kayaking,
   farm-to-table) — the revenue engine on top of the working farm.
   One line: *"An AI that runs a whole self-sufficient farm company — and keeps it
   alive through a blackout."*

## Links & logistics — [one TODO left before submitting]
- **Repository:** https://github.com/kimbrolly-a11y/Farm-OS (public ✅, branch `master`)
- **Live demo URL:** https://farmos-ochre.vercel.app (auto-deploys on every push;
  browse everything — run the interactive crisis/outage demo locally, see README)
- **Pitch deck (9 slides, photo-backed):**
  https://claude.ai/code/artifact/5954e1de-b9aa-4905-8c91-2e80304343ca
  (share it from the artifact page, or Print → Save as PDF to attach)
- **Demo video (2–3 min):** [TODO: screen-record the demo script above — see
  VIDEO-SCRIPT.md]
- **Team / builder:** FarmOS Labs
- **Category / theme:** One Person Company through Agentic Services
- **Sponsors used:** Claude (agent brain), AWS (production architecture)

## Screenshots to capture for the submission
Welcome screen · vertical gallery · dashboard with **Autopilot banner** · the
Activity Log mid-crisis (shed vs protected) · the Loops page · the Manage P&L.
