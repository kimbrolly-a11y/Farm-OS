# FarmOS — Download & Install Checklist

*Direct links, grouped by when you need them. Tick as you go. I can't silently install third-party software on your computer/phone/Pi (each needs your account + device), so this is your one-click list — but I **have** surfaced the Claude connectors in chat for you to connect with a click.*

---

## ✅ Right now — for the hackathon (do these first, ~15 min)

**Claude connectors (click "Connect" on the cards I sent in chat, or in claude.ai → Settings → Connectors):**
- [ ] Twilio — https://claude.ai (Settings → Connectors → Twilio) — WhatsApp/SMS alerts
- [ ] Weather — NO connector needed; use Open-Meteo (free, no key): https://open-meteo.com · Malaysia official: https://developer.data.gov.my/realtime-api/weather
- [ ] Google Calendar — bookings
- [ ] Stripe — payments (optional, for the commerce angle)
- [ ] Notion — SOPs / ops board

**Build tools:**
- [ ] base44 — https://base44.com (or use Claude Code + Next.js if hand-coding)
- [ ] Node.js LTS (if hand-coding) — https://nodejs.org/en/download
- [ ] Vercel (fast deploy) — https://vercel.com/signup
- [ ] AWS account (sponsor; for prize eligibility + deploy) — https://aws.amazon.com

**Phone:**
- [ ] WhatsApp Business — App Store / Google Play (search "WhatsApp Business")

---

## 🏡 Farm — Phase 1 (cheap, on-site, mostly free)

**Automation hub & sensors (runs on a Raspberry Pi / mini-PC on the farm):**
- [ ] Home Assistant — https://www.home-assistant.io/installation/
- [ ] Node-RED — https://nodered.org/docs/getting-started/
- [ ] Mosquitto (MQTT broker) — https://mosquitto.org/download/
- [ ] InfluxDB — https://www.influxdata.com/downloads/
- [ ] Grafana — https://grafana.com/grafana/download

**Energy / water / irrigation:**
- [ ] Solar Assistant — https://solar-assistant.io (runs on a Pi; one-time cost)
- [ ] OpenSprinkler — https://opensprinkler.com (irrigation controller — hardware + firmware)
- [ ] Ecowitt weather/soil station + app — https://www.ecowitt.com

**Farm records:**
- [ ] farmOS — https://farmos.org/hosting/ (self-host or hosted)
- [ ] LiteFarm — https://www.litefarm.org (free hosted)

**Business / guests / retail:**
- [ ] Loyverse POS (restaurant + farm shop) — https://loyverse.com (free; iOS/Android)
- [ ] Wave (accounting) — https://www.waveapps.com
- [ ] Obsidian (SOPs, local-first) — https://obsidian.md/download

---

## 🚀 Farm — Phase 2 (scaling / formalizing the company)

- [ ] ThingsBoard (serious IoT fleet) — https://thingsboard.io/docs/user-guide/install/installation-options/
- [ ] Beds24 (channel manager: Airbnb + Booking.com sync) — https://beds24.com
- [ ] Zoho Books (Malaysia LHDN e-invoicing — verify current tier) — https://www.zoho.com/my/books/
- [ ] Odoo or ERPNext (all-in-one ERP, self-hostable) — https://www.odoo.com/page/download · https://frappe.io/erpnext
- [ ] QGIS (map the 100 acres) — https://qgis.org/download/
- [ ] Google Earth Pro (free) — https://www.google.com/earth/versions/#earth-pro

---

## Notes on hardware you'll also need (Phase 1)
- A **Raspberry Pi 4/5** or small mini-PC to run Home Assistant + the local stack on-site.
- **LoRaWAN gateway + sensors** (or Zigbee/Wi-Fi sensors) for soil moisture, tank levels, coop temp across 100 acres.
- Your **solar inverter/battery** brand determines the monitoring tool (Victron → VRM; most others → Solar Assistant).

*Want me to turn this into an installable setup script for the Raspberry Pi stack (Home Assistant + Node-RED + InfluxDB + Grafana + Mosquitto via Docker Compose)? I can generate that file for you.*
