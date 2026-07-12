# FarmOS — 2-Minute Demo Video Script (voiceover + click cues)

> One-take screen recording. Left column = what to CLICK/show. Right = what to SAY.
> Total ≈ 2:00. Speak calmly and confidently; let the crisis demo breathe.
> Tip: engage Autopilot and pre-load the tabs before recording; do a dry run once.

| Time | On screen (do this) | Voiceover (say this) |
|---|---|---|
| **0:00–0:12** | Welcome screen (`/`) | "This is FarmOS — an operating system for a *one-person* farm company. A 100-acre, off-grid, self-sustaining eco-tourism farm in Malaysia… run almost entirely by AI." |
| **0:12–0:30** | Click **Explore the farm** → `/verticals` gallery; scroll | "Eighteen living verticals — dairy, poultry, aquaculture, palm oil, orchards, bees, food processing, even the eco-resort — all one real-time digital twin. Normally this needs a whole operations team." |
| **0:30–0:45** | `/dashboard`; point to Energy + Battery Outlook | "Instead, a Claude agent runs it. It sees the farm live — energy, water, every sensor — and it *predicts*: right now it can see the battery won't last the night." |
| **0:45–1:10** | Toggle **🛰 Autopilot ON** (banner appears) → **Controls → ⚡ Crisis** → **do nothing** → open **Activity Log** (`/activity`) | "So I hand it the keys — Autopilot. Now a crisis: a cloudy day, the battery drops to 22%. I'm not touching anything. Watch. On its own, every thirty seconds, the AI sheds the pool pumps, the decorative lights, the processing line — while *protecting the animals'* feed, water, and ventilation. And it explains every single decision." |
| **1:10–1:25** | **Controls → 🌩 Outage** → show OFFLINE banner + queued syncs | "Then the worst case for an off-grid farm — the grid *and* the internet go down. FarmOS keeps running: cached rules, life-support protected, external syncs queued until it reconnects. It never stops." |
| **1:25–1:45** | `/loops` — the circular map + products | "And nothing is wasted. Palm waste becomes charcoal and biogas, manure feeds insects that feed the fish, fish water irrigates the crops — a ninety-two-percent circular loop, with ten products sold from what used to be waste." |
| **1:45–1:57** | `/manage` — the live P&L | "It's not just monitoring — it's a business. Live profit and loss across every vertical, updating in real time." |
| **1:57–2:05** | Back to dashboard / logo | "One person, one AI, running a whole self-sufficient company — and keeping it alive through a blackout. That's FarmOS: agentic services, powered by Claude, built for AWS." |

---

## 30-second elevator cut (if you also need a short one)
"FarmOS is an operating system for a one-person farm company — a 100-acre
off-grid eco-farm run by a Claude agent. Watch: I turn on Autopilot, trigger a
low-battery crisis, and do nothing — the AI sheds non-essential power while
protecting the animals, explaining every decision, thirty seconds at a time. Cut
the internet and it keeps running offline. It's circular and self-sufficient —
waste becomes energy and feed — and it's a live business with real P&L. One
person, one AI, a whole company. Powered by Claude, built for AWS."

## Recording checklist
- Engage a fresh state first (**Reset** on Controls), then start recording.
- Have `.env.local` `ANTHROPIC_API_KEY` set so the agent runs on real Claude.
- Record at 1280×800+; keep the browser at ~100% zoom so text is crisp.
- If the crisis run is slow on camera, you can also click **Run agent now** once
  to force an immediate decision for the recording.
- End on the Autopilot banner or the welcome logo.
