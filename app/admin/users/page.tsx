"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type User = {
  id: string;
  full_name: string | null;
  role: string;
  subscription_status: string;
  subscription_plan: string | null;
  renewal_date: string | null;
  charity_percent: number;
};
type Score = { id: string; score: number; played_on: string };

export default function AdminUsers() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [rows, setRows] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [message, setMessage] = useState("");
  const [openId, setOpenId] = useState("");
  const [scores, setScores] = useState<Score[]>([]);

  async function authFetch(path: string, init?: RequestInit) {
    const { data: s } = await supabase.auth.getSession();
    return fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s.session?.access_token}`,
      },
    });
  }

  async function load(p = page) {
    const res = await authFetch(`/api/admin/users?page=${p}`);
    if (!res.ok) return setMessage("List load nahi hui");
    const body = await res.json();
    setRows(body.rows);
    setTotal(body.total);
    setPageSize(body.pageSize);
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
      if (ok) load(1);
    }
    check();
  }, []);

  function setField(id: string, field: keyof User, value: string | null) {
    setRows((r) => r.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  }

  async function saveUser(u: User) {
    setMessage("");
    const res = await authFetch("/api/admin/users", {
      method: "PATCH",
      body: JSON.stringify({
        id: u.id,
        subscription_status: u.subscription_status,
        subscription_plan: u.subscription_plan,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return setMessage(body.error ?? "Error");
    }
    setMessage("Saved");
  }

  async function openScores(userId: string) {
    if (openId === userId) return setOpenId("");
    const { data } = await supabase
      .from("scores")
      .select("id, score, played_on")
      .eq("user_id", userId)
      .order("played_on", { ascending: false });
    setScores(data ?? []);
    setOpenId(userId);
  }

  async function saveScore(s: Score) {
    if (!Number.isInteger(s.score) || s.score < 1 || s.score > 45) {
      return setMessage("Score 1 se 45 ke beech hona chahiye");
    }
    const { error } = await supabase.from("scores").update({ score: s.score }).eq("id", s.id);
    setMessage(error ? error.message : "Score updated");
  }

  function go(p: number) {
    setPage(p);
    load(p);
  }

  if (allowed === null) return <main className="p-8">Loading...</main>;
  if (!allowed) return <main className="p-8">Not authorized.</main>;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">User management</h1>
      {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}

      <ul className="mt-8 space-y-3">
        {rows.map((u) => (
          <li key={u.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <p>
              <b>{u.full_name ?? "Unnamed"}</b>{" "}
              <span className="text-sm text-gray-400">
                · {u.role} · charity {u.charity_percent}%
              </span>
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <select
                value={u.subscription_status}
                onChange={(e) => setField(u.id, "subscription_status", e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="cancelled">cancelled</option>
                <option value="lapsed">lapsed</option>
              </select>

              <select
                value={u.subscription_plan ?? ""}
                onChange={(e) => setField(u.id, "subscription_plan", e.target.value || null)}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm"
              >
                <option value="">no plan</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>

              <button
                onClick={() => saveUser(u)}
                className="rounded-lg bg-green-600 px-4 py-1.5 text-sm hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => openScores(u.id)}
                className="rounded-lg border border-gray-600 px-4 py-1.5 text-sm hover:bg-gray-800"
              >
                {openId === u.id ? "Hide scores" : "Scores"}
              </button>
            </div>

            {openId === u.id && (
              <ul className="mt-4 space-y-2">
                {scores.length === 0 && (
                  <li className="text-sm text-gray-400">Koi score nahi hai.</li>
                )}
                {scores.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 text-sm">
                    <span className="w-28 text-gray-400">{s.played_on}</span>
                    <input
                      type="number"
                      value={s.score}
                      onChange={(e) =>
                        setScores((list) =>
                          list.map((x) =>
                            x.id === s.id ? { ...x, score: Number(e.target.value) } : x
                          )
                        )
                      }
                      className="w-20 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1"
                    />
                    <button
                      onClick={() => saveScore(s)}
                      className="rounded-lg bg-green-600 px-3 py-1 hover:bg-green-700"
                    >
                      Update
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-4">
        <button
          disabled={page <= 1}
          onClick={() => go(page - 1)}
          className="rounded-lg border border-gray-700 px-4 py-2 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
          className="rounded-lg border border-gray-700 px-4 py-2 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </main>
  );
}