// lib/types.ts — the digital-twin data model (CLAUDE.md §4)

export type Criticality = "life_support" | "important" | "discretionary";
export type OnOff = "on" | "off";
export type Severity = "critical" | "warning" | "info";
export type AlertChannel = "whatsapp" | "dashboard";

export interface Asset {
  id: string;
  verticalId: string;
  zoneId: string;
  type: string;
  criticality: Criticality;
  hardware?: string;
  protocol?: string;
  haEntity?: string;
  /** simulated electrical draw in watts — used by the load-shedding logic */
  powerDraw: number;
  state: OnOff;
}

export interface SensorSpec {
  id: string;
  verticalId: string;
  zoneId: string;
  metric: string;
  unit: string;
  product?: string;
  protocol?: string;
  haEntity?: string;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  verticalId: string;
  zoneId: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface Zone {
  id: string;
  verticalId: string;
  name: string;
  assetIds: string[];
  sensorIds: string[];
}

export interface Headline {
  label: string;
  value: number | string;
  unit: string;
}

export interface AiInsight {
  key: string;
  label: string;
  value: number;
  unit: string;
  level: "good" | "watch" | "risk";
}

export interface Vertical {
  id: string;
  name: string;
  status: "ok" | "warning" | "critical";
  zoneIds: string[];
  kpis: Record<string, string | number>;
  /** primary metric shown on the Command Center card */
  headline?: Headline;
  /** AI/CV-derived monitoring signals (disease risk, health score, ripeness…) */
  insights?: AiInsight[];
}

export interface WaterTank {
  id: string;
  product?: string;
  protocol?: string;
  haEntity?: string;
  capacityL: number;
  levelPct: number;
}

/** Generation mix beyond solar — biogas baseload, last-resort genset, optional wind. */
export interface EnergySources {
  biogasCapKw: number;
  biogasKw: number; // live output, tracks digester CH4
  gensetCapKw: number;
  gensetKw: number; // live output, 0 unless emergency
  gensetOn: boolean; // auto-start at SoC <= 10%, off again at 25%
  windCapKw: number;
  windKw: number; // live output (lowland Malaysia: modest)
  /** share of current generation from renewables (solar + biogas + wind), % */
  renewablePct: number;
  /** islanded — solar + battery + biogas cover the farm with genset as last resort */
  offGridCapable: boolean;
}

export interface Resources {
  energy: {
    solarArrayKw: number;
    solarInputKw: number; // live, from simulator
    batteryCapacityKwh: number;
    batterySoC: number; // percent
    loadKw: number; // live total draw from powered assets
    sources: EnergySources;
  };
  water: {
    tanks: WaterTank[];
    wellStatus: "idle" | "running";
  };
}

export interface AgentAction {
  id: string;
  timestamp: string;
  trigger: string;
  decision: string;
  reasoning: string;
  toolCalled: string;
  params: Record<string, unknown>;
  result: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: Severity;
  message: string;
  channel: AlertChannel;
  acknowledged: boolean;
  /** true while offline and the send is deferred */
  queued?: boolean;
}

export interface Task {
  id: string;
  timestamp: string;
  assignee: string;
  description: string;
  verticalId?: string;
  status: "open" | "done";
}

export interface LoadShedding {
  shedFirst: string[];
  shedNext: string[];
  neverShed: string[];
}

export interface Farm {
  name: string;
  areaAcres: number;
  location: { country: string; lat: number; lon: number; timezone: string };
}

export interface Twin {
  farm: Farm;
  online: boolean;
  simulated: boolean;
  resources: Resources;
  verticals: Vertical[];
  zones: Zone[];
  assets: Asset[];
  sensors: SensorSpec[];
  readings: SensorReading[];
  actions: AgentAction[];
  alerts: Alert[];
  tasks: Task[];
  loadShedding: LoadShedding;
  /** external cloud syncs deferred while offline; flushed on reconnect */
  syncQueue: Array<{ id: string; type: string; label: string; queuedAt: string }>;
  /** live simulator / weather state */
  sim: {
    tickCount: number;
    /** 0 (clear) .. 1 (overcast) — drives solar input; raised in the crisis demo */
    cloudCover: number;
    /** active demo scenario */
    scenario: "normal" | "crisis";
    /** autonomous mode — the agent runs itself on an interval */
    autopilot: boolean;
    lastTickAt: string | null;
  };
  lastSeededAt: string;
}
