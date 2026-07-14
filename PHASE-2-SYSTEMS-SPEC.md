# FarmOS — Phase 2: Real-World Systems & Sensor Specification

**From demo to a working farm.** This document specifies, per system and per vertical, the
**real sensors, actuators, and AI integrations** needed to run Crown Eagles Eco Farm for real —
grounded in products shipping in the market today (2025–2026). It also grades each capability
by maturity (**Now / Near / Research**) so we build what's real first.

> Design rule that doesn't change: FarmOS is the **agent + orchestration layer** on top of
> proven open farm-IoT tooling. We don't rebuild sensors, brokers, or historians — we
> integrate them and put a Claude brain on top. Every asset in `farm.config.yaml` already
> carries a `hardware` / `ha_entity` / `protocol` triplet; Phase 2 makes those real.

---

## 0. Maturity legend
- **🟢 Now** — off-the-shelf hardware + software exists; integration is wiring, not invention.
- **🟡 Near** — components exist but need integration/tuning/custom models (3–12 mo).
- **🔴 Research** — promising but not production-reliable yet; keep human-in-the-loop.

---

## 1. The reference stack (the spine every vertical plugs into)

```
 FIELD                EDGE (on-site, survives outages)         CLOUD (AWS)              FARMOS
 ───────────────────  ──────────────────────────────────────  ───────────────────────  ─────────────────
 sensors ─┐           Raspberry Pi 5 / industrial gateway      AWS IoT Core (MQTT)      FarmOS agent
 actuators├─ MQTT/    ├─ Home Assistant (device hub, HA API)   ├─ Lambda (tool exec)    (Claude via Bedrock)
 cameras ─┘  Zigbee/  ├─ Node-RED (rules/glue)                 ├─ Timestream/Influx     ├─ reads twin
             Modbus/  ├─ Mosquitto (local MQTT broker)         ├─ S3 (images/video)     ├─ predicts
             LoRaWAN  ├─ InfluxDB + Grafana (local history)    ├─ Bedrock (Claude)      ├─ acts via tools
                      └─ local rule engine (offline autonomy)  └─ SNS → WhatsApp/Twilio └─ logs reasoning
```

**Why this shape:** the edge tier (Home Assistant + Node-RED + local broker + InfluxDB) means
the farm keeps sensing and acting through a cloud/internet outage — exactly our resilience
demo, made real. Cloud adds Claude-scale reasoning, long history, and off-site alerts.

**Connectivity choice by range/power (🟢 Now):**
| Need | Protocol | Use for |
|---|---|---|
| In-building, mains/battery, mesh | **Zigbee / Z-Wave** | coop, barn, greenhouse, room sensors |
| Long-range, low-power, battery 5–10 yr | **LoRaWAN** (ChirpStack/TTN) | field soil, tank levels, remote gates, bee hives, virtual-fence towers |
| Wired industrial equipment | **Modbus RTU/TCP** | inverters, VFD pumps, retort, freeze-dryer, biogas |
| High-bandwidth (video/CV) | **PoE Ethernet / Wi-Fi 6** | cameras, AI vision |
| Off-property / backup | **4G/5G + Starlink** | uplink; failover for autonomy |

**Historian & dashboards:** InfluxDB (time-series) + Grafana on the Pi; ThingsBoard is the
alternative if we want a managed device-management + rules UI. FarmOS reads current state from
the HA API (same code path as today's simulator) and history from InfluxDB.

---

## 2. Cross-cutting systems

### 2.1 Energy (off-grid solar + battery + biogas + wind) — 🟢 Now
- **Sensors/monitors:** Victron **Cerbo GX** (system controller) + **SmartShunt / BMV-712**
  (battery SoC, V, A, time-to-go), **MPPT** solar chargers (PV W, yield), **Smart Battery
  Sense** (V/temp), BMS CAN for LiFePO₄ packs. Pyranometer (e.g. Apogee SP-110) for solar
  irradiance → forecast. Genset controller (ComAp/Deep Sea) via Modbus. Wind: turbine
  controller telemetry. Biogas genset: runtime, kWh.
- **Actuators:** contactor/relay load-shedding per circuit (Shelly Pro, Victron GX relays),
  transfer switch, genset auto-start.
- **AI (FarmOS):** predictive battery forward-simulation (already in the app) + weather →
  **pre-emptive load-shedding**; genset/biogas dispatch optimisation; anomaly detection on
  charge curves. Victron **VRM** API gives cloud telemetry; we mirror it into the twin.
- *Reality:* this is the most production-ready system — Victron + Home Assistant integrations
  are mature. Our crisis demo maps 1:1 to real hardware.

### 2.2 Water (potable, irrigation, tanks, well) — 🟢 Now
- **Sensors:** tank level (ultrasonic e.g. Maxbotix, or submersible pressure), flow meters
  (pulse/Modbus), well pump current/pressure, soil moisture (Sensoterra LoRaWAN, METER
  TEROS 12), rain gauge. **Potable quality:** turbidity, TDS/EC, pH, free-chlorine/ORP
  (Atlas Scientific probes, In-Situ Aqua TROLL) — natural low-chlorine treatment monitored.
- **Actuators:** solenoid valves (zoned irrigation), VFD pumps, UV/ozone dosing, backwash.
- **AI:** ET-based + forecast-driven **irrigation scheduling** (skip before rain), leak
  detection (flow-anomaly), reserve-management (never drain a tank below animal/potable
  reserve — a `never_shed`-style water invariant).

### 2.3 Connectivity & compute — 🟢 Now
- On-site: Raspberry Pi 5 (or fanless industrial PC) running the edge stack; UPS-backed.
- Uplink: 4G/5G primary, **Starlink** backup; the agent degrades to local rules when both drop.
- Security: per-device certs on AWS IoT, VLAN for cameras, read-only HA tokens for FarmOS.

### 2.4 The AI / agent layer (FarmOS's actual product) — 🟢 orchestration / 🟡 models
FarmOS is the **decision + orchestration** layer. Four AI capability classes sit under it,
each with real market analogues we integrate rather than reinvent:
1. **Computer vision** (health, counting, ripeness, behaviour) — cameras + models.
2. **Predictive analytics** (disease, yield, energy, water) — time-series ML.
3. **Anomaly detection** (sensor drift, equipment fault, welfare) — unsupervised + rules.
4. **LLM agent (Claude via Bedrock)** — reads the unified twin, reasons across all 18
   domains, calls tools, explains every action, and routes human tasks (our staff dispatch).
   *This cross-domain agent is the novel layer; the four capabilities above are commoditised
   inputs to it.*

---

## 3. Per-vertical deep dive (all 18)

> Format: **Sensors** (metric → real product example → protocol) · **Actuators** · **AI**.
> Livestock share a common welfare stack (accelerometer collar/ear-tag + environment + vision),
> specialised per species below.

### Livestock — shared welfare stack — 🟢 sensors / 🟡 AI
- **Wearables:** ear-tag/collar with accelerometer + temp + (GPS) — **Allflex SenseHub / SCR**
  (rumination, activity, heat, health index), **Nedap**, **CowManager** (ear), **Moocall**
  (calving). Protocol: proprietary gateway → API → twin.
- **AI:** **Connecterra Ida**, **Cainthus/ever.ag** vision — heat/health/lameness alerts days
  early. FarmOS consumes these as signals; treatment decisions stay human (approval-gated).

#### 1. Dairy Cattle — 🟢
- Sensors: SenseHub collar (rumination/activity/temp), in-parlour milk meter + conductivity
  (mastitis), body-condition camera, barn temp/humidity/THI, water-trough flow.
- Actuators: **milking robot** (Lely Astronaut / DeLaval VMS / GEA DairyRobot), auto-feeder,
  barn fans/misters (heat-stress), **virtual fencing** (Halter — GPS solar collars + LoRaWAN
  towers, audio cue → mild pulse, >99% containment).
- AI: milk-yield/mastitis prediction, heat detection, THI-driven cooling, rotational-grazing
  moves via Halter. *Never-shed: feed, water, ventilation.*

#### 2. Dairy Goats — 🟢 / 🟡
- Sensors: collar activity, milking-parlour meters, barn climate, NH₃. Actuators: milking
  parlour, feeders, fans, **Nofence** (goat-certified virtual fencing). AI: yield + kid-rearing
  alerts, browse-rotation.

#### 3. Sheep (silvopasture under palms) — 🟢 / 🟡
- Sensors: ear-tag activity/EID (Datamars), pasture NDVI (drone/satellite), water points.
  Actuators: **Nofence** virtual fencing, auto-drafting gate. AI: grazing-pressure + FFB-litter
  cleanup scheduling (integrates palm vertical), lameness/fly-strike alerts.

#### 4. Horses (stables) — 🟢
- Sensors: stable cam, water/feed sensors, wearable (gait/colic activity, e.g. equine
  monitors), arena footing moisture. Actuators: auto-waterer, fans, lighting. AI: colic/lameness
  anomaly, ride-schedule vs welfare.

#### 5. Poultry — 🟢 sensors / 🟡 AI
- Sensors: temp/humidity (Sensirion SHT), **NH₃** (electrochemical / MQ-137), **CO₂** (Sensirion
  SCD41), PM/dust, light, water/feed lines, **egg counters**. Thresholds: NH₃ < 25–30 ppm hard limit.
- Actuators: exhaust fans, inlets, heaters/brooder plates, **incubator** controller (temp/humidity/
  turning), auto-doors (ChickenGuard), feed augers, foggers.
- AI: **ChickenBoy / Faromatics** thermal robot (live-vs-dead, dropping analysis → disease 2–3 d
  early), vocalisation/sound analysis for respiratory disease, activity heat-maps, egg-count CV.
  *Never-shed: incubator, brooder heat, ventilation, water.*

#### 6. Ducks — 🟢
- Sensors: pond water quality (DO/temp), house climate, egg count, camera. Actuators: pond
  aerator, house fans, auto-door. AI: flock counting, pond-quality-driven aeration.

#### 7. Rabbits — 🟢
- Sensors: rabbitry temp/humidity (heat-sensitive), NH₃, water lines, camera. Actuators: fans,
  foggers/cooling, auto-water. AI: heat-stress pre-cooling, welfare anomaly.

#### 8. Petting Zoo — 🟢
- Sensors: enclosure climate, water, **visitor counters**, welfare cameras. Actuators: shade/
  misting, gates. AI: crowd/animal-stress balancing, welfare alerts, opening-hours automation.

### Crops & plantation

#### 9. Hydroponics (greenhouse) — 🟢
- Sensors (commercial greenhouses run **8–12 sensor types**): air temp/RH → **VPD**, **CO₂**
  (SCD30/41), PAR/light (Apogee), substrate moisture (Grodan **GroSens**), nutrient **EC + pH**
  (Atlas Scientific / Hanna), water temp, DO, flow, leaf temp (IR).
- Actuators: dosing pumps (A/B + acid), circulation pumps, HVAC/dehumidifier, exhaust, CO₂
  injection, LED grow lights (spectrum/schedule), shade/thermal screens, **FarmBot** for seeding.
  Controllers: Priva / Argus / Ridder / Autogrow / TrolMaster / GrowLink.
- AI: **iUNU LUNA**, Source/Ceres, 30MHz, Neatleaf — VPD/CO₂/light optimisation, disease/pest
  early detection via CV, yield forecasting. Closed-loop EC/pH auto-dosing cuts water 80–95%.

#### 10. Aquaponics — 🟢
- Sensors: fish-tank DO/pH/temp/ammonia/nitrate/ORP (Atlas Scientific / In-Situ), grow-bed
  moisture, flow, water level. Actuators: aerators, circulation/sump pumps, solenoids, auto-feeder,
  buffer dosing. AI: couples fish-load ↔ plant-nutrient balance; DO-driven aeration; ammonia/nitrite
  spike prevention. *Never-shed: aerator, circulation pump.*

#### 11. Fruit Orchard — 🟢 / 🟡
- Sensors: soil moisture at depths (Sensoterra/TEROS, LoRaWAN), weather station (Davis / **Arable
  Mark 3**), sap-flow, dendrometers, canopy multispectral (drone/satellite). Actuators: zoned drip
  valves, frost fans/foggers, bird-deterrent. AI: ET+forecast irrigation, **fruit ripeness/yield CV**,
  pest/disease models, harvest-window timing.

#### 12. Palm Oil (plantation) — 🟢 mapping / 🟡 FFB CV
- Sensors: **multispectral drone** (DJI Mavic 3M / Agras) → **NDVI** tree health & nutrient maps
  (85%+ yield-prediction accuracy in MY/ID pilots), satellite analytics (Farmonaut), soil probes,
  weather. Actuators: variable-rate fertiliser (drone/spreader), targeted spraying drone.
- AI: **FFB ripeness detection via CNN** (~87% accuracy) → optimal harvest routing; stress/disease
  (Ganoderma) early detection; palm-count & biomass from imagery.

### Aquaculture, processing, circular

#### 13. Aquaculture (fish & prawn ponds) — 🟢 sensors / 🟡 AI feed & biomass
- Sensors: **DO** (most critical), pH, temp, ammonia (NH₃/NH₄), nitrite, salinity, turbidity, ORP,
  TDS — **In-Situ Aqua TROLL / YSI EXO / Atlas Scientific**. Reported accuracies: DO ~90%, pH ~95%,
  temp ~99%. Underwater + surface cameras for biomass/behaviour.
- Actuators: **paddlewheel + diffused aerators** (DO control), auto-feeders, water-exchange pumps,
  valves. AI: **AI feeding** (eFishery, **Umitron**, ReelData, Aquabyte/Observe) — camera+sensor
  appetite/biomass → precise feed, less waste; DO-forecast aeration; disease/mortality anomaly;
  digital-twin pond models. *Never-shed: aerators.*

#### 14. Beekeeping (apiary) — 🟢
- Sensors: **hive weight** (load cells), brood temp (93–95°F band), humidity, **acoustic** (swarm/
  queen state), entrance bee-counter, apiary weather — **BroodMinder / Arnia / Pollenity / BeeHero**
  (LoRaWAN/cellular). Actuators: mostly advisory (feeding, ventilation). AI: swarm prediction,
  colony-health forecasting, nectar-flow (weight) analytics, anomaly/queenless detection.

#### 15. Canning & Food Processing — 🟢 (compliance-driven)
- Sensors: **retort** temp/pressure logging (F₀ lethality), **freeze-dryer** shelf/condenser temp +
  vacuum (PLC/Modbus), pasteuriser temp, jar-seal vision, metal detector, scale/fill weight,
  ambient RH. Actuators: retort/freeze-dryer PLC, conveyors, labeller, sealer.
- AI + compliance: automated **HACCP/CCP logging**, batch traceability (**FSMA 204** — high-risk
  food traceability mandate, Jan 2026), defect-detection CV, yield/OEE analytics. Tamper-proof
  time-stamped records replace clipboards.

#### 16. Recycling & Resource Recovery (biogas/biochar/BSF) — 🟢 / 🟡
- Sensors: **biogas digester** temp, pH, **CH₄ / H₂S / CO₂** gas analysers, gas flow, POME level;
  biochar-kiln temp; **black-soldier-fly** bioreactor temp/humidity/CO₂; compost windrow temp +
  moisture. Actuators: digester mixer/heater, gas flare/genset dispatch, BSF climate control,
  compost turner. AI: biogas-yield optimisation, feedstock balancing, safety alarms (H₂S/CH₄),
  closes the circular loops (palm fibre→biochar, POME→biogas, manure→BSF feed, fish water→irrigation).

### Hospitality & attractions

#### 17. Lodging & Resort (hotel / glamping / cabins) — 🟢
- Sensors: room temp/occupancy, **smart locks**, energy sub-metering, water leak, air quality,
  minibar/door. Actuators: HVAC/thermostat, lighting scenes, smart locks, water heaters (shed-able).
- Systems: **PMS** (Beds24/Cloudbeds) ↔ FarmOS for occupancy-aware energy + our **guest app**
  (already built: room service, food, amenities, faults, tour booking → staff dispatch).
  AI: occupancy-predictive energy (pre-cool only sold rooms), dynamic pricing, guest-request routing.

#### 18. Restaurant (farm-to-table) — 🟢
- Sensors: **cold-room/fridge/freezer temp** (Monnit / ConnectedFresh / GlacierGrid), door
  open/close, cook/hold probes, dishwasher/hot-hold temp, hood. Actuators: refrigeration alerts,
  compressor health. Systems: **POS** (Loyverse) → demand → harvest/inventory link.
  AI: HACCP auto-logging + alerts (a 3 AM fridge-fail alert routinely saves ~$8k of stock),
  farm-to-table traceability, waste/par-level forecasting, menu ↔ harvest matching.

---

## 4. What's really possible — reality grid

| Capability | Status | Notes |
|---|---|---|
| Off-grid energy monitoring + autonomous load-shed | 🟢 Now | Victron + HA; our crisis demo = real |
| Water/tank/irrigation automation + forecast scheduling | 🟢 Now | LoRaWAN soil + valves |
| Greenhouse/hydroponics closed-loop climate & dosing | 🟢 Now | Priva/Autogrow/TrolMaster |
| Aquaculture water-quality monitoring + aeration control | 🟢 Now | DO the killer metric |
| AI aquaculture feeding & biomass | 🟡 Near | Umitron/eFishery-class; integrate |
| Livestock wearable health alerts (heat/rumination/lameness) | 🟢 Now | SenseHub/Nedap/Connecterra |
| Virtual fencing (cattle/goats/sheep) | 🟢 Now | Halter/Nofence, >99% containment |
| Poultry environment control + incubation | 🟢 Now | fans/heaters/NH₃/CO₂ |
| Poultry AI disease/mortality vision | 🟡 Near | ChickenBoy/Faromatics-class |
| Palm NDVI health + yield maps | 🟢 Now | DJI + Farmonaut/satellite |
| Palm FFB ripeness CV harvest routing | 🟡 Near | ~87% CNN; needs local model |
| Precision beekeeping (weight/acoustic/temp) | 🟢 Now | BroodMinder/BeeHero |
| Cold-chain/HACCP auto-logging + FSMA traceability | 🟢 Now | Monnit/GlacierGrid |
| Biogas/biochar/BSF monitoring + safety | 🟢 Now | gas analysers + control |
| **Cross-domain autonomous agent (Claude) over one twin** | 🟡 **our build** | the novel layer |
| Autonomous medical treatment / culling / spend | 🔴 Human | approval-gated forever |
| Fully autonomous field robots (harvest/weeding) | 🔴 Research | pilot only |

**Honest summary:** ~70% of Crown Eagles Eco Farm can run on **off-the-shelf 🟢 hardware today**; the AI
*inputs* (vision/feeding/ripeness) are 🟡 integrations of existing vendors; the genuinely new,
defensible thing is FarmOS itself — **one unified twin + a safety-constrained Claude agent that
reasons and acts across all 18 verticals and directs the humans.** Nobody ships that.

---

## 5. Build roadmap (demo → working farm)

- **Phase 2a — One real vertical, end to end (6–8 wk).** Pick **Aquaponics or Poultry** (high
  criticality, cheap sensors, clear life-support story). Stand up the edge stack (Pi + HA +
  Node-RED + Mosquitto + InfluxDB), wire real DO/pH/temp/NH₃/CO₂ + aerator/fan relays, flip
  `integration.simulated:false` for that vertical, and let FarmOS run it live alongside the sim.
- **Phase 2b — Energy + water backbone (4 wk).** Victron GX + tank/flow + valves. Makes the
  crisis + resilience demos *real*, farm-wide. This is the highest-leverage, most mature system.
- **Phase 2c — Livestock welfare + virtual fencing (8–10 wk).** SenseHub/Nedap API + Halter/
  Nofence; wire health alerts → staff dispatch (already built).
- **Phase 2d — Vision & predictive models (ongoing).** Cameras + integrate vendor AI (Umitron,
  ChickenBoy, iUNU, FFB CV) as twin signals feeding the agent.
- **Phase 2e — Business systems.** Beds24 (PMS), Loyverse (POS), accounting → live P&L from real
  transactions; HACCP/FSMA traceability.
- **Phase 2f — Second farm (`farm2.yaml`).** Prove replication: new farm = new config, same code.

### App/data-model changes needed now
- Replace the simulator's `readSensor()` with a **Home Assistant / MQTT adapter** behind the same
  interface (the seam already exists via `ha_entity`/`protocol`).
- Add an **ingestion service** (MQTT → twin + InfluxDB); keep the twin as the live snapshot,
  InfluxDB as history for charts/ML.
- Add a **device-health/commissioning** view (battery, RSSI, last-seen per sensor).
- Harden the **offline queue** to real store-and-forward (already modelled) and per-device certs.
- Expand `AgentAction` tools to call **real actuators** via HA services (guarded by the same
  `isProtected()` / approval gates we already enforce).

---

## Sources (market grounding, 2025–2026)
- Livestock AI/wearables: [openPR — PLF market (Connecterra, Cainthus, Vence)](https://www.openpr.com/news/4456408/artificial-intelligence-in-precision-livestock-farming-market) · [Merck/Allflex SenseHub](https://www.merck-animal-health-usa.com/producers/cattle/allflex-livestock-monitoring/) · [MDPI — dairy collar review](https://www.mdpi.com/2076-2915/15/3/458)
- Virtual fencing: [Halter — how it works](https://www.halterhq.com/en-us/articles/virtual-fencing-for-cattle) · [Nofence](https://www.nofence.com/) · [U Alberta — 99% containment](https://www.ualberta.ca/en/folio/2025/11/no-fences-research-shows-high-tech-collars-keep-cattle-from-straying.html)
- Aquaculture: [Smart Aquaculture 2025 (IoT+AI)](https://www.farmxpertgroup.com/2025/07/smart-aquaculture-2025-iot-ai.html) · [Agrinovo DO/pH/ammonia](https://agrinovo.io/solutions/iot-aquaculture-monitoring/) · [MDPI — Fish Farming 5.0](https://www.mdpi.com/2076-3417/15/23/12638)
- Greenhouse/hydroponics: [Farmonaut — smart greenhouse 2025](https://farmonaut.com/blogs/smart-greenhouse-farming-2025-essential-market-trends) · [Atlas Scientific — greenhouse sensors](https://atlas-scientific.com/blog/sensors-for-greenhouse/) · [GrowDirector — automation 2025](https://growdirector.com/greenhouse-automation-reduce-labor-costs/)
- Poultry: [arXiv — multi-sensor AI poultry platform](https://arxiv.org/html/2510.15757v1) · [Renke — poultry monitoring](https://www.renkeer.com/poultry-breeding-environmental-monitoring-solution/) · [CO2Meter — ammonia](https://www.co2meter.com/blogs/news/ammonia-meter-poultry-farms)
- Beekeeping: [SkogHive — 2025 hive sensors](https://www.skoghive.com/blogs/beekeeping-guide/smart-beehive-sensors-san-francisco-silicon-valley) · [BeePrecise](https://beeprecise.io/sensors/) · [Nature — precision beekeeping anomaly detection](https://www.nature.com/articles/s41598-026-37877-1)
- Palm oil: [Farmonaut — AI oil-palm mapping](https://farmonaut.com/precision-farming/ai-powered-oil-palm-mapping-boost-plantation-efficiency) · [Bernard BC — drones in MY palm](https://bernardbc.com/revolutionising-palm-oil-how-drones-are-driving-sustainable-plantations-in-malaysia/) · [Wiley — UAV in oil palm](https://onlinelibrary.wiley.com/doi/10.1155/2022/5385505)
- Platform/stack: [ThingsBoard — smart farming](https://thingsboard.io/use-cases/smart-farming/) · [AWS IoT Core](https://aws.amazon.com/iot-core/) · [Folio3 — IoT in agriculture 2026](https://agtech.folio3.com/blogs/iot-in-agriculture/)
- Energy: [Victron — battery monitors](https://www.victronenergy.com/battery-monitors-and-batteries)
- Cold chain/HACCP: [envigilance — restaurant temp monitoring 2025](https://envigilance.com/temperature-monitoring/restaurant-temperature-monitoring/) · [ConnectedFresh](https://connectedfresh.com/) · [GlacierGrid — HACCP IoT](https://www.glaciergrid.com/resources/research-and-impact/iot-temperature-logging-haccp-compliance-guide)
