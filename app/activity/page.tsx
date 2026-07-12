import Link from "next/link";

export default function ActivityPlaceholder() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Agent Activity Log</h1>
      <p className="mt-2 text-[--muted]">
        Coming in build step 4 — every agent decision, its reasoning, and the
        tool it called.
      </p>
    </main>
  );
}
