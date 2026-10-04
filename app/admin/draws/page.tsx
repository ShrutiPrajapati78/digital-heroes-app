"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Tier = {
  match_type: number;
  tier_pool: number;
  winners: string[];
  per_winner: number;
  rolled_over: number;
};
type Result = {
  winning_numbers: number[];
  total_pool: number;
  tiers: Tier[];
  next_rollover: number;
};

export default function AdminDraws() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [drawType, setDrawType] = useState<"random" | "algorithm">("random");
  const [result, setResult] = useState<Result | null>(null);
  const [entries, setEntries] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function check() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return router.push("/login");
      const { data: p } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.user.id)
        .single();
      setAllowed(p?.role === "admin");
    }
    check();
  }, []);

  async function call(path: string, body: object) {
    const { data: s } = await supabase.auth.getSession();
    return fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s.session?.access_token}`,
      },
      body: JSON.stringify(body),
    });
  }

  async function simulate() {
    setBusy(true);
    setMessage("");
    const res = await call("/api/admin/draw/simulate", { drawType });
    if (!res.ok) {
      setBusy(false);
      const body = await res.json().catch(() => ({}));
      return setMessage(body.error ?? `Error ${res.status}`);
    }
    const body = await res.json();
    setBusy(false);
    setResult(body.result);
    setEntries(body.entriesCount);
  }

  async function publish() {
    if (!result) return;
    setBusy(true);
    const res = await call("/api/admin/draw/publish", {
      drawType,
      winningNumbers: result.winning_numbers,
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return setMessage(body.error ?? `Error ${res.status}`);
    }
    setMessage("Draw published!");
    setResult(null);
  }

  if (allowed === null) return <main className="p-8">Loading...</main>;
  if (!allowed) return <main className="p-8">Not authorized.</main>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Draw management</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={drawType}
          onChange={(e) => setDrawType(e.target.value as "random" | "algorithm")}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
        >
          <option value="random">Random</option>
          <option value="algorithm">Algorithm (weighted)</option>
        </select>
        <button
          onClick={simulate}
          disabled={busy}
          className="rounded-lg border border-green-600 px-5 py-2 hover:bg-green-600/10 disabled:opacity-50"
        >
          Simulate
        </button>
        {result && (
          <button
            onClick={publish}
            disabled={busy}
            className="rounded-lg bg-green-600 px-5 py-2 font-medium hover:bg-green-700 disabled:opacity-50"
          >
            Publish
          </button>
        )}
      </div>

      {message && <p className="mt-4 text-gray-300">{message}</p>}

      {result && (
        <section className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">
            Simulation only. Abhi kuch save nahi hua. Entries: {entries}
          </p>
          <div className="mt-3 flex gap-2">
            {result.winning_numbers.map((n) => (
              <span
                key={n}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 font-bold"
              >
                {n}
              </span>
            ))}
          </div>
          <p className="mt-4">Total pool: ₹{result.total_pool}</p>

          <ul className="mt-4 space-y-2">
            {result.tiers.map((t) => (
              <li key={t.match_type} className="rounded-lg bg-gray-800 px-4 py-3">
                <b>{t.match_type}-match</b> · pool ₹{t.tier_pool} · {t.winners.length}{" "}
                winner(s)
                {t.winners.length > 0 && <> · ₹{t.per_winner} each</>}
                {t.rolled_over > 0 && (
                  <span className="ml-2 text-yellow-400">
                    (₹{t.rolled_over} rolls over)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}