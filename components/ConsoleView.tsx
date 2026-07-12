"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Turn {
  role: "you" | "farm";
  text: string;
  mode?: "claude" | "rules";
  actions?: number;
}

const SUGGESTIONS = [
  "What's at risk overnight?",
  "How's the battery?",
  "Why is margin where it is?",
  "Is the water safe?",
  "Who's arriving today?",
  "How green are we running?",
];

export function ConsoleView() {
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "farm",
      text: "Ask me anything about the farm — energy, money, water, risks, guests. If you ask me to act, I will (life-support excepted).",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    setTurns((t) => [...t, { role: "you", text: question }]);
    setBusy(true);
    try {
      const r = await fetch("/api/console", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (r.ok) {
        const j = await r.json();
        setTurns((t) => [
          ...t,
          { role: "farm", text: j.answer, mode: j.mode, actions: j.actionsAdded },
        ]);
      } else {
        setTurns((t) => [...t, { role: "farm", text: "Something went wrong — try again." }]);
      }
    } catch {
      setTurns((t) => [...t, { role: "farm", text: "Console unreachable — is the farm offline?" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-4">
        <h1 className="text-2xl font-semibold">Farm Console</h1>
        <p className="text-[--muted]">
          Talk to the brain that runs the place. Questions get answers; instructions get actions —
          all logged with reasoning.
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-[--border] bg-[--panel] p-4">
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.role === "you" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                t.role === "you"
                  ? "bg-[--accent] text-white"
                  : "border border-[--border] bg-[--panel-2]"
              }`}
            >
              {t.text}
              {t.role === "farm" && t.mode && (
                <div className="mt-1.5 text-[10px] uppercase tracking-wide opacity-60">
                  {t.mode === "claude" ? "🤖 claude fable 5" : "⚙️ rule engine (no key)"}
                  {t.actions ? ` · ${t.actions} action${t.actions === 1 ? "" : "s"} taken → activity log` : ""}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-[--border] bg-[--panel-2] px-4 py-2.5 text-sm text-[--muted]">
              <span className="animate-pulse">thinking about your farm…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            disabled={busy}
            className="rounded-full border border-[--border] px-3 py-1 text-xs text-[--muted] transition-colors hover:border-[--accent] hover:text-[--accent] disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the farm…"
          className="flex-1 rounded-xl border border-[--border] bg-[--panel] px-4 py-3 text-sm outline-none placeholder:text-[--muted] focus:border-[--accent]"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-[--accent] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </main>
  );
}
