"use client";

import { useEffect, useRef, useState } from "react";
import type { Twin } from "@/lib/types";

export interface HistoryPoint {
  t: number;
  soc: number;
  solar: number;
  load: number;
}

export interface TwinState {
  twin: Twin | null;
  history: HistoryPoint[];
  error: string | null;
  loading: boolean;
}

/** Polls /api/state and keeps a rolling window of energy history for sparklines. */
export function useTwin(intervalMs = 2000): TwinState & { refetch: () => void } {
  const [twin, setTwin] = useState<Twin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const historyRef = useRef<HistoryPoint[]>([]);
  const [, force] = useState(0);

  const fetchState = async () => {
    try {
      const r = await fetch("/api/state", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: Twin = await r.json();
      setTwin(data);
      setError(null);
      const h = historyRef.current;
      h.push({
        t: data.sim.tickCount,
        soc: data.resources.energy.batterySoC,
        solar: data.resources.energy.solarInputKw,
        load: data.resources.energy.loadKw,
      });
      if (h.length > 40) h.splice(0, h.length - 40);
      force((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return {
    twin,
    history: historyRef.current,
    error,
    loading,
    refetch: fetchState,
  };
}
