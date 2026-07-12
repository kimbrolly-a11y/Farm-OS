// lib/tools/getForecast.ts — free weather, no API key (Open-Meteo).
// Falls back to the last cached result when offline (drives the resilience demo).
// Cache is pinned on globalThis so it survives Next hot-reload and is available
// to the offline scenario.

declare global {
  // eslint-disable-next-line no-var
  var __FARMOS_FORECAST__: ForecastResult | null | undefined;
}

export interface ForecastResult {
  current?: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    cloud_cover: number;
  };
  hourly?: {
    time: string[];
    precipitation_probability: number[];
    shortwave_radiation: number[];
  };
  daily?: {
    time: string[];
    precipitation_sum: number[];
    temperature_2m_max: number[];
  };
  offline?: boolean;
  cached?: boolean;
  note?: string;
}

export async function getForecast(
  lat = 3.14,
  lon = 101.69,
  { allowNetwork = true }: { allowNetwork?: boolean } = {}
): Promise<ForecastResult> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover` +
    `&hourly=precipitation_probability,shortwave_radiation` +
    `&daily=precipitation_sum,temperature_2m_max` +
    `&timezone=Asia/Kuala_Lumpur`;

  if (!allowNetwork) {
    return (
      globalThis.__FARMOS_FORECAST__ ?? {
        offline: true,
        note: "no cached forecast yet",
      }
    );
  }

  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
    globalThis.__FARMOS_FORECAST__ = (await r.json()) as ForecastResult;
    return globalThis.__FARMOS_FORECAST__!;
  } catch {
    return (
      globalThis.__FARMOS_FORECAST__
        ? { ...globalThis.__FARMOS_FORECAST__, cached: true }
        : { offline: true, note: "no cached forecast yet" }
    );
  }
}
