"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Charity = { id: string; name: string };

export default function CharityCard() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [charityId, setCharityId] = useState("");
  const [percent, setPercent] = useState(10);
  const [message, setMessage] = useState("");

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
      setMessage("Minimum contribution 10% hai.");
      return;
    }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ charity_id: charityId || null, charity_percent: percent })
      .eq("id", u.user!.id);
    setMessage(error ? error.message : "Saved!");
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-xl font-semibold">Your charity</h2>

      <select
        value={charityId}
        onChange={(e) => setCharityId(e.target.value)}
        className="mt-4 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
      >
        <option value="">Select a charity</option>
        {charities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label className="mt-4 block text-sm text-gray-400">
        Contribution (% of subscription, minimum 10)
      </label>
      <input
        type="number"
        min={10}
        max={100}
        value={percent}
        onChange={(e) => setPercent(Number(e.target.value))}
        className="mt-1 w-32 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
      />

      <button
        onClick={save}
        className="mt-4 block rounded-lg bg-green-600 px-5 py-2 font-medium hover:bg-green-700"
      >
        Save
      </button>
      {message && <p className="mt-3 text-sm text-gray-300">{message}</p>}
    </section>
  );
}