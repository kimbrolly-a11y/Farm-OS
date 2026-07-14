# FarmOS · Crown Eagles Eco Farm — Comprehensive Master Spec & Build Prompt

> **Purpose.** This is the complete, self-contained specification for FarmOS: a
> 100-acre, off-grid, fully-circular, low-manpower eco-tourism farm resort in
> Malaysia, run by an autonomous Claude (Fable 5) agent. It is written as the
> **master prompt** for a Claude Code session to build against. Deliverable mode
> is **(c): the FarmOS app is the real farm's control plane** — everything is
> simulated now and flips to real hardware via `integration.simulated: false`
> and the `ha_entity` bindings (Home Assistant hub on-site).
>
> **How to use:** read this, then `HANDOFF.md` (current app state) and
> `CLAUDE.md`. Build in the phase order in §13. The existing app already has the
> engine (twin, agent, autopilot, scenarios, P&L, predictive, inventory,
> automations, tasks, visuals) — you are EXPANDING it to this spec, not starting
> over. Everything stays offline-safe. Commit per item.
>
> All figures below are **recommended defaults** (the owner asked me to suggest
> and proceed); tune later. Currency: **RM** (Singapore sales in **SGD**).

---

## 1. Vision

A self-sustaining eco-tourism farm that **buys almost nothing from a
supermarket**, wastes nothing (every output feeds another process), runs
**off-grid** (own energy + water), hosts **150–300 guests**, and is operated by
an **AI agent** that reduces the farm to the smallest possible crew. Ten+
production verticals + full livestock + on-farm processing + a hospitality &
"funworld" attraction layer, all on one live digital twin with one autonomous
brain. Palm oil is the first cash flow; everything else layers on.

## 2. Land allocation (100 acres)

Owner's split + my suggestions for the remainder (percentages overlap because we
use **silvopasture** — animals graze *under* palm & orchard, so pasture is not
separate land; this is the Malaysian Integrated Cattle–Oil-Palm model):

| Use | Acres | Notes |
|---|---:|---|
| Palm oil | 20 | + silvopasture (cattle/sheep/goats graze beneath) |
| Aquaculture (ponds + lake + RAS) | 20 | tilapia, catfish, freshwater prawn; lake doubles as canoeing/fishing attraction |
| Fruit orchard | 20 | + silvopasture, + guest fruit-picking; durian/mango/banana/papaya/jackfruit/rambutan/citrus/guava/pineapple |
| Hydroponics + aquaponics greenhouses | 15 | leafy greens, tomato, chilli, herbs, strawberry |
| Beekeeping (apiaries in orchard/forest edge) | 5 | overlaps orchard; pollination + honey |
| Petting zoo | 1 | miniature/friendly animals for guests |
| **Lodging + hotel + events + waterpark + recreation + processing + energy/water plant + roads** | ~19 | see §8, §10; built environment concentrated to preserve green land |
| Bamboo grove + forest buffer (adventure + materials) | (within above/edges) | fast-growing, carbon sink, construction/craft/charcoal/fodder |

## 3. Livestock & production roster (suggested counts)

Sized for **food self-sufficiency + dairy + petting + revenue**. Muslim-majority
context → **no pigs**; waste-protein handled by Black Soldier Fly (BSF) + poultry
+ fish instead (halal-friendly, and better circularity).

| Vertical | Suggested stock | Purpose |
|---|---|---|
| Dairy cattle | 10–15 head (8–12 milkers, tropical/crossbred) | milk, cheese, yoghurt, ghee; calves → beef |
| Dairy goats | 25–35 (Saanen × Jamnapari) | goat milk/cheese/soap, petting, meat, brush control |
| Sheep | 25–35 (Dorper — hair sheep, tropical-hardy) | meat, silvopasture grazing under palm |
| Horses | 5 (given) | riding attraction, therapy, pony rides |
| Poultry — layers | 300–500 | eggs |
| Poultry — broilers | rolling batches ~500 | meat |
| Ducks | 150–250 (Khaki Campbell + Muscovy) | eggs, meat, pond integration, pest/snail control |
| Rabbits | 30–50 does + bucks | meat, petting, prime manure/fertilizer |
| Aquaculture | tilapia + catfish + freshwater prawn; 6–10 ponds + RAS tanks | protein, aquaponics nutrient source, fishing/prawning attraction |
| Bees | 40–60 hives | honey, pollination, wax → soap/candles |
| Petting-zoo mix | mini goats, rabbits, ducks, guinea pigs, ponies, tortoise, guinea fowl | guest experience |

Plants for self-sufficiency (§7): orchard fruit, hydro/aquaponic vegetables +
herbs, kitchen garden, **rice paddy** (optional 2–3 acres), tubers (cassava,
sweet potato, tapioca), corn/maize (food + fodder), banana/plantain, breadfruit,
coconut, sugarcane, mushrooms (on palm-fibre substrate), **fodder** (napier
grass, azolla, duckweed) to cut bought feed, **bamboo** (materials/craft/charcoal/fodder).

## 4. Food self-sufficiency — "never buy from the supermarket"

Produce on-farm: **protein** (eggs, chicken, duck, fish, prawn, goat/lamb/beef,
rabbit, dairy: milk/cheese/yoghurt/butter/ghee, honey); **vegetables** (hydro +
aquaponics + kitchen garden); **fruit** (orchard); **carbs** (rice, cassava,
sweet potato, corn, banana, breadfruit); **fats/oils** (palm oil, coconut);
**sweeteners** (honey, sugarcane/palm sugar); **mushrooms**; **herbs/spices/chilli**;
**animal feed** (fodder + BSF + azolla/duckweed, reducing bought feed by ~40–60%).

**Realistically still bought (flag to owner):** salt, wheat flour (substitute
cassava/breadfruit flour + rice), some grains, cooking essentials, medicines/vet
supplies. Everything else can be farm-produced. Target: **>90% food
self-sufficiency**.

## 5. Energy system (off-grid, must be able to run 100% renewable)

Solar-primary with layered backup; sized for a resort of 150–300 guests (a
60-room hotel + waterpark is a heavy load — size generously):

| Source | Recommendation |
|---|---|
| **Solar PV** | Scale from 30 kW → **200–300 kW** across hotel/bungalow/barn/processing roofs + ground array |
| **Battery** | **300–500 kWh** LiFePO4 (Victron/EG4 class) with Cerbo GX monitoring |
| **Biogas generator** | Anaerobic digester on **POME + manure + food waste** → baseload + backup electricity + cooking gas. **Strongly recommended** — you have huge feedstock |
| **Diesel genset** | Existing, last-resort backup only |
| **Wind** | Only if the site has real wind (Malaysian lowland is weak) — evaluate; treat as optional bonus |
| **Micro-hydro** | Only if the lake has usable flow/head — optional |

Design goal: **islandable / 100%-renewable-capable** (solar + battery + biogas
covers baseload; genset is emergency only). The agent's existing predictive
load-shedding + autopilot manage it. Solar water pumps, solar cold-chain.

## 6. Water system (off-grid) — natural, low-chlorine, drinkable

**Sources:** rainwater harvesting (hotel/bungalow roofs = large catchment) →
first-flush + poly tanks; **boreholes/wells** (solar pumps); lake/ponds
(non-potable uses); **greywater recycling**.

**Potable treatment — multi-barrier, minimal/no chlorine (recommended):**
1. Sediment / roughing pre-filter
2. **Biosand / slow-sand filter** (biological pathogen removal, no chemicals)
3. **Activated carbon** — made on-farm from **palm-kernel shell / bamboo biochar** (circular!)
4. **UV-C disinfection** (solar-powered) — primary germ kill, chemical-free
5. Optional: **ozone** polish, or a tiny residual chlorine only for stored-tank safety

**Greywater/blackwater:** **constructed wetlands / reed beds** (natural
polishing) → irrigation + pond top-up. **Pool / lazy river / waterpark:** use
**natural (plant-filtered) swimming-pond** tech + recirculation to minimize
chemicals and water draw.

**Shortage priority ladder (agent enforces, `never_shed`-style):**
potable (people) → animals (drinking) → food processing/kitchen → hydro/aquaponics
(recirculating, low draw) → orchard/palm irrigation (use pond+greywater; cut
mains first) → pool/waterpark top-up (recirculate; cut first).

## 7. Circular / zero-waste resource map (the moat)

Model every loop in the twin; the agent routes and optimizes across them. Target
near-zero discharge (9R: refuse→recover).

- **Palm:** FFB → mill → **CPO (sell, first income)**. **EFB + fibre → biochar/charcoal** (pyrolysis). **Kernel shell → activated carbon** (water filter) + **BBQ charcoal**. **POME → biogas** (energy) + **digestate → fertilizer**. Fronds → mulch / fodder / mushroom substrate.
- **Livestock manure →** (a) biogas digester, (b) compost, (c) **BSF larvae** (→ poultry/duck/fish feed) + **frass fertilizer**. Rabbit manure → premium plant fertilizer.
- **Kitchen / restaurant / crop waste → BSF + compost + mushroom substrate**; spent substrate → compost/feed.
- **Aquaculture nutrient water → crop irrigation / aquaponics** (fish → plants → clean water back to fish). **Fish/pond sludge → liquid fertilizer.**
- **Greywater → constructed wetland → irrigation.**
- **Bamboo →** construction, furniture/craft (sell), charcoal, fodder, erosion control.
- **Dairy byproduct (whey) →** animal feed / soap. **Beeswax →** soap/candles. **Biomass ash →** fertilizer / soap lye.
- **Biochar → soil amendment** (orchard/crops) + **carbon credits / ESG**.

**Waste-derived products to SELL (§11 revenue):** biochar, BBQ & activated
charcoal, compost + vermicompost, liquid organic/fish fertilizer, BSF protein
meal, bamboo crafts/furniture, mushrooms, handmade soap/candles, biogas/bottled
cooking gas, **carbon credits** (biochar + solar + biogas, MSPO/ESG-certified).

## 8. Eco-tourism "Crown Eagles" (attractions + guest app)

Owner's list **+ researched additions** to make it a standout funworld:

**Given:** farm tours, petting zoo, horse riding, fishing, prawning,
farm-to-table dining, ATV, archery, pellet shooting range, forest adventure,
lake canoeing, workshops, wedding/events venue, glamping, kids' farm camp, mini
waterpark slides, lazy river, swimming pool, BBQ.

**Add:** treetop canopy walk + **zip-line + high-ropes**; night safari / firefly
/ stargazing deck; **animal encounters** (milking, egg-collecting, feed-the-
animals, pony rides, **adopt-an-animal**); fruit & mushroom picking; **kids' farm
school + junior-farmer badge + mud kitchen**; **craft workshops** (cheese, soap,
charcoal, beekeeping, pottery, batik, bamboo); chef's-table + cooking classes;
kayak/SUP + **floating cabins**; buggy/tram farm tour; **sustainability discovery
center** (walk the circular loops — educational + ESG marketing); paintball /
laser tag; obstacle/mud run; outdoor cinema + bonfire; **wellness/spa** (goat-
milk products, yoga deck); **natural swimming pond**; seasonal events (harvest
festival, durian season, corporate retreats, **church camps**). Theme it as one
connected "Crown Eagles."

**Guest app (PWA):** booking (rooms / 40–60 bungalows / glamping / events),
**QR self-check-in**, activity scheduling + ticketing + **e-waivers** (rides/
ranges/waterpark), **cashless wallet (RM/SGD)**, interactive farm map, **live
animal cams**, adopt-an-animal + track, farm-to-table menu + produce shop,
**AI itinerary personalization**, AR tour guide, loyalty, feedback, workshop
signup, event RFQ.

## 9. Manpower & autonomy (honest sizing)

**The AI runs the FARM near-autonomously; hospitality & safety-critical
activities still need trained people** — a lifeguard, a riding guide, a range
marshal, a vet, and hotel housekeeping cannot be automated away.

| Function | Essential crew (automation-assisted) |
|---|---|
| Farm core (livestock husbandry, aquaculture, crops, processing, energy/water) | **6–10** (the self-sufficient core the AI can run lean) |
| Hospitality (60-room hotel + bungalows + F&B + events, at 150–300 guests) | **20–35** at full occupancy (housekeeping/F&B/front-desk/events) |
| Activities & safety (riding, ATV, archery, ranges, waterpark lifeguards, canoe, forest) | **6–12** (safety-critical, must be staffed) |
| Maintenance / renewables / water plant / grounds | **3–5** |
| Management (AI-supervised — the agent replaces most ops/monitoring/planning) | **2–3** |

**Reality:** the **farm** can run with ~6–10 thanks to automation; the **resort
at full scale** needs ~35–55 total. The AI's win is eliminating the ops/
monitoring/planning layer and most routine farm labor — you run far leaner than a
comparable resort, and can **phase up staff with occupancy**.

**Autonomy map:**
- **Fully autonomous (agent acts):** energy balancing + load-shedding, irrigation
  scheduling, barn/coop/greenhouse/stable climate + ventilation, auto-feeding
  schedules, aquaculture/aquaponics water-quality dosing + aeration, lighting,
  pumps, biogas/compost/BSF monitoring, water treatment control, predictive
  maintenance scheduling, inventory reorder **drafts**, sensor alerts, waste-loop
  routing, guest **self**-check-in + booking confirmations, energy/water balancing.
- **Human-in-the-loop (agent proposes, human approves):** **animal treatment /
  medication / vet**, **culling / slaughter**, **spending / purchases /
  investment**, **guest messaging & complaints**, breeding decisions, staff
  scheduling, pricing, and anything **safety-critical** (rides, ranges, waterpark).

## 10. Per-vertical automation stack (full stack for every vertical)

**In-app pattern (build each vertical as its own sub-system):** every vertical
gets its own dashboard/sub-app with — live **sensors**, **actuators/robots**, **AI
insights** (health/yield/risk from CV + models), **automations** (each with an
autonomy level), **production + inventory**, **P&L**, **tasks**, and **agent tools
scoped to it**. (This extends the existing `/vertical/[id]` + automations +
insights pattern already in the app.)

Per-vertical specifics to implement (sensors → actuators/robots → AI):
- **Dairy cattle / goats:** wearable collars/ear-tags (health, heat, rumination, location) → automated/robotic **milking**, TMR auto-feeders, barn fans/misters, milk cold-chain → CV body-condition + lameness + individual ID, milk-quality sensors, breeding calendar. *Human: treatment, breeding, milking oversight.*
- **Sheep:** collars, **virtual-fence rotational grazing** under palm, auto water + mineral, CV counting.
- **Poultry (layers/broilers) + ducks:** climate (fans/heat lamps), auto feed/water, **egg-belt + vision egg counter**, ammonia/CO₂ sensors, incubators, CV bird-health; ducks integrated with ponds (pest/snail control).
- **Rabbits:** climate, auto feed/water, breeding/kindling tracker, manure capture → fertilizer.
- **Horses (5):** RFID + smart stable (auto water/feed, climate, cams), activity/health monitor, **riding-schedule + guest-booking** integration. *Human: guides, farrier, vet.*
- **Aquaculture (tilapia/catfish/prawn + RAS):** DO/pH/ammonia/temp/turbidity sensors → auto-aeration, **AI-camera feeder**, water exchange → irrigation, aquaponics loop → hydroponics; guest fishing/prawning ponds.
- **Bees:** hive scales, temp/humidity, entrance counters, remote alerts; honey extraction.
- **Palm:** FFB yield + **ripeness vision** (harvest scheduling), fertigation, mill/CPO automation, **POME→biogas**, **EFB/shell→biochar/charcoal**.
- **Orchard / fruit:** soil + weather + leaf-wetness sensors, drip fertigation, ripeness vision, robotic mower, AI bird deterrent, guest fruit-picking zones.
- **Hydroponics / aquaponics:** pH/EC dosing pumps, climate, grow-lights, NFT/drip, FarmBot, CV crop-health, yield forecast.
- **Recycling / energy / water plant (the circular hub):** biogas digester (CH₄/level/O₂), **biochar kiln/pyrolizer**, composting (temp/O₂/moisture), **BSF bioreactors**, water treatment (turbidity/UV/flow/pH), solar+battery+genset+biogas controllers, greywater wetland monitors, vermicompost.
- **Lodging (hotel + bungalows + glamping):** smart locks, climate, per-unit energy sub-metering, occupancy, housekeeping/maintenance workflow, booking sync (Beds24-class).
- **Restaurant / F&B + processing (canning, freeze-dry, dairy/cheese, charcoal, soap):** cold-chain, POS (Loyverse-class), **batch traceability + HACCP + MSPO**, production scheduling.
- **Events (wedding / conference / church camps / workshops):** booking, capacity (150–300), AV, catering, staff scheduling.
- **Attractions (waterpark / pool / lazy river / ATV / archery / ranges / canoe / forest / zip):** water-quality monitoring (natural-pool), pumps, **capacity/queue + ticketing + e-waivers**, equipment predictive maintenance, staff/lifeguard scheduling (human-run, safety-gated).

## 11. Business & revenue

**Income streams (all monetized; palm oil is first cash flow):** CPO/palm;
dairy (milk/cheese/yoghurt); eggs (chicken + duck); meat (chicken/duck/goat/lamb/
beef/rabbit); fish + prawn; vegetables + herbs; fruit; honey + wax products;
mushrooms; **processed** (canned, freeze-dried, charcoal, biochar, compost,
fertilizer, soap, bamboo crafts); **biogas/energy**; **carbon credits/ESG**;
**lodging** (hotel + bungalows + glamping); **F&B / farm-to-table**; **events**
(weddings, conferences, camps, corporate retreats); **activities/tickets**;
**workshops**; **produce shop**.

**Channels:** farm-gate shop, online store, restaurant supply, local market,
**export to Singapore (SGD)**, tourism OTAs, event sales. **Currency: RM;
Singapore = SGD.** (The existing P&L / Manage layer extends to all of these.)

## 12. Tech architecture (control plane → real farm)

- **On-site hub:** Home Assistant (Raspberry Pi 5 / mini-PC) + **MQTT (Mosquitto)**;
  **ThingsBoard** for large LoRaWAN sensor fleets; **InfluxDB + Grafana** timeseries;
  **Node-RED** for local automations (backs offline fallback).
- **Brain:** FarmOS agent = **Claude Fable 5** (autonomous, long-horizon; run at
  high/xhigh effort). Autopilot loop already built.
- **Offline-first:** MUST run with no internet (the site starts online-first,
  **Starlink optional later**). All the offline/queue/flush machinery already exists.
- **Real-hardware binding:** every asset/sensor already carries `hardware` +
  `ha_entity` + `protocol`; `integration.simulated: false` swaps the simulator
  for live Home Assistant with the same code path. Build the HA adapter behind the
  existing tool interface (P1 in HANDOFF §10).
- **App:** the existing Next.js FarmOS — welcome → visual gallery → dashboard, with
  each vertical its own sub-app, plus the guest-facing PWA (§8) as a separate
  surface. Deploy Vercel now; AWS IoT Core + Lambda + Bedrock topology for the
  real farm (CLAUDE.md §11).
- **Hardware budget:** moderate + phased; auto-feeders/sensors first, robots (milker)
  when herd ROI justifies; substitutable components. **Owner is open to investment.**

## 13. Build phasing (self-sufficient core FIRST)

Map each phase onto FarmOS app work (config.yaml verticals + `lib/` modules +
pages + agent tools). Keep the two demo scenarios green throughout.

- **Phase 1 — Self-sufficient core (do first).** Energy (solar+battery+biogas) +
  water (well/rain + natural treatment + shortage ladder) + core livestock
  (poultry, **ducks**, goats, rabbits, fish) + crops (hydro/aquaponics + kitchen
  garden + orchard) + **palm oil (income)** + waste loops (compost/BSF/biochar/
  biogas) + the twin/agent/autopilot over all of it. → In-app: expand
  `farm.config.yaml` with these verticals/animals + zones/assets/sensors, add
  metric models, energy sources (wind/biogas), the circular-loop module, the
  water-treatment + shortage logic.
- **Phase 2 — Dairy + more livestock + processing.** Cattle/dairy + robotic milking,
  cheese/dairy processing, sheep, horses, bee scale-up, canning/freeze-dry/charcoal/
  soap processing + HACCP/MSPO traceability.
- **Phase 3 — Hospitality.** Lodging (bungalows → 60-room hotel) + glamping +
  restaurant/F&B + events/wedding/conference/camps + bookings/POS.
- **Phase 4 — Funworld.** Waterpark/pool/lazy river + ATV/archery/ranges + forest
  adventure/zip + canoe/fishing/prawning + workshops + full **guest PWA**
  (booking, wallet, cams, AR, adopt-an-animal).
- **Phase 5 — Platform & scale.** Sales channels (RM/SGD, export, online shop),
  **carbon credits/ESG**, sustainability discovery center, farm2 replication,
  reporting, mobile polish.

## 14. Implementation notes (extend the existing app — don't rebuild)

- Add verticals/animals/loops to **`farm.config.yaml`** (source of truth). New
  metric → `lib/simulator.ts`; new asset-type power draw → `lib/config.ts`
  `POWER_DRAW`; headline/KPI → `updateVerticals`; AI signal → `lib/insights.ts`;
  automation → `lib/automations.ts`; economics → `lib/economics.ts`. **Restart dev
  to re-seed** after twin-shape changes.
- New cross-cutting modules to add (each = `lib/<x>.ts` + `/api/<x>` + page + agent
  tool, following the existing pattern): **energy sources** (wind/biogas/genset in
  resources), **water treatment + sources + shortage ladder**, **circular-loops**
  (the §7 map, with live flows), **dairy/milking**, **grazing/silvopasture**,
  **bookings + POS + events**, **attractions + ticketing + waivers**, **guest PWA**,
  **sales/CRM (RM/SGD)**, **carbon/ESG**, **sustainability discovery** view.
- Keep the **life-support / never_shed** guard and the **crisis + resilience**
  scenarios bulletproof as scope grows (animals + potable water are the new
  life-support loads — add them to `never_shed`).
- Agent (Fable 5): expand the toolset per vertical; keep autonomy map from §9
  (auto vs human-approval) — implement approval as a task the agent assigns rather
  than an action it takes, for the human-in-loop items.

---

### Sources (market survey, 2026)
Agritourism automation ([Agritecture](https://www.agritecture.com/blog/agritourism-technology-wellness-gen-z-travel-trends)) ·
livestock/dairy ([Bullvine](https://www.thebullvine.com/dairy-technology-2026-robotics-sensors-ai-and-real-world-roi/), [cattle wearables](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11815998/)) ·
aquaculture ([Farmonaut RAS](https://farmonaut.com/blogs/aquaculture-fish-farming-ras-top-innovations-for-2026), [smart pond](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11175198/)) ·
circular palm/farm ([circular palm bioeconomy](https://www.sciencedirect.com/science/article/abs/pii/S0957582024016987), [crop-livestock circular](https://www.sciencedirect.com/science/article/pii/S2666154324003065)) ·
off-grid energy/water ([off-grid water systems](https://todayshomeowner.com/lawn-garden/guides/complete-guide-to-off-grid-water-systems/)) ·
equine/small-livestock ([equine software](https://www.farmkeep.com/farm-type/horse-management-software)).
