# FarmOS — Pitch Deck Outline (8 slides)

> Build in Google Slides / Canva / Pitch. Dark theme, accent green (#37d67a).
> Use the brand assets in `public/` (logo, hero, og-image). Keep ≤6 words per
> bullet — the speaker notes carry the detail. Total talk time ≈ 3 min + demo.

---

### Slide 1 — Title
- **FarmOS** (logo/wordmark, welcome-hero.svg as background)
- *The autonomous operating system for a one-person farm company.*
- Your name / team · BUIDL_OPC_Hackathon_SG · Claude + AWS
- **Say:** "What if one person — plus an AI — could run an entire 100-acre farm company?"

### Slide 2 — The Problem
- Diversified farm = a whole ops team
- Farm software is **fragmented** (no single history)
- Data entered hours late → missed decisions
- Off-grid farms **fail** when power/internet drops
- **Say:** "A real farm has eighteen businesses in one — livestock, crops, aquaculture, lodging, processing. Today you either hire a team or juggle eighteen disconnected apps. And if the grid goes down, everything stops."

### Slide 3 — The Gap (why now / why us)
- A small comparison matrix: **Enterprise ag / All-in-one / IoT stacks / FarmOS**
- Rows: real-time twin · autonomous agent · off-grid · offline · diversified · P&L
- Only **FarmOS** ticks every box
- **Say:** "Enterprise tools do crops. All-in-one apps do record-keeping. IoT platforms do control. Nobody gives a diversified farm one real-time brain that *decides and acts*. That's the gap."

### Slide 4 — The Solution
- One **Claude agent** = the whole operations team
- Live **digital twin**: 18 verticals, 80+ assets, one source of truth
- **Sense → Predict → Act**, every decision explained
- **Fails safe**: keeps running offline
- **Say:** "FarmOS is an AI operating system. It senses the farm through a live digital twin, predicts problems before they happen, and acts — and it never stops, even offline."

### Slide 5 — LIVE DEMO (the heart)
- Just a big "DEMO" slide — switch to the app
- Flow: Autopilot ON → Crisis → *do nothing* → Activity Log → Outage → Loops → P&L
- **Say:** (run VIDEO-SCRIPT.md live) "I'll turn on Autopilot and trigger a crisis — then not touch anything. Watch it protect the animals while shedding non-essentials, explaining every move."

### Slide 6 — How it works (Claude + AWS)
- Diagram: `sensors → MQTT → AWS IoT Core → Lambda (tools) → Bedrock (Claude) → actions`
- On-site **Raspberry Pi** = local-first resilience
- Claude = agent brain (tool-use, adaptive thinking, explainable)
- Flip `simulated:false` → real hardware, same code
- **Say:** "Claude is the brain — real tool-use, not a chatbot. It's architected for AWS: IoT Core for sensors, Lambda for tools, Bedrock for Claude, with an on-site Pi so the farm survives outages."

### Slide 7 — Impact & Business
- **One person + AI** runs a diversified farm company
- ~20–35% input-cost cut · up to ~90% agritourism labor saved (industry)
- **92% circular** — waste → charcoal, biogas, feed, carbon credits
- Live **RM P&L** across every vertical; self-sustaining, off-grid
- **Say:** "This isn't a dashboard — it's a profitable, self-sufficient company that wastes nothing and needs almost no staff."

### Slide 8 — What's next & the ask
- Real hardware binding (HA/AWS IoT) · CV livestock/crop health
- Guest eco-tourism app · carbon-credit/ESG · multi-farm replication
- **Ask:** pilot farm / investment / partners
- **Say:** "The code path to real hardware already exists. We're looking for a pilot site and partners to take this from demo to a living farm. FarmOS: one person, one AI, a whole company — alive through any blackout."

---

## Design notes
- Background: `public/welcome-hero.svg` on the title + closing slides.
- Accent everything with #37d67a; keep text `#e7f0ec` on `#0a0e0d`.
- One idea per slide; let the **live demo** be 40% of your time.
- If it's video-only judging, screen-record the demo and narrate over slides 1–4 + 6–8.
