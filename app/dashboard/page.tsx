"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Trash2, Plus, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import SubscriptionCard from "../../components/subscriptionCard";
import CharityCard from "../../components/charityCard";
import WinningsCard from "../../components/winningCards";
import Reveal from "../../components/reveal";
import Skeleton from "../../components/skeleton";

type Score = { id: string; score: number; played_on: string };

export default function Dashboard() {
  const router = useRouter();
  const [scores, setScores] = useState<Score[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [score, setScore] = useState("");
  const [playedOn, setPlayedOn] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  async function loadScores() {
    const { data } = await supabase
      .from("scores")
      .select("id, score, played_on")
      .order("played_on", { ascending: false });
    setScores(data ?? []);
    setLoadingScores(false);
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, subscription_status")
        .eq("id", data.user.id)
        .single();
      setName(p?.full_name ?? "");
      setStatus(p?.subscription_status ?? "");
      loadScores();
    }
    init();
  }, []);

  async function addScore(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const value = Number(score);
    if (!Number.isInteger(value) || value < 1 || value > 45) {
      setError("Score must be between 1 and 45.");
      return;
    }

    setAdding(true);
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("scores").insert({
      user_id: data.user!.id,
      score: value,
      played_on: playedOn,
    });
    setAdding(false);

    if (error) {
      setError(
        error.code === "23505"
          ? "A score for this date already exists. Edit or delete it."
          : error.message
      );
      return;
    }
    setScore("");
    setPlayedOn("");
    loadScores();
  }

  async function deleteScore(id: string) {
    await supabase.from("scores").delete().eq("id", id);
    loadScores();
  }

  const eligible = status === "active" && scores.length >= 3;
  const reason =
    status !== "active"
      ? "Activate a subscription to join the next draw."
      : "Add at least 3 scores to join the next draw.";

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <Reveal>
        <p className="text-sm font-medium text-green-400">Dashboard</p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
          Welcome back{name ? `, ${name.split(" ")[0]}` : ""} 👋
        </h1>
      </Reveal>

      {status && !loadingScores && (
        <div
          className={`animate-pop mt-6 flex items-center gap-3 rounded-2xl border px-5 py-4 ${
            eligible
              ? "border-green-500/40 bg-green-500/10 text-green-300"
              : "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
          }`}
        >
          {eligible ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
          <p className="text-sm sm:text-base">
            {eligible ? "You are in the next draw. Good luck!" : reason}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Reveal>
          <SubscriptionCard />
        </Reveal>
        <Reveal delay={120}>
          <CharityCard />
        </Reveal>
      </div>

      <Reveal className="mt-5">
        <section className="glass rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
                <Target size={20} />
              </span>
              <h2 className="text-lg font-semibold">Your last 5 scores</h2>
            </div>

            <div className="flex items-center gap-1.5" title={`${scores.length} of 5 scores`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`h-2.5 w-7 rounded-full transition-colors ${
                    i < scores.length ? "bg-green-400" : "bg-white/10"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-gray-400">{scores.length}/5</span>
            </div>
          </div>

          <form onSubmit={addScore} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="number"
              placeholder="Score (1-45)"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
              className="input"
            />
            <input
              type="date"
              value={playedOn}
              onChange={(e) => setPlayedOn(e.target.value)}
              required
              className="input"
            />
            <button
              disabled={adding}
              className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400 disabled:opacity-60"
            >
              {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Add
            </button>
          </form>

          {error && (
            <p className="animate-pop mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <ul className="mt-6 space-y-3">
            {loadingScores && (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            )}

            {!loadingScores && scores.length === 0 && (
              <li className="rounded-xl border border-dashed border-white/15 p-8 text-center text-gray-400">
                No scores yet. Add your first Stableford score above.
              </li>
            )}

            {scores.map((s, i) => (
              <li
                key={s.id}
                style={{ animationDelay: `${i * 80}ms` }}
                className="animate-pop rounded-xl bg-white/5 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-lg font-bold text-black">
                      {s.score}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(`${s.played_on}T00:00:00`).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteScore(s.id)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Delete score"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="animate-grow h-full origin-left rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
                    style={{
                      width: `${(s.score / 45) * 100}%`,
                      animationDelay: `${i * 80 + 150}ms`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal className="mt-5">
        <WinningsCard />
      </Reveal>
    </main>
  );
}