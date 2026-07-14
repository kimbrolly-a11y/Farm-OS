# FarmOS — Real-Sensor Integration Guide

**How the digital twin becomes a real farm.** FarmOS runs on a simulated sensor feed by
default. This guide shows how, when your hardware arrives, real sensors feed the **same twin**
the Claude agent already operates on — with **zero code changes**, one vertical at a time.

## The architecture (why it just works)

```
 real sensors ─ MQTT/Zigbee/Modbus/LoRaWAN ─►  Home Assistant  ─ REST /api/states ─►  FarmOS
 (DO, pH, NH3, temp, tank level, relays…)      (the device hub)     (5s poll)          integration
                                                                                        layer
                                                                                          │
                                              per-sensor router: fresh live value?  ──────┤
                                                    ├─ yes → use REAL value  (source: live)
                                                    └─ no  → simulate         (source: sim)
                                                                                          ▼
                                                              same twin → same Claude agent → same tools
```

- **Home Assistant is the single integration point.** It already speaks every farm protocol
  (MQTT, Zigbee, Z-Wave, Modbus, LoRaWAN via add-ons), so FarmOS talks to *one* API, not fifteen
  vendor silos. Each HA entity exposes a numeric `state` we map to a twin sensor.
- **Routing is per-sensor.** A sensor goes live only if it has a mapped `ha_entity` **and** a
  fresh reading. Everything else keeps simulating — so **Phase 2a = wire one vertical in HA and it
  goes live automatically** while the rest stay simulated.
- **Fail-safe.** If a live sensor drops out (offline > `INTEGRATION_STALE_MS`), FarmOS falls back
  to simulation and flags the device offline on `/integration`. The agent never loses its feed.

## Setup

1. **Stand up Home Assistant** on the on-site Raspberry Pi (or any host) and add your sensors so
   each reports a numeric state (e.g. `sensor.aquaponics_do` → `6.4`).
2. **Create a long-lived access token** in HA (Profile → Security → Long-lived access tokens).
3. **Configure FarmOS** — in `.env.local` (see `.env.example`):
   ```
   INTEGRATION_MODE=live
   HA_BASE_URL=http://homeassistant.local:8123
   HA_TOKEN=<your long-lived token>
   HA_POLL_MS=5000
   INTEGRATION_STALE_MS=30000
   ```
4. **Map sensors** — in `farm.config.yaml`, set each sensor's `ha_entity` to its HA entity id:
   ```yaml
   sensors:
     - id: fishtank-1
       metric: dissolved_oxygen
       unit: mg/L
       ha_entity: sensor.aquaponics_do      # ← the HA entity that reports this value
   ```
   (Assets already carry `ha_entity` for actuators — the same idea for writing back later.)
5. **Restart** the server. Open **`/integration`** — sensors with a live HA feed flip from
   **SIM → LIVE**, per vertical, in real time.

## Bringing it online, one vertical at a time (Phase 2a → 2f)

- **2a — Aquaponics:** map `dissolved_oxygen`, `ph`, `water_temp`, `ammonia` + the aerator/pump
  relays. Watch the agent hold DO in-band and pre-empt a low-DO event on **real** hardware.
- **2b — Energy + water:** Victron (via the HA Victron/MQTT integration) + tank/flow sensors →
  the crisis + offline demos become real, farm-wide.
- **2c–2f:** livestock wearables, vision, business systems, then a second farm (`farm2.yaml`).

## Actuators (writing back)

Reading is live today. To let the agent **act** on real hardware, the tool layer
(`lib/tools/actions.ts`) calls HA services (`POST /api/services/switch/turn_off` etc.) instead of
mutating the twin — guarded by the exact same `isProtected()` life-support checks and approval
gates already enforced. That's the Phase-2b write-path (kept behind the same tool interface).

## Verify

- `GET /api/integration` → JSON status (mode, live/simulated counts, per-vertical, per-device health).
- `/integration` page → the visual commissioning board.
- In sim mode everything reads `SIM`; nothing about the demo changes.
