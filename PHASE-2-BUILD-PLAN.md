# FarmOS — Phase 2 Build Plan (Pilot BoM · Land-Use · Staffing & Capex)

Turns the research (`PHASE-2-SYSTEMS-SPEC.md`, `REAL-WORLD-OPERATIONS.md`) into a costed,
land-allocated, staffed plan. **All figures indicative** — get real quotes before committing.
FX assumption ≈ **RM 4.7 / USD 1**.

---

## PART A — Phase 2a Pilot: Bill of Materials (one vertical, end-to-end)

**Recommended pilot vertical: Aquaponics** — highest-criticality life-support story (aerator + pump
= never-shed, **DO is the killer metric**), cheap sensors, near-zero effluent, and a tour-able
sustainability showcase for the resort. The pilot also stands up the **shared edge + energy + water
backbone** that every future vertical reuses.

### A1. Shared backbone (build once, reuse for all verticals)
| Item | Real product | Qty | RM (est.) |
|---|---|---:|---:|
| Edge compute | Raspberry Pi 5 (8GB) + NVMe + PoE case | 1 | 800 |
| Edge UPS | Mini-UPS / DC-UPS for Pi + network | 1 | 400 |
| Network | PoE switch + outdoor cabling | 1 | 600 |
| Uplink | 4G/5G router (Starlink backup optional) | 1 | 500 |
| Edge software | Home Assistant + Node-RED + Mosquitto + InfluxDB + Grafana | — | 0 (OSS) |
| **Energy — battery/PV telemetry** | Victron **Cerbo GX** | 1 | 1,400 |
| Battery monitor | Victron **SmartShunt 500A** | 1 | 600 |
| Load-shed relays | Shelly **Pro** relays (per circuit) | 4 | 800 |
| **Water — tank/flow** | ultrasonic tank-level sensors | 3 | 900 |
| Flow meters | pulse/Modbus flow meters | 2 | 600 |
| Zoned valves | solenoid valves | 4 | 800 |
| Potable quality | pH + turbidity + TDS + ORP probes | 1 set | 2,500 |
| **Backbone subtotal** | | | **~9,900** |

### A2. Aquaponics vertical
| Item | Real product | Qty | RM (est.) |
|---|---|---:|---:|
| **Dissolved oxygen** (critical) | Atlas Scientific DO probe + EZO circuit | 1 | 1,200 |
| pH | Atlas Scientific pH probe + EZO | 1 | 500 |
| EC / nutrient | Atlas Scientific EC probe + EZO | 1 | 500 |
| Water temp | DS18B20 sensors | 2 | 100 |
| Water level | float / ultrasonic switches | 2 | 200 |
| **Aeration** (life-support) | air blower + diffusers | 1 | 800 |
| **Circulation** + **backup pump** | low-head pumps ×2 (redundant) | 2 | 1,200 |
| Actuator control | relay board for dosing/solenoids | 1 | 800 |
| Vision | PoE IP camera (biomass/CCTV feed) | 1 | 400 |
| **Vertical subtotal** | | | **~5,700** |

### A3. Pilot totals
| | RM | USD |
|---|---:|---:|
| Backbone + Aquaponics hardware | ~15,600 | ~3,300 |
| Install + contingency (+20%) | ~3,100 | ~660 |
| **Phase-2a pilot total** | **~18,700** | **~4,000** |

**Recurring:** Starlink backup ~RM 220/mo · FarmOS cloud (Bedrock/Anthropic) ~RM 200–500/mo · vendor
SaaS ~RM 0–200/mo. **App change:** swap the simulator's `readSensor()` for a Home-Assistant/MQTT
adapter behind the same interface, flip `integration.simulated:false` **for the aquaponics zone only**,
and run it live beside the sim. Success metric: the agent holds DO in-band and pre-empts a low-DO
event autonomously on real hardware.

> **Phase-2b** (energy + water backbone farm-wide, Victron + tanks/valves) makes the crisis + offline
> demos *real* estate-wide — highest-leverage, most mature system, ~RM 15–30k. **Phase-2c** livestock
> welfare + virtual fencing (SenseHub/Nedap + Halter/Nofence), ~RM 40–80k.

---

## PART B — Land-Use Master Plan (100 acres / 40.5 ha)

Based on your stated split (palm 20% · aquaculture 20% · fruit 20% · hydroponic 15% · bee 5% ·
petting zoo 1%) reconciled to all 18 verticals + hospitality, with **overlaps** made explicit
(silvopasture and apiaries don't consume separate land).

| Zone | Acres | Notes / overlaps |
|---|---:|---|
| **Oil palm plantation** | 20 | **Sheep silvopasture grazes under palm** (no extra land); fronds/EFB/POME feed biochar+biogas |
| **Fruit orchard** | 20 | **Kelulut + Apis apiaries sited within** (pollination; no extra land) |
| **Aquaculture ponds** (fish + prawn) | 18 | **Guest fishing/prawning ponds are part of this** zone |
| **Horticulture** (hydroponics + aquaponics greenhouses + nursery) | 10 | Built footprint smaller; rest = buffer/expansion |
| **Dairy cattle + goats** (barns + cut-and-carry Napier/legume forage) | 8 | Manure → biogas/compost |
| **Poultry + ducks + rabbits** (houses + free-range paddocks) | 4 | Litter → BSF/compost |
| **Horses** (stables + arena + paddocks) | 4 | |
| **Petting zoo** | 1 | |
| **Processing + recycling hub** (canning/freeze-dry + biogas/BSF/biochar/compost) | 2 | The circular hub |
| **Lodging** (eco-hotel + glamping + cabins) | 5 | |
| **Restaurant + central facilities** | 1 | Farm-to-table |
| **Attractions** (pool & lazy river, ATV circuit, archery, kayaking lake, events lawn, kids' camp) | 4 | Lake doubles as kayaking + landscape |
| **Roads, parking, solar array, water treatment, buffers, forest trails** | 3 | Off-grid infra + forest-adventure |
| **Total** | **100** | (Beekeeping + sheep overlap other zones, so effective productive area >100 ac) |

**Design logic:** the three big land users (palm, orchard, aquaculture = 58 ac) are the low-labour,
income + circular-feedstock base; the intensive high-value verticals (horticulture, dairy, poultry)
cluster near the processing hub and restaurant for short farm-to-kitchen transfer; hospitality +
attractions occupy the scenic 13 ac; **silvopasture and apiaries stack onto palm/orchard for free.**

---

## PART C — Staffing & Total Capex

### C1. Realistic estate headcount (full operation, 150–300 guest capacity)
Aggregated from the per-vertical labour research. Grouped under the `/staff` module's lead roles.

| Team | Core FTE | Notes |
|---|---:|---|
| Founder / GM + admin + **FarmOS operator** | 2–3 | the "one person runs the company" layer |
| Livestock (cattle, goats, sheep, poultry, ducks, rabbits, horses, zoo) | 5–7 | milkers + stockpersons + shepherd + grooms + zoo supervisors |
| Aquaculture + aquaponics | 2–3 | water-quality tech + helpers |
| Crops (hydroponics, orchard, palm) | 4–6 core | + **seasonal harvest labour** (palm 10-day round, durian season) |
| Beekeeping | 1 (part-time) | doubles as agritourism guide |
| Processing + recycling | 2–3 | food-safety operator + biogas/BSF technician |
| Hospitality — front desk / housekeeping / maintenance | 10–14 | ~1.0–1.5 staff/room at the lean end |
| Restaurant (kitchen + FOH) | 12–18 | scales with covers + events |
| Attractions (guides, lifeguards, marshals, event crew) | 6–10 | + casuals for events |
| On-call partners | — | vet, farrier (contract, not headcount) |
| **Total core FTE** | **~44–64** | + seasonal/casual peaks |

**The honest leverage story:** a comparable resort + diversified farm run conventionally would need
**~30–40% more people** and a full ops/management department. FarmOS + automation (milking robots,
virtual fencing, auto-feeders, HACCP auto-logging, guest-request dispatch, predictive load-shedding)
**removes the management layer and trims the operational crew** — it doesn't run a 60-room resort with
one person. Positioning: *"a small, multi-skilled team with an AI operations department."*

### C2. Indicative capex to build the estate (very rough, RM)
| Block | RM (M) | Basis |
|---|---:|---|
| Land (if purchased; skip if owned/leased) | — | excluded — site-dependent |
| Oil palm establishment (20 ac, incl. DxP + 3-yr immature) | 0.3–0.5 | |
| Orchard (20 ac, trees + irrigation + establishment) | 0.4–0.8 | durian-heavy costs more |
| Aquaculture ponds (18 ac earthen + hatchery + aeration) | 0.8–1.5 | |
| Horticulture (net-houses + fertigation + aquaponics) | 0.6–1.2 | |
| Livestock (barns, milking, wearables, virtual fencing, stock) | 0.8–1.6 | dairy + robots are the driver |
| Processing + recycling hub (kitchen, retort, freeze-dryer, biogas, BSF, biochar) | 0.6–1.2 | |
| **Lodging** (60-room eco-hotel + 10–15 domes + 8–12 cabins) | **6–14** | dominant capex; domes RM 40–120k each |
| Restaurant + central facilities | 1–2.5 | |
| Attractions (pool & lazy river, ATV, kayak lake, events, kids' camp) | 1.5–4 | pool/lazy-river is capital-heavy |
| Off-grid infra (solar array + battery + biogas + water treatment) | 1.5–3.5 | scales with resort load |
| Roads, utilities, landscaping, contingency | 1–2 | |
| **FarmOS + IoT rollout** (all 18 verticals, phased) | 0.3–0.6 | the *cheapest* line — software leverage |
| **Indicative total (ex-land)** | **~15–35** | phase it; lodging + attractions dominate |

**Key insight:** the **FarmOS/IoT layer is <2–4% of total capex** but is what lets the whole thing run
with a lean crew. Hospitality (hotel + domes + attractions) is ~60–70% of capex and should be **phased
to match demand** (start with domes + cabins, add the hotel block once occupancy proves out).

### C3. Suggested phasing (de-risk in order)
1. **Prove the farm core** — palm + orchard + aquaculture + a few animals + processing/recycling (income + circular loops + FarmOS Phase 2a/2b live on real hardware).
2. **Lodging v1** — glamping domes + farm cabins (fast, low-capex, high-margin, tests demand).
3. **Restaurant + attractions v1** — farm-to-table + fishing/tours/pool (monetise footfall).
4. **Hotel block + full attractions** — only once occupancy + F&B prove out.
5. **Second farm** (`farm2.yaml`) — replicate the FarmOS platform.

---

## Cross-references
- Sensors/AI per system → `PHASE-2-SYSTEMS-SPEC.md`
- Operational reality per vertical → `REAL-WORLD-OPERATIONS.md`
- `never_shed` load list updated in `farm.config.yaml` to match the life-support findings above.
