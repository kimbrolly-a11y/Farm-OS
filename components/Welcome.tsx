"use client";

import Link from "next/link";
import { useTwin } from "./useTwin";
import { VerticalArt } from "./VerticalArt";
import { VERTICAL_VISUALS } from "@/lib/verticalVisuals";

export function Welcome() {
  const { twin } = useTwin(3000);
  const verticalIds = Object.keys(VERTICAL_VISUALS);

  const stats = twin
    ? [
        { label: "verticals", value: twin.verticals.length },
        { label: "assets", value: twin.assets.length },
        { label: "sensors", value: twin.sensors.length },
        { label: "acres", value: twin.farm.areaAcres },
      ]
    : [];

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* photoreal farm hero — golden-hour aerial with holographic HUD */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/img/deck/hero.jpg')" }}
      />
      {/* forest wash so the text stays readable and the world stays green */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(10,26,17,0.94) 0%, rgba(10,26,17,0.82) 45%, rgba(10,26,17,0.45) 100%), linear-gradient(to top, rgba(10,26,17,0.95) 0%, transparent 45%)",
        }}
      />
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-[--accent] opacity-[0.12] blur-[100px]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="mb-2 inline-flex items-center gap-2 self-start rounded-full border border-[--border] px-3 py-1 text-xs text-[--muted]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[--accent]" />
          Autonomous · off-grid · Malaysia
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-semibold tracking-tight sm:text-6xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/farmos-mark.svg" alt="" className="h-12 w-12 sm:h-14 sm:w-14" />
          <span>
            Farm<span className="text-[--accent]">OS</span>
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[--muted]">
          The operating system for a{" "}
          <span className="text-[--text]">one-person farm company</span>. A live
          digital twin of a 100-acre eco-farm, run by an autonomous Claude agent
          that senses, predicts, and acts across every vertical — even through a
          power or internet outage.
        </p>

        {/* live stats */}
        {stats.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[--border] bg-[--panel] px-4 py-3"
              >
                <div className="text-2xl font-semibold">{s.value}</div>
                <div className="text-xs uppercase tracking-wide text-[--muted]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* the concept in one strip */}
        <div className="mt-8 grid gap-2 sm:grid-cols-4">
          {[
            { icon: "📡", title: "Sense", text: "one live twin — every animal, crop, tank & watt" },
            { icon: "🔮", title: "Predict", text: "simulates hours ahead; acts before a crisis" },
            { icon: "🤖", title: "Act", text: "Claude decides & operates; every action logged with reasoning" },
            { icon: "♻️", title: "Sustain", text: "off-grid energy & water · zero-waste loops · resort on top" },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-[--border] bg-[--panel] px-4 py-3">
              <div className="text-sm font-semibold">
                {c.icon} {c.title}
              </div>
              <div className="mt-0.5 text-xs leading-snug text-[--muted]">{c.text}</div>
            </div>
          ))}
        </div>

        {/* vertical teaser strip — every icon carries its name */}
        <div className="mt-10">
          <div className="mb-3 text-xs uppercase tracking-wide text-[--muted]">
            {verticalIds.length} operating verticals — livestock to lodging
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
            {verticalIds.map((id) => {
              const vis = VERTICAL_VISUALS[id];
              return (
                <Link
                  key={id}
                  href={`/vertical/${id}`}
                  title={vis?.tagline}
                  className="group rounded-xl border border-[--border] bg-[--panel] p-1.5 pb-2 transition-colors hover:border-[--muted]"
                >
                  <VerticalArt
                    id={id}
                    className="aspect-square w-full transition-transform group-hover:scale-105"
                  />
                  <div
                    className="mt-1.5 truncate text-center text-[11px] font-medium leading-tight"
                    style={{ color: vis?.color }}
                  >
                    {vis?.name ?? id}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/verticals"
            className="rounded-xl bg-[--accent] px-5 py-3 font-medium text-black transition-opacity hover:opacity-90"
          >
            Explore the farm →
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-[--border] px-5 py-3 font-medium transition-colors hover:border-[--muted]"
          >
            Open command center
          </Link>
          <Link
            href="/guest"
            className="rounded-xl border border-[--border] px-5 py-3 font-medium text-[--muted] transition-colors hover:border-[--muted] hover:text-[--text]"
          >
            📱 Guest app
          </Link>
        </div>
      </div>
    </main>
  );
}
