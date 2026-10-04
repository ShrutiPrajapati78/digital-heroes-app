"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  category: string | null;
};

export default function Charities() {
  const [list, setList] = useState<Charity[]>([]);

  useEffect(() => {
    supabase
      .from("charities")
      .select("id, name, description, image_url, is_featured, category")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setList(data ?? []));
  }, []);

  const featured = list.find((c) => c.is_featured);
  const others = list.filter((c) => c.id !== featured?.id).slice(0, 4);

  return (
    <section id="charities" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold">
        Causes You Can <span className="text-green-500">Support</span>
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-gray-400">
        Pick a charity when you subscribe. A part of your subscription goes
        straight to them every month.
      </p>

      {featured && (
        <Link
          href={`/charities/${featured.id}`}
          className="mt-12 grid overflow-hidden rounded-2xl border border-green-700/40 bg-gray-900 transition hover:border-green-500 md:grid-cols-2"
        >
          <div className="flex h-56 items-center justify-center bg-gradient-to-br from-green-900/60 to-gray-900 md:h-auto">
            {featured.image_url ? (
              <img
                src={featured.image_url}
                alt={featured.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-6xl">💚</span>
            )}
          </div>
          <div className="p-8">
            <span className="rounded-full bg-green-600/20 px-3 py-1 text-xs text-green-400">
              Featured charity
            </span>
            <h3 className="mt-4 text-2xl font-bold">{featured.name}</h3>
            <p className="mt-3 text-gray-400">{featured.description}</p>
            <p className="mt-6 text-green-500">Learn more →</p>
          </div>
        </Link>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {others.map((c) => (
          <Link
            key={c.id}
            href={`/charities/${c.id}`}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-green-600"
          >
            {c.category && <p className="text-xs text-green-500">{c.category}</p>}
            <h3 className="mt-2 text-lg font-semibold">{c.name}</h3>
            <p className="mt-2 text-sm text-gray-400">{c.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/charities"
          className="rounded-lg border border-gray-600 px-6 py-3 hover:bg-gray-800"
        >
          View all charities
        </Link>
      </div>
    </section>
  );
}