// lib/predict.ts — forward-simulate the twin (non-destructive) to project the
// battery/energy trajectory. This is the digital-twin superpower: predict a
// crisis before it happens, so the agent can act ahead of it rather than react.
// Mirrors the off-grid AI pattern (forecast PV + SoC -> predictive load-shed).

import type { Twin } from "./types";

export interface TrajectoryPoint {
  minutesAhead: number;
  soc: number;
  solarKw: number;
  loadKw: number;
}

export interface Prediction {
  horizonHours: number;
  cloudCover: number;
  loadKw: number;
  startSoC: number;
  socFloor: number;
  socAtHorizon: number;
  /** minutes until SoC first drops to 20% (null if it never does) */
  minsToCritical: number | null;
  /** minutes until SoC hits 0% (null if it never does) */
  minsToEmpty: number | null;
  trajectory: TrajectoryPoint[];
  summary: string;
}

function localHour(): number {
  const utcH = new Date().getUTCHours() + new Date().getUTCMinutes() / 60;
  return (utcH + 8) % 24; // Asia/Kuala_Lumpur ≈ UTC+8
}

function solarAt(hour: number, arrayKw: number, cloudCover: number): number {
  const daylight = Math.max(0, Math.sin(((hour - 7) / 12) * Math.PI));
  const clear = arrayKw * 0.85;
  const cloudFactor = 1 - 0.8 * cloudCover;
  return Math.max(0, clear * daylight * cloudFactor);
}

export function forwardSimulate(
  twin: Twin,
  { hours = 12, cloudCover }: { hours?: number; cloudCover?: number } = {}
): Prediction {
  const cc = cloudCover ?? twin.sim.cloudCover;
  const loadKw = twin.resources.energy.loadKw;
  const capacity = twin.resources.energy.batteryCapacityKwh;
  const arrayKw = twin.resources.energy.solarArrayKw;
  const startSoC = twin.resources.energy.batterySoC;

  const stepMin = 15;
  const steps = Math.round((hours * 60) / stepMin);
  const nowHour = localHour();

  let soc = startSoC;
  let socFloor = startSoC;
  let minsToCritical: number | null = null;
  let minsToEmpty: number | null = null;
  const trajectory: TrajectoryPoint[] = [{ minutesAhead: 0, soc, solarKw: solarAt(nowHour, arrayKw, cc), loadKw }];

  for (let i = 1; i <= steps; i++) {
    const minutesAhead = i * stepMin;
    const hour = (nowHour + minutesAhead / 60) % 24;
    const solarKw = solarAt(hour, arrayKw, cc);
    const netKw = solarKw - loadKw;
    soc = Math.min(100, Math.max(0, soc + (netKw * (stepMin / 60)) / capacity * 100));
    socFloor = Math.min(socFloor, soc);
    if (minsToCritical === null && soc <= 20) minsToCritical = minutesAhead;
    if (minsToEmpty === null && soc <= 0.5) minsToEmpty = minutesAhead;
    trajectory.push({
      minutesAhead,
      soc: Math.round(soc * 10) / 10,
      solarKw: Math.round(solarKw * 10) / 10,
      loadKw,
    });
  }

  const fmt = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
  let summary: string;
  if (startSoC <= 25) {
    summary = `Battery critically low at ${Math.round(startSoC)}%. Discretionary loads shed — running life-support only; recovery depends on solar returning.`;
  } else if (minsToCritical !== null) {
    const when = fmt(minsToCritical);
    summary =
      minsToCritical <= 120
        ? `Battery projected to hit the 20% critical threshold in ${when} at ${loadKw} kW — shed discretionary loads now.`
        : `Battery is fine for now, but projected to reach 20% in ${when} as solar falls overnight. Plan to shed discretionary loads before then.`;
  } else {
    summary = `Battery holds above 20% across the next ${hours}h (floor ${Math.round(socFloor)}%). No action needed.`;
  }

  return {
    horizonHours: hours,
    cloudCover: cc,
    loadKw,
    startSoC,
    socFloor: Math.round(socFloor * 10) / 10,
    socAtHorizon: Math.round(soc * 10) / 10,
    minsToCritical,
    minsToEmpty,
    trajectory,
    summary,
  };
}
