"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import SubscriptionCard from "../../components/subscriptionCard";
import CharityCard from "../../components/charityCard";
import WinningCards from "../../components/winningCards";

type Score = { id: string; score: number; played_on: string };

export default function Dashboard() {
  const router = useRouter();
  const [scores, setScores] = useState<Score[]>([]);
  const [score, setScore] = useState("");
  const [playedOn, setPlayedOn] = useState("");
  const [error, setError] = useState("");

  async function loadScores() {
    const { data } = await supabase
      .from("scores")
      .select("id, score, played_on")
      .order("played_on", { ascending: false });
    setScores(data ?? []);
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      loadScores();
    }
    init();
  }, []);

  async function addScore(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const value = Number(score);
    if (!Number.isInteger(value) || value < 1 || value > 45) {
      setError("Score 1 se 45 ke beech hona chahiye.");
      return;
    }

    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("scores").insert({
      user_id: data.user!.id,
      score: value,
      played_on: playedOn,
    });

    if (error) {
      setError(
        error.code === "23505"
          ? "Is date ka score pehle se hai. Usse edit ya delete karo."
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <SubscriptionCard />
        <CharityCard />
      </div>

      <section className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-xl font-semibold">Your last 5 scores</h2>

        <form onSubmit={addScore} className="mt-4 flex flex-wrap gap-3">
          <input
            type="number"
            placeholder="Score (1-45)"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
            className="w-36 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
          />
          <input
            type="date"
            value={playedOn}
            onChange={(e) => setPlayedOn(e.target.value)}
            required
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
          />
          <button className="rounded-lg bg-green-600 px-5 py-2 font-medium hover:bg-green-700">
            Add
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <ul className="mt-6 space-y-2">
          {scores.length === 0 && (
            <li className="text-gray-400">Abhi koi score nahi hai.</li>
          )}
          {scores.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3"
            >
              <span>
                <b>{s.score}</b>
                <span className="ml-3 text-sm text-gray-400">{s.played_on}</span>
              </span>
              <button
                onClick={() => deleteScore(s.id)}
                className="text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      <WinningCards />
    </main>
  );
}