"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Report = {
  totalUsers: number;
  activeSubscribers: number;
  currentPool: number;
  charityTotal: number;
  drawsPublished: number;
  totalWinners: number;
  totalAwarded: number;
  totalPaid: number;
  jackpotRollover: number;
};

export default function AdminReports() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [r, setR] = useState<Report | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return router.push("/login");
      const { data: p } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.user.id)
        .single();
      const ok = p?.role === "admin";
      setAllowed(ok);
      if (!ok) return;

      const { data: s } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/reports", {
        headers: { Authorization: `Bearer ${s.session?.access_token}` },
      });
      if (!res.ok) return setMessage("Report load nahi hua");
      setR(await res.json());
    }
    init();
  }, []);

  if (allowed === null) return <main className="p-8">Loading...</main>;
  if (!allowed) return <main className="p-8">Not authorized.</main>;

  const cards = r
    ? [
        ["Total users", r.totalUsers],
        ["Active subscribers", r.activeSubscribers],
        ["Current prize pool", `₹${r.currentPool}`],
        ["Charity contributions", `₹${r.charityTotal}`],
        ["Draws published", r.drawsPublished],
        ["Total winners", r.totalWinners],
        ["Prize awarded", `₹${r.totalAwarded}`],
        ["Prize paid out", `₹${r.totalPaid}`],
        ["Jackpot rollover", `₹${r.jackpotRollover}`],
      ]
    : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Reports and analytics</h1>
      {message && <p className="mt-4 text-red-400">{message}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}