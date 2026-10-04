"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  upcoming_events: string | null;
};

export default function CharityProfile() {
  const { id } = useParams<{ id: string }>();
  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("charities")
      .select("id, name, description, image_url, category, upcoming_events")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setCharity(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!charity) return <main className="p-8">Charity nahi mili.</main>;

  const events = (charity.upcoming_events ?? "")
    .split(".")
    .map((e) => e.trim())
    .filter(Boolean);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/charities" className="text-sm text-green-500 hover:underline">
        ← All charities
      </Link>

      <div className="mt-6 flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/50 to-gray-900">
        {charity.image_url ? (
          <img src={charity.image_url} alt={charity.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-6xl">💚</span>
        )}
      </div>

      {charity.category && <p className="mt-6 text-sm text-green-500">{charity.category}</p>}
      <h1 className="mt-1 text-3xl font-bold">{charity.name}</h1>
      <p className="mt-4 text-gray-300">{charity.description}</p>

      {events.length > 0 && (
        <section className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-xl font-semibold">Upcoming events</h2>
          <ul className="mt-3 space-y-2 text-gray-300">
            {events.map((e) => (
              <li key={e}>📅 {e}</li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/signup"
        className="mt-8 inline-block rounded-lg bg-green-600 px-6 py-3 font-medium hover:bg-green-700"
      >
        Subscribe and support this cause
      </Link>
    </main>
  );
}