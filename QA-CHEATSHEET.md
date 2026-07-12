# FarmOS — Judge Q&A Cheat Sheet

> One-page answers. Keep each reply to 2–3 sentences live. Lead with the point,
> then the proof. Numbers below are directional (industry sources / our model).

## Key numbers to have ready
- **18 verticals · 80+ assets · 85+ sensors** on one live twin.
- Agent acts **every 30s**, autonomously, with a logged reason per action.
- **~92% circularity**; **10** products made from waste.
- Industry: **20–35%** input-cost reduction from AI/precision ag; up to **~90%**
  agritourism labor reduction; **~30%** water saving from autonomous irrigation;
  **35%** aquaculture efficiency gain; dairy: **5–10%** more milk, **12–25%** less
  feed waste, **40–50%** less antibiotics.
- Off-grid: predictive load-shedding cuts energy deficit **~53%** vs. reactive.

## The questions

**Is it real or simulated?**
Simulated for the demo, but built to be real. Every device carries its actual
`ha_entity` and protocol; flip one config flag (`simulated: false`) and the same
code drives a real farm through Home Assistant / AWS IoT. The logic is real; only
the sensor feed is mocked.

**How does Claude actually make decisions — isn't it just a chatbot?**
It's an agent, not a chatbot. Claude uses real tool-use (12+ tools) with adaptive
thinking; it reads the twin + forecast, forward-simulates the battery, then calls
tools to act. Every action requires a `reasoning` argument, so each decision is
explainable and audited in the Activity Log.

**What if the AI makes a wrong or dangerous call?**
Two guardrails. (1) A hard **safety invariant** — it can never shed life-support
(animals' feed/water/ventilation, incubators, cold chain), enforced in code.
(2) A **human-in-the-loop** boundary — treatment, culling, spending, and guest
messaging are *proposed* by the AI but require human approval. It automates the
safe, reversible work and escalates the rest.

**Why does it need to be a "One Person Company"?**
The AI replaces the entire ops/monitoring/planning layer that would otherwise be
a team. A human sets intent and approves sensitive calls; the agent runs
everything else continuously — literally a company run by agentic services.

**What happens when the internet or grid goes down?**
It keeps running. FarmOS falls back to cached rules + last forecast, protects
life-support, and queues external syncs that flush on reconnect. For an off-grid
farm that's not a nice-to-have — it's survival. (We demo it live.)

**How is this different from existing farm software?**
Enterprise ag is crop-only and expensive; all-in-one apps are record-keeping with
no real-time IoT or AI; IoT platforms give control but no management logic.
FarmOS is the only one that's real-time **and** autonomous **and** unified across
a diversified farm **and** offline-resilient. It solves the documented #1 pain:
fragmentation — one twin, one brain.

**What's the business model / revenue?**
The farm itself is the business: dairy, eggs, meat, fish, produce, palm oil,
processed goods, lodging, dining, events, tours — plus new revenue from waste
(charcoal, biochar, compost, fertilizer, biogas, carbon credits). Live P&L per
vertical. As a product, FarmOS is SaaS per farm (config-driven, multi-tenant).

**How does it scale / replicate?**
It's config-driven — one YAML file defines a farm. A second config is a second
farm; the same agent + engine run any number. That's the multi-farm / platform path.

**Why now?**
Agentic AI (Claude tool-use) is finally reliable enough to *act*, not just advise;
edge IoT + on-site compute make offline autonomy real; and diversified/off-grid
farms are underserved. The pieces just came together.

**What's your moat?**
The unified twin + the autonomous, explainable, fail-safe agent layer over open
farm-IoT. Anyone can wire sensors; the value is one brain that reasons across ten
domains and is safe enough to run unattended.

**How did you use the sponsors (Claude / AWS)?**
Claude *is* the product's brain (Anthropic SDK tool-runner, Opus 4.8 / Fable 5).
AWS is the production architecture — IoT Core (sensors) + Lambda (agent tools) +
Bedrock (Claude) + an on-site Raspberry Pi for local-first resilience; deployable
on Amplify/Lambda.

**What would you build next?**
Real hardware binding (code path exists), computer-vision livestock/crop health,
the eco-tourism guest app, carbon-credit/ESG reporting, and multi-farm replication.

## If you get stuck / a demo glitch
- Fall back to the video, or re-run **Controls → Run agent now** to force a fresh
  decision. The **Reset** button restores a clean state instantly.
- Pivot line: *"Even that hiccup proves the point — it's designed to fail safe and
  keep the essentials running."*
