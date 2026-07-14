// lib/integration/index.ts — the real-sensor integration layer.
//
// DORMANT BY DEFAULT → the app runs pure simulation exactly as before.
// When `INTEGRATION_MODE=live` and Home Assistant credentials are set, this polls
// HA (the on-site device hub that already speaks MQTT / Zigbee / Modbus / LoRaWAN)
// and feeds LIVE values into the SAME twin the simulator and the Claude agent use.
//
// Key property: routing is PER-SENSOR. A sensor uses its real feed only if it has
// a mapped `ha_entity` AND a fresh reading; otherwise it keeps simulating. So when
// your hardware arrives you can bring ONE vertical online (Phase 2a) — wire its
// sensors in Home Assistant, and they go live automatically while everything else
// stays simulated. No other code changes. If a live sensor drops out, it falls
// back to simulation and is flagged offline — the agent never loses its feed.

import type { SensorSpec, Twin } from "../types";

interface Cached {
  value: number;
  ts: number;
}
interface Device {
  online: boolean;
  lastSeen: number | null;
  entity?: string;
}

interface IntegrationState {
  enabled: boolean;
  mode: "sim" | "live";
  values: Map<string, Cached>; // sensorId -> latest live reading
  devices: Map<string, Device>; // sensorId -> health
  entityToSensor: Map<string, string>; // ha_entity -> sensorId
  poll?: ReturnType<typeof setInterval>;
  lastPollAt: number | null;
  lastError: string | null;
  polls: number;
}

const G = globalThis as typeof globalThis & { __FARMOS_INTEGRATION__?: IntegrationState };

function env(k: string): string | undefined {
  const v = process.env[k];
  return v && v.trim() ? v.trim() : undefined;
}
const POLL_MS = Number(env("HA_POLL_MS") ?? 5000);
const STALE_MS = Number(env("INTEGRATION_STALE_MS") ?? 30000);

/** Live integration is on only when explicitly enabled AND credentials exist. */
function isEnabled(): boolean {
  return env("INTEGRATION_MODE") === "live" && !!env("HA_BASE_URL") && !!env("HA_TOKEN");
}

function state(): IntegrationState {
  if (!G.__FARMOS_INTEGRATION__) {
    const enabled = isEnabled();
    G.__FARMOS_INTEGRATION__ = {
      enabled,
      mode: enabled ? "live" : "sim",
      values: new Map(),
      devices: new Map(),
      entityToSensor: new Map(),
      lastPollAt: null,
      lastError: null,
      polls: 0,
    };
  }
  return G.__FARMOS_INTEGRATION__;
}

function buildMap(twin: Twin, s: IntegrationState) {
  s.entityToSensor.clear();
  for (const sensor of twin.sensors) {
    if (sensor.haEntity) s.entityToSensor.set(sensor.haEntity, sensor.id);
  }
}

/** Poll Home Assistant /api/states and cache numeric values for mapped sensors. */
async function pollOnce(): Promise<void> {
  const s = state();
  if (!s.enabled) return;
  const base = env("HA_BASE_URL")!.replace(/\/$/, "");
  const token = env("HA_TOKEN")!;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), Math.max(2000, POLL_MS - 500));
  try {
    const r = await fetch(`${base}/api/states`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(`HA ${r.status}`);
    const states = (await r.json()) as Array<{ entity_id: string; state: string }>;
    const now = Date.now();
    for (const st of states) {
      const sensorId = s.entityToSensor.get(st.entity_id);
      if (!sensorId) continue;
      const num = parseFloat(st.state);
      if (Number.isNaN(num)) continue; // skip non-numeric (unavailable/on/off)
      s.values.set(sensorId, { value: num, ts: now });
      s.devices.set(sensorId, { online: true, lastSeen: now, entity: st.entity_id });
    }
    s.lastPollAt = now;
    s.lastError = null;
    s.polls += 1;
  } catch (e) {
    s.lastError = String(e).slice(0, 200);
  } finally {
    clearTimeout(t);
  }
}

/** Boot the integration. No-op (pure simulation) unless configured. Idempotent. */
export function startIntegration(twin: Twin): void {
  const s = state();
  s.enabled = isEnabled();
  s.mode = s.enabled ? "live" : "sim";
  buildMap(twin, s);
  if (!s.enabled) {
    console.log("[integration] disabled — pure simulation");
    return;
  }
  if (s.poll) return; // already running
  pollOnce();
  s.poll = setInterval(() => {
    pollOnce().catch(() => {});
  }, POLL_MS);
  console.log("[integration] live via Home Assistant @", POLL_MS, "ms");
}

/**
 * The routing seam. Returns a fresh live value for a sensor, or `null` to tell the
 * simulator to generate one. Marks a stale/absent device offline so device-health
 * reflects reality — while the agent keeps operating on the simulated fallback.
 */
export function readLiveValue(_twin: Twin, sensor: SensorSpec): number | null {
  const s = state();
  if (!s.enabled) return null;
  const c = s.values.get(sensor.id);
  if (!c) return null;
  if (Date.now() - c.ts > STALE_MS) {
    const d = s.devices.get(sensor.id);
    if (d) d.online = false; // gone stale → fall back to sim + flag offline
    return null;
  }
  return c.value;
}

/** Status snapshot for the /api/integration route and the commissioning view. */
export function integrationStatus(twin: Twin) {
  const s = state();
  const now = Date.now();
  const total = twin.sensors.length;
  let live = 0;
  let stale = 0;
  const perVertical: Record<string, { live: number; total: number }> = {};
  for (const sensor of twin.sensors) {
    perVertical[sensor.verticalId] ??= { live: 0, total: 0 };
    perVertical[sensor.verticalId].total += 1;
    const c = s.values.get(sensor.id);
    const fresh = !!c && now - c.ts <= STALE_MS;
    if (fresh) {
      live += 1;
      perVertical[sensor.verticalId].live += 1;
    } else if (sensor.haEntity && s.entityToSensor.has(sensor.haEntity)) {
      stale += 1;
    }
  }
  return {
    mode: s.mode,
    enabled: s.enabled,
    hub: s.enabled ? "home-assistant" : null,
    total,
    live,
    simulated: total - live,
    stale,
    mappedEntities: s.entityToSensor.size,
    pollMs: POLL_MS,
    staleMs: STALE_MS,
    lastPollAt: s.lastPollAt ? new Date(s.lastPollAt).toISOString() : null,
    lastError: s.lastError,
    perVertical,
    devices: [...s.devices.entries()].map(([sensorId, d]) => ({
      sensorId,
      entity: d.entity,
      online: d.online,
      lastSeen: d.lastSeen ? new Date(d.lastSeen).toISOString() : null,
    })),
  };
}
