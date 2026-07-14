"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HospitalityReport } from "@/lib/hospitality";
import type { AttractionsReport } from "@/lib/attractions";
import type { GuestRequest, GuestBooking, GuestRequestType } from "@/lib/guest";
import { LiveCam } from "./LiveCam";

const REQUEST_TYPES: Array<{ type: GuestRequestType; label: string; emoji: string }> = [
  { type: "room-service", label: "Room service", emoji: "🛎️" },
  { type: "food-order", label: "Food order", emoji: "🍜" },
  { type: "amenity", label: "Towels & amenities", emoji: "🧺" },
  { type: "fault", label: "Report a fault", emoji: "🛠️" },
  { type: "other", label: "Other", emoji: "💬" },
];

const REQ_STATUS: Record<string, { label: string; color: string }> = {
  new: { label: "received", color: "var(--warn)" },
  "in-progress": { label: "on the way", color: "#3aa7ff" },
  done: { label: "done", color: "var(--accent)" },
  requested: { label: "requested", color: "var(--warn)" },
  confirmed: { label: "confirmed", color: "var(--accent)" },
};

interface Data {
  hospitality: HospitalityReport;
  attractions: AttractionsReport;
}

const CAMS = [
  { id: "dairy_cattle", name: "Bella & the herd", where: "Dairy barn", vital: "milking 2× daily" },
  { id: "dairy_goats", name: "Goat kids", where: "Goat barn", vital: "feeding 07:00 · 17:00" },
  { id: "poultry", name: "Hatchery", where: "Incubator room", vital: "37.5 °C — AI-protected" },
  { id: "horses", name: "Ponies", where: "Stables", vital: "rides Sat–Sun" },
];

const ADOPTABLES = [
  { id: "bella", name: "Bella", kind: "Dairy cow", rm: 250, emoji: "🐄", perk: "monthly milk-share + cam access" },
  { id: "biscuit", name: "Biscuit", kind: "Mini goat", rm: 120, emoji: "🐐", perk: "name on the barn + visits" },
  { id: "waddles", name: "Waddles", kind: "Khaki Campbell duck", rm: 60, emoji: "🦆", perk: "egg postcard every season" },
  { id: "clover", name: "Clover", kind: "Rabbit", rm: 60, emoji: "🐇", perk: "petting-zoo fast pass" },
];

export function GuestApp() {
  const [d, setD] = useState<Data | null>(null);
  const [room] = useState("Cabin 2");
  const [reqType, setReqType] = useState<GuestRequestType>("room-service");
  const [detail, setDetail] = useState("");
  const [sending, setSending] = useState(false);
  const [mine, setMine] = useState<{ requests: GuestRequest[]; bookings: GuestBooking[] }>({
    requests: [],
    bookings: [],
  });
  const [booked, setBooked] = useState<string | null>(null);

  const loadMine = async () => {
    try {
      const r = await fetch(`/api/guest/request?room=${encodeURIComponent(room)}`, { cache: "no-store" });
      if (r.ok) setMine(await r.json());
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/resort", { cache: "no-store" });
        if (r.ok) setD(await r.json());
      } catch {
        /* ignore */
      }
    };
    load();
    loadMine();
    const id = setInterval(() => {
      load();
      loadMine();
    }, 6000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitRequest() {
    if (!detail.trim()) return;
    setSending(true);
    await fetch("/api/guest/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ room, type: reqType, detail: detail.trim() }),
    });
    setDetail("");
    setSending(false);
    loadMine();
  }

  async function book(item: string) {
    setBooked(item);
    await fetch("/api/guest/book", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ room, item, pax: 2, when: "today" }),
    });
    loadMine();
    setTimeout(() => setBooked(null), 1800);
  }

  const openStays = d?.hospitality.tiers.filter((t) => t.unitsOpen > 0) ?? [];
  const activities = d?.attractions.attractions.filter((a) => a.status === "open").slice(0, 5) ?? [];

  return (
    <main className="min-h-screen bg-[--panel-2] py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-3 flex items-center justify-between px-2 text-xs text-[--muted]">
          <Link href="/dashboard" className="hover:text-[--text]">
            ← back to FarmOS (operator view)
          </Link>
          <span>guest PWA · stub</span>
        </div>

        {/* Phone surface */}
        <div className="overflow-hidden rounded-3xl border border-[--border] bg-[--bg] shadow-2xl">
          {/* App header */}
          <div className="border-b border-[--border] bg-[--panel] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  Crown <span className="text-[--accent]">Eagles</span>
                </div>
                <div className="text-xs text-[--muted]">Crown Eagles Eco Farm eco-farm resort · Malaysia</div>
              </div>
              <div className="flex gap-1.5">
                <Chip>📱 QR check-in</Chip>
                <Chip>💳 RM 182.50</Chip>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5">
            {/* Book a stay — photo + booking together, one card per tier */}
            <section>
              <SectionTitle>Book your stay</SectionTitle>
              <div className="space-y-3">
                {openStays.map((t) => {
                  const free = t.unitsOpen - t.occupied;
                  return (
                    <div
                      key={t.id}
                      className="overflow-hidden rounded-xl border border-[--border] bg-[--panel]"
                    >
                      <div className="relative h-28 w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={stayImage(t.id, t.name)}
                          alt={t.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
                          RM {t.ratePerNight}/night
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div>
                          <div className="text-sm font-medium">{t.name}</div>
                          <div className="text-xs text-[--muted]">
                            {free > 0 ? `${free} available tonight` : "fully booked tonight"}
                          </div>
                        </div>
                        <button
                          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${
                            free > 0
                              ? "bg-[--accent] text-white"
                              : "cursor-not-allowed bg-[--panel-2] text-[--muted]"
                          }`}
                        >
                          {free > 0 ? "Book" : "Waitlist"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Guest services — room service, food, amenities, faults */}
            <section>
              <SectionTitle>Guest services · {room}</SectionTitle>
              <div className="rounded-xl border border-[--border] bg-[--panel] p-3">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {REQUEST_TYPES.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => setReqType(t.type)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        reqType === t.type
                          ? "border-[--accent] bg-[--accent] text-white"
                          : "border-[--border] text-[--muted] hover:border-[--muted]"
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitRequest()}
                    placeholder={
                      reqType === "fault"
                        ? "e.g. aircon not cooling, tap dripping…"
                        : reqType === "food-order"
                          ? "e.g. 2× nasi lemak + fresh farm juice…"
                          : "e.g. 2 extra towels please…"
                    }
                    className="min-w-0 flex-1 rounded-lg border border-[--border] bg-[--bg] px-3 py-2 text-sm outline-none placeholder:text-[--muted] focus:border-[--accent]"
                  />
                  <button
                    onClick={submitRequest}
                    disabled={sending || !detail.trim()}
                    className="shrink-0 rounded-lg bg-[--accent] px-3.5 py-2 text-sm font-medium text-white disabled:opacity-40"
                  >
                    {sending ? "…" : "Send"}
                  </button>
                </div>
                {(mine.requests.length > 0 || mine.bookings.length > 0) && (
                  <div className="mt-3 space-y-1.5 border-t border-[--border] pt-2.5">
                    {mine.requests.slice(0, 3).map((r) => {
                      const st = REQ_STATUS[r.status];
                      return (
                        <div key={r.id} className="flex items-center gap-2 text-[11px]">
                          <span
                            className="shrink-0 rounded-full px-1.5 py-0.5 font-medium"
                            style={{ color: st.color, background: `color-mix(in srgb, ${st.color} 14%, transparent)` }}
                          >
                            {st.label}
                          </span>
                          <span className="truncate text-[--muted]">
                            {REQUEST_TYPES.find((t) => t.type === r.type)?.emoji} {r.detail} → {r.assignee}
                          </span>
                        </div>
                      );
                    })}
                    {mine.bookings.slice(0, 3).map((b) => {
                      const st = REQ_STATUS[b.status];
                      return (
                        <div key={b.id} className="flex items-center gap-2 text-[11px]">
                          <span
                            className="shrink-0 rounded-full px-1.5 py-0.5 font-medium"
                            style={{ color: st.color, background: `color-mix(in srgb, ${st.color} 14%, transparent)` }}
                          >
                            {st.label}
                          </span>
                          <span className="truncate text-[--muted]">
                            🎟️ {b.item} · {b.pax} pax · {b.when}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Farm map */}
            <section>
              <SectionTitle>Farm map</SectionTitle>
              <Link
                href="/map"
                className="block overflow-hidden rounded-xl border border-[--border] bg-[--panel] transition-colors hover:border-[--accent]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/map/map_illustrated.jpg"
                  alt="Crown Eagles Eco Farm farm map"
                  loading="lazy"
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="block px-3 py-2 text-center text-[10px] text-[--muted]">
                  ● you are here — tap to explore the full farm map →
                </span>
              </Link>
            </section>

            {/* Animal cams */}
            <section>
              <SectionTitle>Live animal cams</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {CAMS.map((c) => (
                  <div key={c.id} className="rounded-xl border border-[--border] bg-[--panel] p-2">
                    <LiveCam verticalId={c.id} label={c.where} className="mb-2 h-24 w-full" />
                    <div className="px-1 pb-1">
                      <div className="text-xs font-medium">{c.name}</div>
                      <div className="text-[10px] text-[--muted]">
                        {c.where} · {c.vital}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Adopt an animal */}
            <section>
              <SectionTitle>Adopt an animal</SectionTitle>
              <div className="space-y-2">
                {ADOPTABLES.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--panel] px-4 py-2.5"
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">
                        {a.name} <span className="font-normal text-[--muted]">· {a.kind}</span>
                      </div>
                      <div className="truncate text-[10px] text-[--muted]">{a.perk}</div>
                    </div>
                    <button className="shrink-0 rounded-full border border-[--accent] px-3 py-1 text-xs font-medium text-[--accent]">
                      RM {a.rm}/yr
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Today's activities */}
            <section>
              <SectionTitle>Today at the farm</SectionTitle>
              <div className="space-y-1.5">
                {activities.map((x) => (
                  <div
                    key={x.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-[--panel] px-3 py-2 text-xs"
                  >
                    <span className="min-w-0 truncate">{x.name}</span>
                    <span className="ml-auto shrink-0 text-[--muted]">RM {x.priceRm}</span>
                    <button
                      onClick={() => book(x.name)}
                      disabled={booked !== null}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                        booked === x.name
                          ? "bg-[--accent] text-white"
                          : "border border-[--accent] text-[--accent] hover:bg-[--accent] hover:text-white"
                      } disabled:opacity-60`}
                    >
                      {booked === x.name ? "Booked ✓" : "Book"}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-[10px] text-[--muted]">
                itinerary personalised by the same AI that runs the farm 🌱
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[--muted]">{children}</h2>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[--panel-2] px-2 py-1 text-[10px] font-medium">{children}</span>
  );
}

// map a lodging tier to its lead photo in /public/img/stays
function stayImage(id: string, name: string): string {
  const k = `${id} ${name}`.toLowerCase();
  if (/glamp|dome|tent|grove/.test(k)) return "/img/stays/glamping_dome.jpg";
  if (/bungalow|villa|garden/.test(k)) return "/img/stays/cabin_cluster.jpg";
  if (/cabin|chalet|airbnb/.test(k)) return "/img/stays/cabin_exterior.jpg";
  return "/img/stays/hotel_exterior.jpg";
}
