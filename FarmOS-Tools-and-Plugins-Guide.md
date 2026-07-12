# FarmOS — Tools, Plugins & Apps Guide

*Two stacks: what to grab for the 9-hour hackathon **today**, and what to run the real 100-acre farm in Malaysia **long-term**. Legend: 🆓 free · 🔓 open-source · 🏠 self-hostable / local-first (works off-grid) · 🇲🇾 Malaysia-relevant.*

> **Naming heads-up:** there's already a well-known open-source project literally called **farmOS** (farmos.org). Great software — but you'll want a distinct product name to avoid confusion (e.g. "AcreOS", "TerraOS", or your own brand). Noting it here because it also belongs on your shortlist below.

---

## PART A — Hackathon build stack (install today)

These are Claude plugins/connectors you already have access to. Install only what you'll show.

| Tool | Role in the build | Notes |
|---|---|---|
| **base44** | Fastest path to a working agentic app: entities (your digital twin), backend functions (agent tools), built-in AI agents, connectors. | Best solo-in-9-hrs choice. Maps 1:1 to the "One Person Company" theme. 🆓 tier |
| **Claude Code / Agent SDK** | Hand-code a Next.js app + Claude supervisor agent if you'd rather own a deployable repo. | Alternative lane to base44 — pick one. |
| **Vercel** | One-command live URL for the demo. | 🆓 Use if AWS deploy runs long. |
| **Twilio — WhatsApp** | The agent messages you/guests live: *"Coop 3 at 34°C, fans on."* | **Highest-impact demo add.** 🇲🇾 WhatsApp is universal in Malaysia. |
| **Airtable** | Instant data backend / ops board if you skip a real DB. | 🆓 tier · optional shortcut |
| **Wix** | If you want a quick guest-facing booking/marketing site alongside the app. | Optional |
| **Figma** | Slide/UI mockups for the pitch. | Optional |

### Claude connectors to enable (found in your registry — click to connect in claude.ai)

Now that connector search is on, these are the directly-relevant ones I surfaced. Connect them from **claude.ai → Settings → Connectors** (I've also sent suggestion cards in chat):

| Connector | Use it for |
|---|---|
| **Vaisala Xweather** | Real-time/forecast/historical weather → irrigation, harvest, solar-shedding decisions. The realistic data source for the demo *and* the farm. |
| **Twilio** | WhatsApp/SMS alerts from the agent (the demo showstopper). |
| **Google Calendar** | Lodging + experience bookings the agent reads/writes. |
| **Stripe** | Deposits and surplus-produce sales → the "agent commerce" angle. |
| **Notion** | SOPs, ops board, and the replication playbook. |
| **Shopify** | Farm-shop e-commerce for produce/honey/eggs. |

Also in the registry if you want them: **AWS Marketplace, Slack, Todoist, Zoho CRM**.

---

## PART B — Farm production stack (long-term, replicable)

Organized by function. I've **biased toward free / open-source / self-hostable** because that's what makes the farm genuinely sovereign — these run on a Raspberry Pi or mini-PC on-site and keep working when the internet drops, which matches your off-grid Malaysia reality.

### 1. Farm management (records, planning, the "system of record")
| App | Why | Flags |
|---|---|---|
| **farmOS** (farmos.org) | The leading open-source FMIS: crop plans, livestock, logs, maps, sensor data, an API. Self-host on your own box. Strong candidate for the real backbone. | 🆓 🔓 🏠 |
| **LiteFarm** | Open-source, built for diversified/regenerative multi-crop farms — fits your many verticals and eco story. | 🆓 🔓 |
| **Farmbrite** | Commercial all-in-one (crops + livestock + inventory + sales) if you'd rather buy than host. | paid |
| **AgriWebb** | Livestock-first record-keeping (poultry/petting zoo/animals). | paid |

### 2. IoT / sensors / automation (the nervous system)
| App | Why | Flags |
|---|---|---|
| **Home Assistant** | The hub. Runs on a Pi, thousands of device integrations, local-first automations, dashboards. Your off-grid control brain. | 🆓 🔓 🏠 |
| **ThingsBoard** (Community Ed.) | Serious IoT platform: device management, rule engine, telemetry dashboards; has a smart-irrigation blueprint. Scales as you add sensors across 100 acres. | 🆓 🔓 🏠 |
| **Node-RED** | Visual flow logic — the "glue" wiring sensors → decisions → actuators. Pairs with Home Assistant. | 🆓 🔓 🏠 |
| **Mosquitto (MQTT)** | Lightweight messaging backbone all the sensors publish to. | 🆓 🔓 🏠 |
| **InfluxDB + Grafana** | Time-series database + beautiful dashboards for energy/water/soil/coop trends. | 🆓 🔓 🏠 |

### 3. Energy & water (life-support monitoring)
| App | Why | Flags |
|---|---|---|
| **Solar Assistant** | Popular off-grid inverter/battery monitor; runs on a Pi, works with most inverter brands, local dashboard. | paid (one-time), 🏠 |
| **Victron VRM** (+ Cerbo GX) | If you buy Victron solar/battery gear — excellent monitoring, open-source friendly, integrates with Home Assistant. | 🏠-capable |
| **OpenSprinkler** | Open-source, weather-aware irrigation controller. Zones your drip/misting by soil moisture + rain. | 🔓 🏠 |
| **Ecowitt** weather station | Affordable on-site weather + soil-moisture sensors; feeds irrigation and harvest decisions locally. | 🏠 |

### 4. Guests, lodging & experiences (revenue engine)
| App | Why | Flags |
|---|---|---|
| **Beds24** | Channel manager + PMS + booking engine — syncs Airbnb, Booking.com, and direct bookings into one calendar (kills double-bookings). | paid (cheap) 🇲🇾 |
| **QloApps** | Open-source hotel/PMS if you prefer self-hosting the lodging side. | 🆓 🔓 🏠 |
| **WhatsApp Business** | Guest comms, confirmations, enquiries — free and expected in Malaysia. | 🆓 🇲🇾 |

### 5. Retail, restaurant & payments
| App | Why | Flags |
|---|---|---|
| **Loyverse POS** | Free POS for the restaurant + farm shop; inventory, works offline on a tablet, multi-store. Ideal for a small Malaysian operation. | 🆓 🏠(offline) 🇲🇾 |
| **Square** | Alternative POS + payments + online store if you want hardware and card processing. | paid hardware |

### 6. Accounting, inventory & the "back office"
| App | Why | Flags |
|---|---|---|
| **Wave** | Free accounting + invoicing for a lean start. | 🆓 |
| **Zoho Books** | Cheap, supports **Malaysia LHDN e-invoicing** (check current tier) — worth it as you formalize the company. | paid 🇲🇾 |
| **Odoo** or **ERPNext** | Open-source ERP that can unify inventory + POS + accounting + CRM + HR in one self-hosted system. Heavier, but this is the "run the whole company from one place" option — very on-theme for a One Person Company. | 🆓 🔓 🏠 |

### 7. Land, mapping & planning
| App | Why | Flags |
|---|---|---|
| **QGIS** | Free GIS to map the 100 acres — zones, verticals, water flow, drainage, planting plans. Feeds farmOS. | 🆓 🔓 🏠 |
| **Google Earth Pro** | Quick free aerial planning and area measurement. | 🆓 |

### 8. Knowledge, SOPs & replication (so it can be franchised)
| App | Why | Flags |
|---|---|---|
| **Notion** or **Obsidian** | Your operating manual, SOPs per vertical, and the replication playbook a second farm would clone. Obsidian is local-first. | 🆓 · Obsidian 🏠 |

---

## How the pieces fit (the real-farm architecture)

```
 Sensors (Ecowitt, inverter, tank/soil probes)
        │  MQTT
        ▼
 Home Assistant / ThingsBoard  ── Node-RED logic ──►  actuators (pumps, fans, valves, OpenSprinkler)
        │  telemetry
        ▼
 InfluxDB ──► Grafana dashboards        farmOS (records/planning)      Solar Assistant (energy)
        │
        ▼
 YOUR FarmOS agent layer (Claude)  ── reads all of the above, decides, alerts via WhatsApp/Twilio
        │
        ▼
 Business apps: Beds24 (bookings) · Loyverse (POS) · Odoo/Wave (accounting) · Notion (SOPs)
```

Your hackathon build is the **agent layer** in the middle — the brain that sits on top of these open-source tools. That's the smart positioning: you're not rebuilding Home Assistant or a POS, you're building the **one-person-company intelligence** that orchestrates them. It demos as a product today and becomes the real farm's controller later.

---

## Priority order (what to actually get first)

**For the hackathon (today):** base44 (or Next.js) → Twilio WhatsApp → Vercel. That's it.

**For the farm, phase 1 (first months, cheap):** Home Assistant on a Pi + Ecowitt weather/soil + Solar Assistant + Loyverse POS + WhatsApp Business + farmOS for records. All free or one-time cost, all run on-site.

**For the farm, phase 2 (scaling / formalizing):** ThingsBoard for serious sensor fleets, Beds24 for multi-channel bookings, Odoo/ERPNext or Zoho for accounting + Malaysia e-invoicing, QGIS for land planning — then your FarmOS agent layer tying it together and replicating to farm #2.

---

## Sources
- [farmOS — open-source farm management](https://farmos.org/)
- [LiteFarm — sustainable farm management](https://www.litefarm.org/)
- [Best Open Source & Free Farm Management Software 2026 (SoftwareSuggest)](https://www.softwaresuggest.com/farm-management-software/free-open-source-softwares)
- [ThingsBoard — open-source IoT platform](https://thingsboard.io/) · [Smart Irrigation use case](https://thingsboard.io/use-cases/smart-irrigation/)
- [Building a local PV monitoring system with Home Assistant + Grafana + InfluxDB](https://community.home-assistant.io/t/building-an-local-pv-monitoring-system-with-home-assistant-grafana-influxdb/244127)
- [Victron Energy — open source](https://www.victronenergy.com/live/open_source:start)
- [OpenSprinkler — open-source irrigation controller](https://opensprinkler.com/) · [Soil-moisture irrigation with Ecowitt + OpenSprinkler](https://community.openhab.org/t/soil-moisture-based-irrigation-automation-with-ecowitt-and-opensprinkler/169252)
- [Beds24 — channel manager & PMS](https://beds24.com/)
- [Loyverse — free POS](https://loyverse.com/)
- [Best Free & Open Source Hotel Software 2026 (HotelMinder)](https://www.hotelminder.com/list-of-the-best-free-and-open-source-hotel-software)
