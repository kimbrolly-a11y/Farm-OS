// lib/guest.ts — guest services backend: in-room requests (room service, food
// orders, amenities, fault reports) and tour/activity bookings. Every request
// is routed to the right staff member and lands on the task board, so the ops
// side (/tasks, /staff) sees it instantly.

import type { Task, Twin } from "./types";
import { STAFF } from "./staff";

export type GuestRequestType =
  | "room-service"
  | "food-order"
  | "amenity"
  | "fault"
  | "other";

export interface GuestRequest {
  id: string;
  timestamp: string;
  room: string;
  type: GuestRequestType;
  detail: string;
  status: "new" | "in-progress" | "done";
  assignee: string;
}

export interface GuestBooking {
  id: string;
  timestamp: string;
  room: string;
  item: string;
  pax: number;
  when: string;
  status: "requested" | "confirmed";
}

interface GuestStore {
  requests: GuestRequest[];
  bookings: GuestBooking[];
}

const g = globalThis as typeof globalThis & { __guestStore?: GuestStore };
function store(): GuestStore {
  if (!g.__guestStore) g.__guestStore = { requests: [], bookings: [] };
  return g.__guestStore;
}

export const REQUEST_META: Record<
  GuestRequestType,
  { label: string; emoji: string; staffId: string }
> = {
  "room-service": { label: "Room service", emoji: "🛎️", staffId: "hosp" },
  "food-order": { label: "Food order", emoji: "🍜", staffId: "chef" },
  amenity: { label: "Towels & amenities", emoji: "🧺", staffId: "hosp" },
  fault: { label: "Report a fault", emoji: "🛠️", staffId: "maint" },
  other: { label: "Other request", emoji: "💬", staffId: "hosp" },
};

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** File a guest request → routed staff task + tracked for the guest app. */
export function createGuestRequest(
  twin: Twin,
  room: string,
  type: GuestRequestType,
  detail: string
): GuestRequest {
  const meta = REQUEST_META[type] ?? REQUEST_META.other;
  const staff = STAFF.find((s) => s.id === meta.staffId) ?? STAFF[0];
  const req: GuestRequest = {
    id: id("greq"),
    timestamp: new Date().toISOString(),
    room,
    type,
    detail,
    status: "new",
    assignee: staff.name,
  };
  store().requests.unshift(req);

  const task: Task = {
    id: id("task"),
    timestamp: req.timestamp,
    assignee: staff.name,
    description: `${meta.emoji} Guest · ${meta.label} · ${room}: ${detail}`,
    verticalId: "lodging",
    status: "open",
  };
  twin.tasks.unshift(task);
  return req;
}

/** Book a tour/activity/service → hospitality task + tracked booking. */
export function createGuestBooking(
  twin: Twin,
  room: string,
  item: string,
  pax: number,
  when: string
): GuestBooking {
  const booking: GuestBooking = {
    id: id("gbook"),
    timestamp: new Date().toISOString(),
    room,
    item,
    pax,
    when,
    status: "requested",
  };
  store().bookings.unshift(booking);

  const hosp = STAFF.find((s) => s.id === "hosp") ?? STAFF[0];
  const task: Task = {
    id: id("task"),
    timestamp: booking.timestamp,
    assignee: hosp.name,
    description: `🎟️ Guest booking · ${item} · ${pax} pax · ${when} · ${room} — confirm & schedule`,
    verticalId: "lodging",
    status: "open",
  };
  twin.tasks.unshift(task);
  return booking;
}

export function listGuest(room?: string): GuestStore {
  const s = store();
  if (!room) return s;
  return {
    requests: s.requests.filter((r) => r.room === room),
    bookings: s.bookings.filter((b) => b.room === room),
  };
}

/** Ops: advance a request's status (new → in-progress → done). */
export function advanceRequest(requestId: string): GuestRequest | null {
  const r = store().requests.find((x) => x.id === requestId);
  if (!r) return null;
  r.status = r.status === "new" ? "in-progress" : "done";
  return r;
}
