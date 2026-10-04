"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Winner = {
  id: string;
  match_type: number;
  prize_amount: number;
  proof_url: string | null;
  verification_status: string;
  payment_status: string;
};

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
    setMessage(error ? error.message : "Proof uploaded. Admin review ka wait karo.");
    load();
  }

  const totalWon = winners.reduce((sum, w) => sum + Number(w.prize_amount), 0);
  const totalPaid = winners
    .filter((w) => w.payment_status === "paid")
    .reduce((sum, w) => sum + Number(w.prize_amount), 0);

  return (
    <section className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-xl font-semibold">Draws and winnings</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Draws entered</p>
          <p className="text-2xl font-bold">{entries}</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Total won</p>
          <p className="text-2xl font-bold">₹{totalWon}</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Paid out</p>
          <p className="text-2xl font-bold">₹{totalPaid}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-400">
        Next draw: har mahine admin publish karta hai. Active subscription aur kam se
        kam 3 scores ho to aap entry mein aate hain.
      </p>

      {winners.length > 0 && (
        <ul className="mt-6 space-y-3">
          {winners.map((w) => (
            <li key={w.id} className="rounded-lg bg-gray-800 p-4">
              <p>
                <b>{w.match_type}-match</b> · ₹{w.prize_amount}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Verification: {w.verification_status} · Payment: {w.payment_status}
              </p>

              {!w.proof_url || w.verification_status === "rejected" ? (
                <label className="mt-3 block text-sm">
                  <span className="text-gray-300">
                    {w.verification_status === "rejected"
                      ? "Proof reject hua, naya upload karo:"
                      : "Scores ka screenshot upload karo:"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busyId === w.id}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadProof(w.id, f);
                    }}
                    className="mt-2 block text-sm"
                  />
                </label>
              ) : (
                <p className="mt-2 text-sm text-green-400">Proof submitted</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}
    </section>
  );
}