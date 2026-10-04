"use client";

import { useEffect, useState } from "react";
import { Trophy, Upload, Clock, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { supabase } from "../lib/supabase";
import CountUp from "./countUp";

type Winner = {
  id: string;
  match_type: number;
  prize_amount: number;
  proof_url: string | null;
  verification_status: string;
  payment_status: string;
};

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-300",
    approved: "bg-green-500/15 text-green-300",
    rejected: "bg-red-500/15 text-red-300",
    paid: "bg-cyan-500/15 text-cyan-300",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

export default function WinningsCard() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [entries, setEntries] = useState(0);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    const { data } = await supabase
      .from("winners")
      .select("id, match_type, prize_amount, proof_url, verification_status, payment_status");
    setWinners((data as Winner[]) ?? []);

    const { count } = await supabase
      .from("draw_entries")
      .select("id", { count: "exact", head: true });
    setEntries(count ?? 0);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadProof(winnerId: string, file: File) {
    setMessage("");
    setBusyId(winnerId);

    const { data: u } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop();
    const path = `${u.user!.id}/${winnerId}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from("proofs").upload(path, file);
    if (upErr) {
      setBusyId("");
      setMessage(upErr.message);
      return;
    }

    const { error } = await supabase
      .from("winners")
      .update({ proof_url: path })
      .eq("id", winnerId);

    setBusyId("");
    setMessage(error ? error.message : "Proof uploaded. Waiting for admin review.");
    load();
  }

  const totalWon = winners.reduce((sum, w) => sum + Number(w.prize_amount), 0);
  const totalPaid = winners
    .filter((w) => w.payment_status === "paid")
    .reduce((sum, w) => sum + Number(w.prize_amount), 0);

  const stats = [
    { icon: Clock, label: "Draws entered", value: entries, prefix: "" },
    { icon: Trophy, label: "Total won", value: totalWon, prefix: "₹" },
    { icon: Wallet, label: "Paid out", value: totalPaid, prefix: "₹" },
  ];

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
          <Trophy size={20} />
        </span>
        <h2 className="text-lg font-semibold">Draws and winnings</h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            style={{ animationDelay: `${i * 100}ms` }}
            className="animate-pop rounded-xl bg-white/5 p-4"
          >
            <s.icon size={18} className="text-green-400" />
            <p className="mt-2 text-2xl font-extrabold">
              <CountUp value={s.value} prefix={s.prefix} />
            </p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-400">
        Draws are published monthly. With an active subscription and at least 3 scores you are
        entered automatically.
      </p>

      {winners.length > 0 && (
        <ul className="mt-6 space-y-3">
          {winners.map((w, i) => (
            <li
              key={w.id}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-pop rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {w.match_type}-match · <span className="text-green-400">₹{w.prize_amount}</span>
                </p>
                <div className="flex gap-2">
                  <Badge status={w.verification_status} />
                  <Badge status={w.payment_status} />
                </div>
              </div>

              {!w.proof_url || w.verification_status === "rejected" ? (
                <label className="mt-3 flex cursor-pointer flex-col gap-2 rounded-lg border border-dashed border-white/20 p-4 text-sm transition hover:border-green-500/50">
                  <span className="flex items-center gap-2 text-gray-300">
                    <Upload size={16} />
                    {w.verification_status === "rejected"
                      ? "Proof rejected. Upload a new screenshot"
                      : "Upload a screenshot of your scores"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busyId === w.id}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadProof(w.id, f);
                    }}
                    className="text-xs text-gray-400 file:mr-3 file:rounded-full file:border-0 file:bg-green-500 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-black"
                  />
                </label>
              ) : (
                <p className="mt-3 flex items-center gap-2 text-sm text-green-400">
                  {w.verification_status === "approved" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Clock size={16} />
                  )}
                  {w.verification_status === "approved"
                    ? "Proof approved"
                    : "Proof submitted, under review"}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p className="animate-pop mt-4 flex items-center gap-2 text-sm text-gray-300">
          <XCircle size={0} className="hidden" />
          {message}
        </p>
      )}
    </section>
  );
}