# FarmOS — Hardware Integration Map

*Every aspect of every vertical, mapped to **real products you can buy today** and the exact path by which the FarmOS agent controls them. Nothing here is hypothetical — these are off-the-shelf sensors, controllers, and robots with proven Home Assistant / MQTT / LoRaWAN integrations.*

---

## How it all connects (the "click of a finger" architecture)

```
 FIELD DEVICES                     HUB (on-site, local-first)            BRAIN
 ───────────                       ────────────────────────              ─────
 WiFi devices  ─┐
 Zigbee sensors ┼─► Home Assistant (Raspberry Pi 5 / mini-PC) ──REST/WebSocket──► FarmOS agent (Claude)
 LoRaWAN field ─┤     • every device = an "entity"                          • reads state
   sensors ─────┘     • Node-RED = local automation + offline fallback      • decides
 I2C/ESP32 probes ──► ESPHome ──► Home Assistant                            • calls a tool →
 Modbus gear ───────► Modbus integration ──► Home Assistant                   HA service →
 Solar/battery ─────► Victron Cerbo GX ──MQTT──► Home Assistant               real device moves
```

**The key idea:** you never integrate hardware into FarmOS one-by-one. Everything lands in **Home Assistant** (thousands of built-in integrations) or **ThingsBoard** (for big LoRaWAN fleets). FarmOS talks to *one* API. A tool call like `setActuator('aqua1_aerator','on')` becomes a Home Assistant service call that flips a real **Shelly relay**. `shedLoad('cabin1_ac')` turns off a real air-conditioner. Because HA runs on-site, it all keeps working with no internet — that's your sovereignty/offline story, in hardware.

**Legend:** 🔌 WiFi · 📡 LoRaWAN · 🔗 Zigbee · 🧩 I2C/ESP32 (ESPHome) · ⚙️ Modbus · 🤖 robot

---

## Shared infrastructure (serves every vertical — build first)

| Aspect | Real products | Link | FarmOS tool |
|---|---|---|---|
| Solar + battery monitor | Victron **Cerbo GX** + SmartShunt + MultiPlus-II; or **Solar Assistant** on a Pi | 🔌/⚙️ MQTT → HA | `getFarmState()` reads `battery_soc`, `solar_input` |
| Load switching (shed/restore) | **Shelly Pro** relays, **Sonoff** on ESPHome | 🔌 | `shedLoad()` / `restoreLoad()` |
| Water tank levels | **Dragino LDDS75** ultrasonic, **Milesight EM500-UDL** | 📡 | `getFarmState()` tank levels |
| Well / pump control | **Grundfos SQFlex** solar pump + Shelly relay | 🔌 | `setActuator('well_pump',…)` |
| On-site weather | **Ecowitt Wittboy WS90**, **Davis Vantage Pro2** | 🔌 | supplements Open-Meteo `getForecast()` |
| Connectivity | Starlink (primary) + **Dragino LPS8v2** LoRaWAN gateway + local WiFi | — | — |
| Security / CCTV | **Reolink** or **Ubiquiti** cameras, LoRaWAN PIR | 🔌/📡 | `createAlert()` on motion/intrusion |

---

## Per-vertical map — every aspect

Each vertical below lists what to **sense**, what to **automate/actuate**, applicable **robots**, the **business software**, and the **FarmOS tools** it exposes.

### 1. Poultry
- **Sense:** coop temp + humidity (**Ecowitt WN31** / **Aqara** 🔗), water level, feed level, egg count, ammonia/air quality (**Sensirion SEN5x** 🧩), predator motion (**Reolink** 🔌).
- **Automate:** auto coop door (**ChickenGuard Premium** / **Run-Chicken** 🔌), exhaust/cooling fans (**Shelly** relay 🔌), auto feeder & waterer (relay 🔌), heat lamp / **cabinet incubator** with temp controller 🔌.
- **Robots:** 🤖 coop-cleaning / litter-turning units are emerging; start with automated door + feeder.
- **Software:** flock/health records in **farmOS** or **AgriWebb**; egg sales via **Loyverse**.
- **FarmOS tools:** `setActuator(coop1_door|fans|feeder)`, `createAlert` (heat/predator), life-support = fans + incubator.

### 2. Aquaponics
- **Sense:** **dissolved oxygen, pH, water temp** (**Atlas Scientific EZO-DO / EZO-pH** probes on ESP32 🧩), ammonia/nitrate (ISE or test), tank level, flow.
- **Automate:** aeration pump + circulation pump (**Shelly** relays 🔌 — both life-support), **dosing pumps** for pH correction (**Atlas EZO-PMP** / **Kamoer** 🧩), automatic **fish feeder** 🔌.
- **Robots:** 🤖 robotic tank skimmers/cleaners optional; auto-feeder is the practical "robot".
- **Software:** water-quality logs in Grafana; fish/plant cycle in farmOS.
- **FarmOS tools:** `setActuator(aerator|pump|doser|feeder)`, DO/pH thresholds → `createAlert`; aerator+pump = **never shed**.

### 3. Hydroponics
- **Sense:** **pH + EC** (**Atlas EZO-pH/EC** or **Bluelab** 🧩), water temp, humidity, CO₂ (**Sensirion SCD4x** 🧩), light (PAR), reservoir level.
- **Automate:** nutrient + pH **dosing pumps** (Atlas/Kamoer 🧩), **LED grow lights** on relay 🔌, circulation pump, greenhouse vents/fans.
- **Robots:** 🤖 **FarmBot Genesis** (open-source CNC robot — seeds, waters, weeds beds via HTTP API); **Tertill** weeding robot.
- **Software:** crop schedule + yield in farmOS/LiteFarm.
- **FarmOS tools:** `setActuator(doser|lights|farmbot)`, `scheduleIrrigation`, EC/pH drift → `createAlert`.

### 4. Fruit Orchard
- **Sense:** **soil moisture + EC** (**SenseCAP S2105** / **Dragino SE01-LB** 📡), canopy temp, rainfall (shared weather station), trunk/dendrometer optional.
- **Automate:** zoned **drip irrigation** (**OpenSprinkler** / **Rachio** + **Netafim** lines 🔌), frost/heat misting.
- **Robots:** 🤖 **Husqvarna Automower** (orchard-floor mowing, native HA), robotic harvest assist is early-stage.
- **Software:** block/phenology + harvest windows in farmOS; GPS harvest tracking.
- **FarmOS tools:** `scheduleIrrigation(orchard_valve_a)`, soil-moisture + forecast → skip-watering logic.

### 5. Airbnb Lodging
- **Sense:** occupancy (booking sync), room temp/humidity, energy per unit (**Shelly EM** 🔌), door/smart lock, leak sensors.
- **Automate:** **smart AC** (**Sensibo** / Shelly 🔌), **solar water heater** + relay backup, smart locks (self check-in), lighting scenes.
- **Robots:** 🤖 **robot vacuum** (Roborock, HA-integrated) for turnovers.
- **Software:** **Beds24** channel manager (Airbnb/Booking sync); guest WhatsApp via Twilio.
- **FarmOS tools:** `shedLoad(cabin_ac|heater)` (discretionary), pre-arrival climate prep, leak → `createAlert`.

### 6. Restaurant
- **Sense:** **cold-room + freezer temps** (**Ecowitt WN30** probe / Zigbee 🔗 — life-support), power draw, grease-trap/exhaust, gas leak.
- **Automate:** walk-in chiller + **blast chiller** on monitored relays 🔌, exhaust hood, kitchen lighting.
- **Robots:** 🤖 optional service/runner robots (later); dishwashing automation.
- **Software:** **Loyverse POS** (offline-capable), menu tied to live harvest inventory.
- **FarmOS tools:** cold-chain temp breach → `createAlert(critical, whatsapp)`; cold storage = **never shed**.

### 7. Petting Zoo
- **Sense:** barn temp/humidity, water trough level, animal-health/movement (**smaXtec** / ear-tag sensors), gate/enclosure status, visitor-area air.
- **Automate:** auto waterers (relay 🔌), fans/misters, gate locks, **hand-wash/hygiene station** monitoring.
- **Robots:** 🤖 automated feeders; robotic manure scrapers (dairy-style) optional.
- **Software:** animal health/vaccination logs (farmOS/AgriWebb); vet reminders.
- **FarmOS tools:** `setActuator(water|fans)`, health-log reminders, hygiene-station alerts (public-health critical).

### 8. Palm Oil
- **Sense:** on-site **weather** (**Ecowitt WS90** 🔌 — rain, wind, solar, UV), soil moisture per block (📡), FFB harvest logging (GPS/mobile).
- **Automate:** block irrigation (dry spells), mill/collection-point sensors ⚙️ Modbus.
- **Robots:** 🤖 harvest-assist and autonomous field transport are emerging; start with GPS harvest tracking + drone imagery (**DJI Agras/Mavic**) for canopy health.
- **Software:** MSPO/MPOB compliance records; harvest-round scheduling.
- **FarmOS tools:** harvest-round optimization, byproduct routing to `recycling` (biochar/biogas).

### 9. Recycling & Resource Recovery
- **Sense:** **biogas methane %** + digester level/temp (⚙️ Modbus CH4 sensor), BSF-bin temp (🔗), compost temp/moisture, waste-stream weights.
- **Automate:** digester mixing/valves, compost aeration blowers (relay 🔌), **biochar kiln** temp control.
- **Robots:** 🤖 sorting automation (later); BSF harvesting rigs.
- **Software:** diversion-rate reporting; feeds the circular-loop routing.
- **FarmOS tools:** methane/temp thresholds → `createAlert`, route outputs (feed/energy/fertilizer) to other verticals.

### 10. Beekeeping
- **Sense:** **hive weight, temp, humidity, sound** (**BroodMinder** scale + TH 📡/BLE; **Apic.ai** entrance counter), apiary weather.
- **Automate:** minimal by design; hive-alert notifications; electric fencing for predators (relay 🔌).
- **Robots:** 🤖 none practical yet — bees do the work; drones for remote apiary checks.
- **Software:** hive inspection logs; pollination scheduling synced to orchard bloom.
- **FarmOS tools:** hive weight drop / temp anomaly → `createAlert`; pollination task scheduling.

---

## Integration recipe — turning a device into a FarmOS action (repeatable for every item above)

1. **Connect the device to Home Assistant** (WiFi/Zigbee auto-discover; LoRaWAN via the Dragino gateway + ThingsBoard/HA; I2C probes via an **ESP32 running ESPHome**).
2. **Note its entity id** (e.g. `switch.aqua1_aerator`, `sensor.hydro1_ph`) — this is exactly the `ha_entity` field already in `farm.config.yaml`.
3. **In FarmOS**, the tool maps 1:1:
   ```js
   // setActuator tool → real Home Assistant service call
   await fetch(`${HUB_API}/services/switch/turn_on`, {
     method: 'POST',
     headers: { Authorization: `Bearer ${HA_TOKEN}` },
     body: JSON.stringify({ entity_id: asset.ha_entity })   // e.g. switch.aqua1_aerator
   });
   ```
4. **Set `simulated: false`** in `farm.config.yaml`. Same agent, same code — now moving real hardware. That's the "click of a finger": the hackathon demo and the live farm run identical logic.

---

## Phased buying plan (don't buy it all at once)

- **Phase 0 — hackathon:** nothing to buy. `simulated: true` generates readings; the app + agent are fully demoable.
- **Phase 1 — prove one loop (~RM few k):** Raspberry Pi 5 + Home Assistant, a few **Shelly** relays, one **Atlas Scientific** pH/DO kit on ESP32 for aquaponics, an **Ecowitt** weather+soil station, **ChickenGuard** door. Flip aquaponics + poultry to live.
- **Phase 2 — scale the field:** **Dragino LPS8v2** LoRaWAN gateway + **SenseCAP/Dragino** soil sensors across orchard/palm; **OpenSprinkler** irrigation; **Victron/Solar Assistant** energy; **Beds24 + Loyverse** on the business side.
- **Phase 3 — robots & automation:** **FarmBot** on hydro beds, **Husqvarna Automower** on grounds, dosing-pump automation, drone imagery for palm/orchard.

---

## Sources
- [Atlas Scientific — EZO pH/EC/DO/ORP probes & embedded circuits](https://atlas-scientific.com/embedded-solutions/) · [AquaPi — Atlas + ESPHome + Home Assistant](https://github.com/TheRealFalseReality/aquapi)
- [Seeed SenseCAP S2104/S2105 — LoRaWAN soil moisture/temp/EC](https://parleylabs.com/sensecap-s2104-lorawan-soil-moisture-and-temperature-sensor/) · [Dragino SE01/SE02-LB soil sensors](https://www.dragino.com/products/agriculture-weather-station/item/277-se01-lb-ls.html)
- [FarmBot — open-source CNC farming robot](https://farm.bot/) · [FarmBot on GitHub](https://github.com/farmbot)
- [ChickenGuard — automatic coop door](https://www.chickenguard.com/)
- [Shelly + Home Assistant integration guide (2026)](https://joinhomeshift.com/home-assistant-shelly) · [Victron Cerbo GX + Home Assistant](https://diysolarforum.com/threads/my-victron-cerbo-gx-home-assistant-integration.101852/)
- [OpenSprinkler — open-source irrigation controller](https://opensprinkler.com/)
- [Best LoRaWAN sensors for agriculture (2026 guide)](https://onlycaptions.com/best-lorawan-sensors-for-agriculture/)
