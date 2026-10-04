"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Row = {
  id: string;
  match_type: number;
  prize_amount: number;
  verification_status: string;
  payment_status: string;
  proofLink: string | null;
  profiles: { full_name: string | null } | null;
};

export default function AdminWinners() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [message, setMessage] = useState("");

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
    const res = await authFetch(`/api/admin/winners?page=${p}`);
    if (!res.ok) {
      setMessage("List load nahi hui");
      return;
    }
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

  async function act(id: string, action: "approve" | "reject" | "paid") {
    setMessage("");
    const res = await authFetch("/api/admin/winners", {
      method: "PATCH",
      body: JSON.stringify({ id, action }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(body.error ?? "Error");
      return;
    }
    load();
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
      <h1 className="text-3xl font-bold">Winners management</h1>
      {message && <p className="mt-4 text-sm text-red-400">{message}</p>}

      <ul className="mt-8 space-y-3">
        {rows.length === 0 && <li className="text-gray-400">Abhi koi winner nahi hai.</li>}
        {rows.map((w) => (
          <li key={w.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <p>
              <b>{w.profiles?.full_name ?? "Unknown"}</b> · {w.match_type}-match · ₹
              {w.prize_amount}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Verification: {w.verification_status} · Payment: {w.payment_status}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {w.proofLink ? (
                <a
                  href={w.proofLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-green-500 underline"
                >
                  View proof
                </a>
              ) : (
                <span className="text-sm text-gray-500">Proof pending</span>
              )}

              {w.proofLink && w.verification_status === "pending" && (
                <>
                  <button
                    onClick={() => act(w.id, "approve")}
                    className="rounded-lg bg-green-600 px-4 py-1.5 text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => act(w.id, "reject")}
                    className="rounded-lg border border-red-500 px-4 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Reject
                  </button>
                </>
              )}

              {w.verification_status === "approved" && w.payment_status === "pending" && (
                <button
                  onClick={() => act(w.id, "paid")}
                  className="rounded-lg bg-green-600 px-4 py-1.5 text-sm hover:bg-green-700"
                >
                  Mark as Paid
                </button>
              )}
            </div>
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