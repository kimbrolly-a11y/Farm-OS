# FarmOS — Pre-Submission Smoke Test

Run top-to-bottom before pushing the final build. Each row = **click → expect**.
Mark ✅/❌. Anything ❌ blocks submission until fixed. Dev: `npm run dev` → http://localhost:3000

---

## 0. Build & hygiene (do first)
- [ ] `npm run build` completes with **no type/lint errors**.
- [ ] `git status` shows `public/img/**` will be committed; `.env.local` is **NOT** listed (gitignored).
- [ ] `farm.config.yaml` traced into serverless bundles (`next.config.mjs` `outputFileTracingIncludes`).
- [ ] No console errors on first load (check browser devtools).

## 1. Welcome / home  `/`
- [ ] Hero renders with a **farm photo background** (`/img/deck/hero.jpg`) + legible text over a scrim.
- [ ] Brand reads **FarmOS · Crown Eagles Eco Farm**; primary CTA → `/dashboard`, secondary → `/verticals`.
- [ ] Vertical teaser shows photos (not blank/emblem-only).

## 2. The farm gallery  `/verticals`
- [ ] Header: "**18 operating verticals**".
- [ ] **18 cards**, each a **LIVE camera**: photo + red pulsing `LIVE`, `CAM 01 · <name>`, ticking timestamp, `● REC · HA: camera.<id>`.
- [ ] Every card shows a real photo (no broken images) — animals, crops, **and fish/aquaculture**.
- [ ] Click any card → routes to its detail page.

## 3. Vertical detail  `/vertical/poultry` (then spot-check `dairy_cattle`, `aquaculture`, `lodging`)
- [ ] Large **live camera** at top with CCTV chrome + correct photo.
- [ ] **AI insights** panel (e.g. CV health score /100, risk labels).
- [ ] **Sensors** list updates over time (values tick).
- [ ] **Actuators** list with criticality tags: `life support` / `important` / `discretionary`.
- [ ] `lodging` detail (or `/guest`) shows the **Where-to-stay** gallery (Hotel · Glamping · Cabins) with `/img/stays/*` photos.

## 4. Command center  `/dashboard`
- [ ] **Energy** gauge (battery SoC + solar) renders and updates.
- [ ] **Water** tanks + well status render.
- [ ] **One card per vertical** with status + a KPI (ideally now with the vertical photo).
- [ ] **Alerts strip** present.
- [ ] Nav links to all sections work.

## 5. Agent activity log  `/activity`
- [ ] Reverse-chronological `AgentAction` feed: **trigger → decision → reasoning → result**.
- [ ] New entries appear after running the agent (see §7).

## 6. Autonomy / autopilot / other panels
- [ ] `/automations`, `/loops`, `/inventory`, `/water`, `/tasks`, `/manage`, `/sustainability`, `/brief`, `/console`, `/attractions`, `/twin` — each loads with **no error** and shows live data.
- [ ] `/brief` shows a Morning Brief; `/sustainability` shows ESG / circularity figures.

## 7. Controls + the two demo scenarios  `/controls`  ⭐ (these ARE the submission)
**Run agent**
- [ ] "**Run agent now**" → produces real tool calls, logged with reasoning in `/activity`.

**Crisis — "cloudy day, battery low"**
- [ ] Arm crisis (battery ≈ 22%, forecast cloudy) → run agent.
- [ ] Agent **sheds discretionary loads** (pool pump, EV charger, decorative lights).
- [ ] Agent **explicitly protects every life-support / never-shed load** (incubator, aquaponics aerator, cold storage, animal ventilation, potable water) — **none shed**.
- [ ] Each decision is logged with a one/two-sentence reason.

**Resilience — "grid + internet outage"**
- [ ] Flip offline → **"OFFLINE — running autonomously"** banner appears.
- [ ] App keeps working; agent falls back to rules/cache; life-support stays on; external syncs/alerts **queue**.
- [ ] Flip back online → queue **flushes**; banner clears.

## 8. Imagery sweep (all newly generated)
- [ ] `/img/verticals/<id>.jpg` — all 18 present, refreshed quality.
- [ ] `/img/stays/*` — wired into guest/lodging.
- [ ] `/img/deck/hero.jpg` — on Welcome hero.
- [ ] No broken-image icons anywhere; a hard refresh (Ctrl+F5) shows the latest.

## 9. Deploy & submission
- [ ] Commit all (incl. images); push.
- [ ] Redeploy; open the **live URL** — confirm new visuals + the two scenarios work in prod.
- [ ] `README.md`: OPC framing + AWS architecture + live URL + GitHub link present.
- [ ] `SUBMISSION.md` reconciled — team **FarmOS Labs**; note what still needs the founder (demo video, form fields).

---

### Fastest demo path (for the video)
`/` → **The farm** (`/verticals` camera wall) → tap **Dairy Cattle** (cam + AI insights) →
`/dashboard` (energy/water/verticals) → `/controls`: **Run agent** → **Arm crisis** (watch it shed & protect) →
**Go offline** (banner + still alive) → **back online** (queue flush) → `/activity` ("what my company did while I slept").
