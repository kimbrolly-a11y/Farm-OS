// Temporary seed-summary page — proves the twin loads from farm.config.yaml.
// Replaced by the Command Center dashboard in build step 3.
import { getTwin } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const twin = getTwin();
  const { farm, resources, verticals, assets, sensors } = twin;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-[--text]">
          FarmOS · {farm.name}
        </h1>
        <p className="mt-1 text-[--muted]">
          {farm.areaAcres}-acre off-grid eco-farm · {farm.location.country} (
          {farm.location.lat}, {farm.location.lon})
        </p>
        <p className="mt-1 text-sm text-[--muted]">
          Seeded {new Date(twin.lastSeededAt).toLocaleString()} ·{" "}
          {twin.simulated ? "simulated sensors" : "live (Home Assistant)"}
        </p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Verticals" value={verticals.length} />
        <Stat label="Assets" value={assets.length} />
        <Stat label="Sensors" value={sensors.length} />
        <Stat label="Zones" value={twin.zones.length} />
        <Stat
          label="Battery SoC"
          value={`${resources.energy.batterySoC}%`}
        />
        <Stat
          label="Live load"
          value={`${resources.energy.loadKw} kW`}
        />
        <Stat
          label="Solar array"
          value={`${resources.energy.solarArrayKw} kW`}
        />
        <Stat
          label="Water tanks"
          value={resources.water.tanks.length}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Verticals</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {verticals.map((v) => {
            const vAssets = assets.filter((a) => a.verticalId === v.id);
            const lifeSupport = vAssets.filter(
              (a) => a.criticality === "life_support"
            ).length;
            return (
              <div
                key={v.id}
                className="rounded-lg border border-[--border] bg-[--panel] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{v.name}</span>
                  <span className="text-xs text-[--muted]">{v.id}</span>
                </div>
                <p className="mt-2 text-sm text-[--muted]">
                  {v.zoneIds.length} zone{v.zoneIds.length !== 1 ? "s" : ""} ·{" "}
                  {vAssets.length} asset{vAssets.length !== 1 ? "s" : ""}
                  {lifeSupport > 0 && (
                    <span className="text-[--accent]">
                      {" "}
                      · {lifeSupport} life-support
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-8 text-sm text-[--muted]">
        Raw snapshot:{" "}
        <a className="text-[--accent] underline" href="/api/state">
          /api/state
        </a>
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[--border] bg-[--panel] p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-[--muted]">
        {label}
      </div>
    </div>
  );
}
