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
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-[--accent] opacity-[0.12] blur-[100px]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="mb-2 inline-flex items-center gap-2 self-start rounded-full border border-[--border] px-3 py-1 text-xs text-[--muted]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[--accent]" />
          Autonomous · off-grid · Malaysia
        </div>

        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Farm<span className="text-[--accent]">OS</span>
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

        {/* vertical teaser strip */}
        <div className="mt-10">
          <div className="mb-3 text-xs uppercase tracking-wide text-[--muted]">
            {verticalIds.length} operating verticals — livestock to lodging
          </div>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
            {verticalIds.map((id) => (
              <Link key={id} href={`/vertical/${id}`}>
                <VerticalArt id={id} className="aspect-square transition-transform hover:scale-105" />
              </Link>
            ))}
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
