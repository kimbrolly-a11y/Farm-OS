# FarmOS — Photoreal Image Kit (fal.ai)

Generate photoreal "smart-farm + holographic HUD" imagery for the deck and app.

## 1. Add your key
Get a key at **fal.ai → dashboard → keys**, then add to `.env.local` (project root):
```
FAL_KEY=your-fal-key-here
```
- `.env.local` is gitignored. I use the key **only** to call fal.ai — never print or commit it.
- Cost: a few cents per image (billed to your fal account).
- After adding it, tell me **"go"** and I run the generation.

## 2. What I'll run
A script that calls fal.ai (FLUX — `fal-ai/flux/dev` for quality, or `flux/schnell`
for speed), 16:9, downloads each result to `public/img/`, then:
- **Base64-embeds the hero into the deck** (keeps the artifact self-contained).
- **Wires images into the app** (welcome hero + relevant pages) as bundled assets
  (`/img/*.png` — offline-safe). *App wiring waits until Fable finishes editing to
  avoid collisions; the deck can update immediately.*

## 3. The prompts (photoreal, matched to the farm)

**hero.png** — deck title + app welcome hero
> Cinematic golden-hour aerial photo of a diversified tropical eco-farm in
> Malaysia — rows of green crops, an oil-palm plantation, fish ponds, greenhouses,
> grazing cattle, a small barn, solar panels along the field edges, sunrise with
> warm golden light and soft mist. Floating above the fields: subtle glowing
> holographic data overlays — translucent circular gauges, sensor icons, thin
> connecting lines, cyan-green HUD. Photorealistic, ultra-detailed, hopeful,
> shallow depth of field. 16:9.

**aquaculture.png** — aquaculture / dashboard
> Cinematic golden-hour photo of a smart aquaculture farm — fish ponds with tilapia,
> drones overhead, a control dashboard screen on a jetty, subtle holographic sensor
> icons over the water, warm misty light, photorealistic. 16:9.

**automation.png** — "How it works" / automation
> Close-up of a healthy crop plant with a translucent holographic control panel
> showing gauges and plant-science data (CO₂, H₂O, O₂), a yellow robotic arm
> tending it, warm sunlight, photorealistic, shallow depth of field. 16:9.

**robot.png** — autonomous equipment
> A sleek autonomous field robot driving between rows of leafy greens on a farm at
> soft morning light, photorealistic, shallow depth of field. 16:9.

**animals.png** — eco-tourism / livestock (optional)
> Golden-hour photo of an eco-tourism farm — dairy cows and goats grazing under oil
> palms, a duck pond, guests on a trail, subtle glowing holographic sensor icons,
> photorealistic. 16:9.

## 4. Alternative (no key sharing)
Generate them yourself in the fal.ai playground (or Bing Image Creator / Ideogram),
download, drop into `public/img/`, and tell me — I'll base64-embed + wire them.

## 5. Where they get used
- **Deck:** all 7 slide photos embedded as base64 (self-contained artifact) — DONE.
- **App:** 18 vertical photos in `public/img/verticals/<id>.jpg` — ready to wire.

---

## GENERATED ✅ (2026-07-12) — 25 images, all in `public/img/`

### Deck — `public/img/deck/` (also embedded in the live deck)
`hero · problem · solution · demo · architecture · impact · closing` (.jpg)

### Verticals — `public/img/verticals/<id>.jpg`
One photoreal, HUD-accented 16:9 shot per vertical, filename = vertical id:
```
poultry  aquaponics  hydroponics  fruit_orchard  lodging  restaurant
petting_zoo  palm_oil  recycling  beekeeping  food_processing
dairy_cattle  dairy_goats  sheep  ducks  rabbits  horses  aquaculture
```
> If any vertical **id** differs from the filename above, rename the file to match
> the id (the wiring below keys off `vertical.id`).

### Drop-in wiring (for the vertical cards / detail header)
Photos are bundled in `/public`, so they're offline-safe. Add a photo layer behind
the existing `VerticalArt` emblem — e.g. in the gallery card and the detail header:
```tsx
// helper
const heroFor = (id: string) => `/img/verticals/${id}.jpg`;

// card / detail header (photo + scrim + existing emblem on top)
<div className="relative h-36 overflow-hidden rounded-t-2xl">
  <img src={heroFor(v.id)} alt="" aria-hidden
       className="absolute inset-0 h-full w-full object-cover" />
  <div className="absolute inset-0"
       style={{background:"linear-gradient(180deg,rgba(10,14,13,.15),rgba(10,14,13,.85))"}} />
  {/* keep VerticalArt / KPI overlaid with relative z-10 */}
</div>
```
Add `onError={(e)=>{e.currentTarget.style.display='none'}}` if you want a graceful
fall-back to the SVG emblem when an image is missing.

---

## LIVE CAMERAS ✅ (2026-07-12) — `public/img/cameras/<id>.jpg` (20, 4:3)

CCTV/monitoring-feed look with subtle green AI detection boxes — for a "Live Cameras"
wall on the command center / a `/cameras` page / vertical detail views.
```
cattle  goats  sheep  horses  poultry  ducks  rabbits  petting_zoo   (animals)
hydroponics  aquaponics  orchard  palm_oil                           (crops)
fishpond  fish_underwater  prawn                                      (fish farm)
beehives  lodging  restaurant  processing  recycling                 (other)
```

### Drop-in "Live Cameras" grid
```tsx
const CAMS = [
  ["cattle","Dairy barn"],["poultry","Poultry coop"],["horses","Stables"],
  ["fishpond","Fish ponds"],["fish_underwater","Underwater · tilapia"],["prawn","Prawn pond"],
  ["hydroponics","Hydroponics"],["orchard","Orchard"],["beehives","Apiary"],
  ["ducks","Duck pond"],["goats","Goats"],["petting_zoo","Petting zoo"],
];
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
  {CAMS.map(([id,label]) => (
    <div key={id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border)]">
      <img src={`/img/cameras/${id}.jpg`} alt={label}
           className="absolute inset-0 h-full w-full object-cover" />
      {/* live chrome */}
      <span className="absolute top-2 left-2 flex items-center gap-1.5 rounded bg-black/55 px-2 py-0.5 text-[11px] font-mono text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
      </span>
      <span className="absolute bottom-2 left-2 rounded bg-black/55 px-2 py-0.5 text-[11px] font-mono text-white">{label}</span>
    </div>
  ))}
</div>
```
Pick any subset per page (e.g. show only the vertical's own cam on its detail view:
`/img/cameras/<id>.jpg`).

---

## STAYS ✅ (2026-07-12) — `public/img/stays/<name>.jpg` (9)

Hospitality imagery for the Lodging & Resort vertical, guest app, attractions/booking.
```
hotel_exterior   hotel_room        hotel_pool         (hotel · 60 rooms)
glamping_dome    glamping_tent     glamping_interior  (glamping)
cabin_exterior   cabin_interior    cabin_cluster      (farm cabins / bungalows)
```
Suggested use: a "Where to stay" gallery on `/guest` or the `lodging` detail — three
cards (Hotel / Glamping / Cabins) each leading with its exterior shot, interior on
hover or in a lightbox. Same offline-safe `<img src="/img/stays/<name>.jpg">` pattern.
