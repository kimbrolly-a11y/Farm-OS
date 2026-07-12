import Link from "next/link";

export default function ControlsPlaceholder() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Controls</h1>
      <p className="mt-2 text-[--muted]">
        Coming in build step 4 — &quot;Run agent now&quot; plus the crisis and
        offline demo toggles.
      </p>
    </main>
  );
}
