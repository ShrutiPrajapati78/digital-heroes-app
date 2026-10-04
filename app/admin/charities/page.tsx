"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  category: string | null;
  upcoming_events: string | null;
};

const CATEGORIES = ["Environment", "Education", "Health", "Animals", "Community", "Other"];

export default function AdminCharities() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [list, setList] = useState<Charity[]>([]);
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [events, setEvents] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await supabase
      .from("charities")
      .select("id, name, description, image_url, is_featured, category, upcoming_events")
      .order("created_at", { ascending: false });
    setList(data ?? []);
  }

  useEffect(() => {
    async function check() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return router.push("/login");
      const { data: p } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.user.id)
        .single();
      const ok = p?.role === "admin";
      setAllowed(ok);
      if (ok) load();
    }
    check();
  }, []);

  function reset() {
    setEditingId("");
    setName("");
    setDescription("");
    setImageUrl("");
    setCategory("");
    setEvents("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      category: category || null,
      upcoming_events: events.trim() || null,
    };
    const { error } = editingId
      ? await supabase.from("charities").update(payload).eq("id", editingId)
      : await supabase.from("charities").insert(payload);
    if (error) return setMessage(error.message);
    reset();
    load();
  }

  function startEdit(c: Charity) {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description ?? "");
    setImageUrl(c.image_url ?? "");
    setCategory(c.category ?? "");
    setEvents(c.upcoming_events ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!confirm("Is charity ko delete karna hai?")) return;
    const { error } = await supabase.from("charities").delete().eq("id", id);
    if (error) return setMessage(error.message);
    load();
  }

  async function toggleFeatured(c: Charity) {
    await supabase.from("charities").update({ is_featured: !c.is_featured }).eq("id", c.id);
    load();
  }

  if (allowed === null) return <main className="p-8">Loading...</main>;
  if (!allowed) return <main className="p-8">Not authorized.</main>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Charity management</h1>

      <form
        onSubmit={submit}
        className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-6"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit charity" : "Add charity"}
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="mt-4 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={3}
          className="mt-3 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)"
          className="mt-3 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
        />

        <textarea
          value={events}
          onChange={(e) => setEvents(e.target.value)}
          placeholder="Upcoming events (har event ke baad full stop lagao). Example: Golf Day, 15 Nov. Tree drive, 2 Dec."
          rows={3}
          className="mt-3 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2"
        />

        <div className="mt-4 flex gap-3">
          <button className="rounded-lg bg-green-600 px-5 py-2 font-medium hover:bg-green-700">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-gray-600 px-5 py-2 hover:bg-gray-800"
            >
              Cancel
            </button>
          )}
        </div>
        {message && <p className="mt-3 text-sm text-red-400">{message}</p>}
      </form>

      <ul className="mt-8 space-y-3">
        {list.map((c) => (
          <li key={c.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <p className="font-semibold">
              {c.name}
              {c.category && (
                <span className="ml-2 text-xs font-normal text-green-500">{c.category}</span>
              )}
              {c.is_featured && (
                <span className="ml-2 rounded-full bg-green-600/20 px-2 py-0.5 text-xs text-green-400">
                  Featured
                </span>
              )}
            </p>
            {c.description && <p className="mt-1 text-sm text-gray-400">{c.description}</p>}
            {c.upcoming_events && (
              <p className="mt-1 text-sm text-gray-500">📅 {c.upcoming_events}</p>
            )}
            <div className="mt-3 flex gap-4 text-sm">
              <button onClick={() => startEdit(c)} className="text-green-500 hover:underline">
                Edit
              </button>
              <button onClick={() => toggleFeatured(c)} className="hover:underline">
                {c.is_featured ? "Unfeature" : "Feature"}
              </button>
              <button onClick={() => remove(c.id)} className="text-red-400 hover:underline">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}