// lib/sync.ts — the twin-fidelity layer (HANDOFF §10 P1 #1).
// A digital twin is only as good as its bond with the physical farm. This module
// derives a per-device sync state (freshness of each sensor's last reading;
// hardware binding of each actuator via its ha_entity) and a farm-wide fidelity
// summary — the "148/148 devices in sync" number that makes the simulated→real
// hardware swap (integration.simulated: false) visible and credible.

import type { Twin } from "./types";

export type SyncState = "in_sync" | "stale" | "offline";

export interface DeviceSync {
  id: string;
  kind: "sensor" | "actuator";
  verticalId: string;
  zoneId: string;
  label: string;
  haEntity?: string;
  protocol?: string;
  state: SyncState;
  lastSyncAt: string | null;
}

export interface SyncReport {
  mode: "simulated" | "live";
  hub: string;
  sensorsInSync: number;
  sensorsTotal: number;
  actuatorsMapped: number;
  actuatorsTotal: number;
  devicesInSync: number;
  devicesTotal: number;
  fidelityPct: number;
  devices: DeviceSync[];
}

const STALE_MS = 15_000; // > 5 tick intervals
const OFFLINE_MS = 60_000;

export function getSyncReport(twin: Twin): SyncReport {
  const now = Date.now();

  // one pass over readings → last timestamp per sensor
  const lastSeen = new Map<string, string>();
  for (const r of twin.readings) lastSeen.set(r.sensorId, r.timestamp);

  const devices: DeviceSync[] = [];

  for (const s of twin.sensors) {
    const ts = lastSeen.get(s.id) ?? null;
    const age = ts ? now - new Date(ts).getTime() : Infinity;
    devices.push({
      id: s.id,
      kind: "sensor",
      verticalId: s.verticalId,
      zoneId: s.zoneId,
      label: s.metric,
      haEntity: s.haEntity,
      protocol: s.protocol,
      state: age <= STALE_MS ? "in_sync" : age <= OFFLINE_MS ? "stale" : "offline",
      lastSyncAt: ts,
    });
  }

  for (const a of twin.assets) {
    // an actuator is "in sync" when its hardware binding exists and the farm
    // link is up — commands via setActuator/shedLoad reach a real ha_entity
    const mapped = !!a.haEntity;
    devices.push({
      id: a.id,
      kind: "actuator",
      verticalId: a.verticalId,
      zoneId: a.zoneId,
      label: a.type,
      haEntity: a.haEntity,
      protocol: a.protocol,
      state: mapped ? (twin.online ? "in_sync" : "stale") : "offline",
      lastSyncAt: twin.sim.lastTickAt,
    });
  }

  const sensors = devices.filter((d) => d.kind === "sensor");
  const actuators = devices.filter((d) => d.kind === "actuator");
  const sensorsInSync = sensors.filter((d) => d.state === "in_sync").length;
  const actuatorsMapped = actuators.filter((d) => d.state !== "offline").length;
  const devicesInSync = devices.filter((d) => d.state === "in_sync").length;

  return {
    mode: twin.simulated ? "simulated" : "live",
    hub: "Home Assistant",
    sensorsInSync,
    sensorsTotal: sensors.length,
    actuatorsMapped,
    actuatorsTotal: actuators.length,
    devicesInSync,
    devicesTotal: devices.length,
    fidelityPct: devices.length
      ? Math.round((devicesInSync / devices.length) * 100)
      : 100,
    devices,
  };
}
