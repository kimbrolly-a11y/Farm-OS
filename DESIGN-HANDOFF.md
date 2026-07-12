# FarmOS — Design Handoff (app visuals + pitch deck)

> **Goal:** raise the visual quality of (A) the FarmOS app and (B) the pitch
> deck, without changing behavior. This is a **design pass**, not a feature
> build. Paste this into a fresh Claude Code session dedicated to design.

> **Paste as the first message:**
> Read `DESIGN-HANDOFF.md`, then `ASSETS.md` and `app/globals.css`. Do a visual
> design pass on the FarmOS app and the pitch deck per this brief. Keep all
> behavior and the crisis/resilience demo intact, keep everything offline-safe
> (no external fonts/CDNs — inline as data URIs), and follow the existing design
> tokens. Work in small commits.

---

## 0. COORDINATION — read first (avoid collisions)

Another session ("Fable") has been building **features** in this same repo. **Do
NOT run a design pass while Fable is still editing code** — two agents on one
working tree clobber each other. Before starting:
- Confirm the tree is **clean**: `git status` shows nothing uncommitted.
  (Fable finished + committed on 2026-07-12 — the tree was left clean; the repo
  is on GitHub (kimbrolly-a11y/farmos) and **pushes auto-deploy to Vercel
  production** at https://farmos-ochre.vercel.app, so only push when green.)
- If Fable is still active, either **wait** until it finishes and commits, or work
  in an **isolated git worktree**: `git worktree add ../farmos-design -b design`.
- Run `npm run build` first to confirm GREEN, and `npm run dev` to see the app at
  http://localhost:3000.
- **Never break** the welcome→gallery→dashboard flow, the Autopilot+Crisis+Outage
  demo, or the Manage/Loops/Sustainability/Brief pages. Re-verify after each commit.

## 1. What we're designing

FarmOS: an autonomous operating-system for a one-person, off-grid, self-sufficient
eco-tourism farm, run by a Claude agent. **Audience:** hackathon judges + eventual
users. **Feel:** a serious "operating system / mission-control" for a farm —
dark, precise, alive, credible. Not cute, not generic-SaaS.

## 2. Existing design system (UPDATED 2026-07-12 — owner changed direction)

**THE OWNER WANTS BRIGHT, NOT DARK.** Direction (owner's words): "brighter, no
dark background, bright greenery feels and white" — a sunlit farm, eco-tourism,
greens, agriculture, animals. A quick light-theme pass has already been applied
in `app/globals.css`:
```
--bg:#f2f8f3  --panel:#ffffff  --panel-2:#ecf5ee  --border:#d4e6d9
--text:#132a1c  --muted:#59806a
--accent:#17a45c (green)  --warn:#d97706 (amber)  --danger:#dc2626 (red)
--earth:#a07d2c  --water:#2b7fd9  --leaf-dim:#cfe8d6
```
- **YOUR #1 JOB IS THE CONTRAST AUDIT.** The app was designed dark and flipped
  light quickly — the owner reports poor contrast. Sweep every page: status
  chips/badges built with `color-mix(... 15%, transparent)` are too faint on
  white; charts, the /twin SVG flow diagram, gauge rings, sparkline fills, the
  guest-app overlays, and the dark-gradient `VerticalArt` tiles all need
  light-theme treatment. Target WCAG AA for text and meaningful UI.
- Photoreal AI imagery now exists and is wired: welcome hero
  (`/img/deck/hero.jpg`), per-vertical shots (`/img/verticals/*.jpg`), CCTV
  cams (`/img/cameras/*.jpg` via `components/LiveCam.tsx`). Lean into them.
- Semantic colors (accent/warn/danger) encode status (ok/warning/critical) — keep
  them separate from decorative use.
- Current font: system sans only (`ui-sans-serif, system-ui, …`). **This is the
  biggest upgrade opportunity** — see §4.
- Stack: **Next.js 15 App Router + Tailwind v4 (@import "tailwindcss") + Recharts**.
  Tokens are used as `bg-[--panel]`, `text-[--muted]`, `border-[--border]`, etc.

## 3. Brand assets (already built — reuse, don't recreate)

In `public/` (see `ASSETS.md`): `farmos-mark.svg` (favicon), `farmos-logo.svg`
(wordmark), `welcome-hero.svg` (landscape hero, wired into the welcome screen),
`og-image.svg`. Per-vertical identity lives in `lib/verticalVisuals.ts` (colour +
gradient + tagline per vertical) and `components/VerticalArt.tsx` (an inline-SVG
emblem per vertical: cow, goat, sheep, duck, rabbit, horseshoe, fish, palm, etc.).

## 4. App design targets (prioritized)

1. **Typography (highest impact).** Pair two real typefaces, inlined as
   `@font-face` **data URIs** in `globals.css` (CSP/offline-safe — no Google Fonts
   link). Suggest: a precise grotesque/技術 display face for headings + numerals
   and a clean readable body; a **monospace** for labels/metrics/terminal cues
   (fits the "OS" concept). Set a type scale and apply consistently. Subset the
   fonts (latin, needed weights) to keep data-URI size sane.
2. **Component primitives.** Unify the ad-hoc card/badge/pill/table styles into a
   small consistent set (Card, StatTile, Pill/Chip, Table, SectionHeader). Right
   now each page re-implements them slightly differently — normalize spacing,
   radius, border, padding rhythm.
3. **Data viz polish.** Give every Recharts chart the same treatment: subtle area
   fills, a faint grid, an emphasized endpoint dot, `tabular-nums` on all aligned
   numbers, consistent tooltip styling. Refine the battery SoC ring, the solar
   sparkline, the P&L bars, the predictive outlook. (See the `dataviz` skill.)
4. **Navigation.** The dashboard top nav has grown long (Verticals, Manage, Tasks,
   Activity, Inventory, Loops, Water, Automations, Sustainability, Attractions,
   Guest, Brief, Controls…). Redesign into a coherent **top bar + grouped menus**
   or a slim **left sidebar** so it scans cleanly.
5. **Per-vertical art (optional, high polish).** Upgrade the flat emblems in
   `VerticalArt.tsx` into richer illustrated **scenes** as card/detail headers
   (a coop, a pond, palm rows) — same offline-SVG style, one visual system.
6. **Welcome + hero.** Refine the hero composition and the concept strip;
   make the first screen feel like a product landing, not a stat dump.
7. **Micro-states & motion.** Consistent empty/loading states; tasteful,
   purposeful motion only (respect `prefers-reduced-motion`); interactive things
   must look interactive (hover/focus states, visible keyboard focus).
8. **Responsiveness.** Verify it holds on a laptop *and* a phone (the founder's
   field device) — nav, cards, charts, tables should all reflow.

## 5. Pitch deck design (B)

- **Where:** an existing self-contained HTML deck (8 slides, keyboard/click nav,
  same dark tokens). Source is a standalone `.html` file; it's published as an
  Artifact. Content outline is in `PITCH-DECK.md`. Team: **FarmOS Labs**.
- **Upgrade targets:** the same real typography as the app; stronger title
  slide (hero + logo); make the **comparison matrix** (slide 3) and the
  **Claude→AWS architecture flow** (slide 6) proper designed graphics rather than
  text rows; refine slide transitions (subtle); add a "Live tour" appendix slide
  (tab order + rapid-fire stats). Keep it **self-contained** (inline all CSS/JS,
  embed SVG/fonts as data URIs — Artifact CSP blocks external hosts).

## 6. Guardrails

- **Offline-safe always** — no webfont links, no CDN, no remote images. Inline
  everything (fonts + art as data URIs / inline SVG). This protects the resilience
  demo and the deck's CSP.
- **Follow the tokens** (`globals.css`); extend via new CSS vars, don't hardcode.
- **Don't change behavior or data** — visual/CSS/markup only. Keep the crisis
  invariant (life-support never shed) and both demo scenarios working.
- **Commit small**, `npm run build` (typecheck) before each commit, re-verify the
  demo flow.
- Tailwind v4 + App Router: global styles in `app/globals.css`; components use the
  `bg-[--token]` utility syntax already in the codebase.

## 7. Reference
`ASSETS.md` (brand kit) · `PITCH-DECK.md` (deck content) · `SUBMISSION.md` (voice
+ claims) · `HANDOFF.md` / `FARMOS-MASTER-SPEC.md` (product context) · the
`dataviz` and `artifact-design` skills for chart + page craft.
