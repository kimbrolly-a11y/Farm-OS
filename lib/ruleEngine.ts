// lib/ruleEngine.ts — deterministic operations logic. Runs when offline or when
// no ANTHROPIC_API_KEY is present. Applies the same priorities as the Claude
// agent (protect life-support, shed by the load_shedding ladder) and writes
// reasoning to the Activity Log, so the crisis + offline demos always work.

import { getTwin } from "./store";
import { getTwinForecast } from "./tools/getForecast";
import {
  createAlert,
  isProtected,
  scheduleIrrigation,
  shedLoad,
} from "./tools/actions";

export async function runRuleEngine(): Promise<{
  mode: string;
  summary: string;
  actionsBefore: number;
}> {
  const twin = getTwin();
  const before = twin.actions.length;
  const forecast = await getTwinForecast(twin);

  const cloudy =
    (forecast.current?.cloud_cover ?? twin.sim.cloudCover * 100) > 60;
  const soc = twin.resources.energy.batterySoC;
  const notes: string[] = [];

  // 1. Energy crisis — shed by the ladder, never touching never_shed.
  if (soc <= 30) {
    createAlert(
      "critical",
      `Battery at ${Math.round(soc)}% — entering load-shedding.`,
      `Battery SoC ${Math.round(soc)}% is below the 30% crisis threshold${
        cloudy ? " and the forecast is cloudy, so solar recovery is limited" : ""
      }.`
    );

    const shedList = [...twin.loadShedding.shedFirst];
    if (soc <= 20) shedList.push(...twin.loadShedding.shedNext);

    for (const id of shedList) {
      const asset = twin.assets.find((a) => a.id === id);
      if (!asset || asset.state === "off") continue;
      if (isProtected(twin, id)) continue; // safety belt
      shedLoad(
        id,
        `${asset.criticality} load; sheddable under the load-shedding ladder while battery is at ${Math.round(
          soc
        )}%. Life-support loads stay powered.`
      );
    }
    notes.push(`shed discretionary/important loads (battery ${Math.round(soc)}%)`);
  } else {
    notes.push(`battery healthy at ${Math.round(soc)}% — no shedding needed`);
  }

  // 2. Aquaponics dissolved oxygen — animals first.
  const aqua = twin.verticals.find((v) => v.id === "aquaponics");
  if (aqua?.headline && typeof aqua.headline.value === "number" && aqua.headline.value < 5) {
    createAlert(
      "warning",
      `Aquaponics dissolved O₂ low (${aqua.headline.value} mg/L).`,
      "Dissolved oxygen under 5 mg/L stresses fish; aerator is life-support and already protected — flagging for a manual check."
    );
    notes.push("flagged low aquaponics DO");
  }

  // 3. Irrigation — dry orchard + low rain probability.
  const orchard = twin.verticals.find((v) => v.id === "fruit_orchard");
  const rainProb = forecast.hourly?.precipitation_probability?.[0] ?? 0;
  if (
    orchard?.headline &&
    typeof orchard.headline.value === "number" &&
    orchard.headline.value < 30 &&
    rainProb < 40 &&
    soc > 30
  ) {
    scheduleIrrigation(
      "orchard-block-a",
      "05:00",
      4000,
      `Soil moisture ${orchard.headline.value}% with only ${rainProb}% rain probability; irrigate before the day heats up.`
    );
    notes.push("scheduled orchard irrigation");
  }

  const summary =
    `Rule engine (${twin.online ? "no API key" : "offline"}): ` + notes.join("; ") + ".";
  return { mode: twin.online ? "rules" : "offline-rules", summary, actionsBefore: before };
}
