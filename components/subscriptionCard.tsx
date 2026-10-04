"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import Skeleton from "./skeleton";

type Profile = {
  subscription_status: string;
  subscription_plan: string | null;
  renewal_date: string | null;
};

export default function SubscriptionCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProfile() {
    const { data: u } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("profiles")
      .select("subscription_status, subscription_plan, renewal_date")
      .eq("id", u.user!.id)
      .single();
    setProfile(data);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function subscribe(plan: "monthly" | "yearly") {
    setLoading(true);
    setError("");
    const { data: s } = await supabase.auth.getSession();

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s.session?.access_token}`,
      },
      body: JSON.stringify({ plan }),
    });

    setLoading(false);

    if (!res.ok) {
      let msg = `Error ${res.status}`;
      try {
        const body = await res.json();
        msg = body.error ?? msg;
      } catch {}
      setError(msg);
      return;
    }

    loadProfile();
  }

  const active = profile?.subscription_status === "active";

  return (
    <section className="glass card-hover h-full rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
          <CreditCard size={20} />
        </span>
        <h2 className="text-lg font-semibold">Subscription</h2>
      </div>

      {!profile ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : active ? (
        <div className="mt-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            Active
          </span>
          <p className="mt-4 text-2xl font-bold capitalize">{profile.subscription_plan} plan</p>
          <p className="mt-1 text-sm text-gray-400">
            Renews on{" "}
            {profile.renewal_date
              ? new Date(`${profile.renewal_date}T00:00:00`).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-sm text-gray-400">
            You are not subscribed yet. Pick a plan to join the monthly draw.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => subscribe("monthly")}
              disabled={loading}
              className="rounded-xl border border-white/15 bg-white/5 p-4 text-left transition hover:border-green-500/50 hover:bg-white/10 disabled:opacity-50"
            >
              <p className="font-semibold">Monthly</p>
              <p className="mt-1 text-xs text-gray-400">Flexible, cancel anytime</p>
            </button>

            <button
              onClick={() => subscribe("yearly")}
              disabled={loading}
              className="relative rounded-xl border border-green-500/50 bg-green-500/10 p-4 text-left transition hover:bg-green-500/20 disabled:opacity-50"
            >
              <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-black">
                <Sparkles size={10} /> BEST VALUE
              </span>
              <p className="font-semibold">Yearly</p>
              <p className="mt-1 text-xs text-gray-400">Discounted rate</p>
            </button>
          </div>

          {loading && (
            <p className="mt-3 flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Activating...
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="animate-pop mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}