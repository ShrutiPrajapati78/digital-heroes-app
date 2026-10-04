"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  category: string | null;
};

export default function CharityDirectory() {
  const [list, setList] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    supabase
      .from("charities")
      .select("id, name, description, image_url, is_featured, category")
      .order("name")
      .then(({ data }) => {
        setList(data ?? []);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set(list.map((c) => c.category).filter(Boolean) as string[]);
    return ["All", ...Array.from(set)];
  }, [list]);

  const visible = list.filter((c) => {
    const matchesText =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || c.category === category;
    return matchesText && matchesCategory;
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Charities</h1>
      <p className="mt-2 text-gray-400">
        Choose the cause your subscription will support.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search charities..."
        className="mt-6 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              category === c
                ? "bg-green-600 text-white"
                : "border border-gray-700 text-gray-300 hover:bg-gray-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-10 text-gray-400">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-gray-400">Koi charity nahi mili.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <Link
              key={c.id}
              href={`/charities/${c.id}`}
              className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:border-green-600"
            >
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-green-900/50 to-gray-900">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">💚</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  {c.category && <span className="text-xs text-green-500">{c.category}</span>}
                  {c.is_featured && (
                    <span className="rounded-full bg-green-600/20 px-2 py-0.5 text-xs text-green-400">
                      Featured
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-semibold">{c.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-gray-400">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}