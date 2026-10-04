"use client";

import { useEffect, useState } from "react";
import { HeartHandshake, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

type Charity = { id: string; name: string };

export default function CharityCard() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [charityId, setCharityId] = useState("");
  const [percent, setPercent] = useState(10);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from("charities").select("id, name");
      setCharities(c ?? []);

      const { data: u } = await supabase.auth.getUser();
      const { data: p } = await supabase
        .from("profiles")
        .select("charity_id, charity_percent")
        .eq("id", u.user!.id)
        .single();
      if (p) {
        setCharityId(p.charity_id ?? "");
        setPercent(p.charity_percent);
      }
    }
    load();
  }, []);

  async function save() {
    setMessage("");
    if (percent < 10 || percent > 100) {
      setOk(false);
      setMessage("Minimum contribution is 10%.");
      return;
    }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ charity_id: charityId || null, charity_percent: percent })
      .eq("id", u.user!.id);
    setOk(!error);
    setMessage(error ? error.message : "Saved!");
  }

  return (
    <section className="glass card-hover h-full rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
          <HeartHandshake size={20} />
        </span>
        <h2 className="text-lg font-semibold">Your charity</h2>
      </div>

      <select
        value={charityId}
        onChange={(e) => setCharityId(e.target.value)}
        className="input mt-5"
      >
        <option value="">Select a charity</option>
        {charities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="mt-5 flex items-end justify-between">
        <label className="text-sm text-gray-400">Contribution (min 10%)</label>
        <span className="gradient-text text-3xl font-extrabold">{percent}%</span>
      </div>
      <input
        type="range"
        min={10}
        max={100}
        step={1}
        value={percent}
        onChange={(e) => setPercent(Number(e.target.value))}
        className="mt-2 w-full accent-green-500"
      />

      <button
        onClick={save}
        className="mt-5 w-full rounded-full bg-green-500 py-2.5 font-semibold text-black transition hover:bg-green-400"
      >
        Save
      </button>

      {message && (
        <p
          className={`animate-pop mt-3 flex items-center gap-2 text-sm ${
            ok ? "text-green-400" : "text-red-300"
          }`}
        >
          {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message}
        </p>
      )}
    </section>
  );
}