# FarmOS Pitch Deck — Design Brief (for a Claude design pass)

Hand this to a fresh Claude session to elevate the deck's visual design.

## What this is
A self-contained HTML pitch deck (10 slides), published as a Claude artifact:
**https://claude.ai/code/artifact/5954e1de-b9aa-4905-8c91-2e80304343ca**

To improve it: **WebFetch that URL** to get the current HTML, redesign it, then
**republish to the SAME url** (Artifact tool, pass `url:` = the link above) so the
link never changes.

## Hard constraints (do not break)
- **Self-contained + offline-safe:** inline CSS/JS/SVG only. Slide photos are embedded
  as **base64 data-URIs** (strict CSP blocks all external hosts). Keep it one file.
- **Keep the same artifact URL** (pass `url`).
- **Nav must keep working:** ← → / space / click nav, progress bar, dots, counter,
  `prefers-reduced-motion` respected, visible keyboard focus.
- **Content stays truthful:** don't invent numbers. The two demo scenarios — crisis
  (sheds discretionary loads, protects every life-support load) and offline resilience
  — are the heart of the pitch; keep them accurate.
- **Brand:** product = **FarmOS**; farm = **Verdant Acres**; team = **FarmOS Labs**;
  live demo = **farmos-ochre.vercel.app**. (Do NOT rename to anything else.)

## Current design system — keep it BRIGHT (matches the live app)
- Palette: `--bg #f2f8f3` · `--panel #ffffff` · text `#132a1c` · muted `#59806a` ·
  **essence/accent = bright green `#17a45c`** · secondary green `#0e7a43` ·
  water blue `#2b7fd9` · negative `#e0533a` · amber `#d97706` · border `#d4e6d9`.
- Type: Georgia serif display + system sans body + monospace labels.
- Photo slides: full-bleed AI farm photo under a **light wash**, dark readable text.

## The 10 slides (in order)
1. **Title/hero** — "The farm that runs itself." FarmOS mark + tagline, live URL.
2. **Problem** — a diversified farm is eighteen businesses in one.
3. **Gap** — comparison table (FarmOS vs enterprise ag / apps / IoT) over the twin map.
4. **The verticals** — 18 colour-coded tiles.
5. **Live demo** — crisis → shed & protect → outage → keeps running; live URL.
6. **How it works** — Sensors → AWS IoT → Lambda → Bedrock/Claude → actions; Pi local-first.
7. **Impact & business** — 1+AI runs 18 verticals, 92% circular, live P&L, cost/labour cuts.
8. **The experience** — eco-tourism (weddings, glamping, pool, riding, ATV, fishing…).
9. **What's next / the ask** — pilot site, partners, investment; closer line.

## Goals for the design pass
- Elevate typography and hierarchy; make the **hero land harder**.
- Use the photos better — they can read washed-out; balance legibility vs vibrance
  (e.g. a cleaner scrim, or photo on one side with solid panel on the other).
- Tighten the **comparison table** and the **verticals grid** (alignment, rhythm).
- Consistent spacing scale; polish the chrome (mark, counter, dots, progress bar).
- **One** tasteful motion moment (page-load or slide-in) — restrained, not busy.
- Stay bright/daylight with the bright-green essence. No dark theme.

## Assets (if working inside the repo)
`public/img/deck/*.jpg` (slide photos) + `verticals/ attractions/ stays/ map/` —
all offline-safe JPGs. See `IMAGES.md`. (When fetching the artifact you already get
the embedded images; the repo copies are only needed to swap in different shots.)

---

### Paste-ready prompt for the design session
> Use the artifact-design skill. WebFetch
> https://claude.ai/code/artifact/5954e1de-b9aa-4905-8c91-2e80304343ca to get the
> current FarmOS pitch deck HTML, then do a design pass following DECK-DESIGN-BRIEF.md
> in this repo: keep it bright (app daylight theme, bright-green #17a45c essence),
> self-contained/offline-safe (inline everything, base64 images), keep the nav +
> content accurate, and republish to the SAME artifact URL (pass `url`). Elevate the
> hero, typography, photo treatment, comparison table and verticals grid; add one
> restrained motion moment.
