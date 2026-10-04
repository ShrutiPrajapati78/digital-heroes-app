"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-xl font-semibold">Subscription</h2>

      {!profile ? (
        <p className="mt-3 text-gray-400">Loading...</p>
      ) : active ? (
        <p className="mt-3">
          <span className="rounded-full bg-green-600/20 px-3 py-1 text-sm text-green-400">
            Active
          </span>
          <span className="ml-3 text-gray-300">
            {profile.subscription_plan} plan · renews on {profile.renewal_date}
          </span>
        </p>
      ) : (
        <>
          <p className="mt-3 text-gray-400">
            Aap abhi subscribed nahi hain. Draw mein hissa lene ke liye plan chuno.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => subscribe("monthly")}
              disabled={loading}
              className="rounded-lg bg-green-600 px-5 py-2 font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Monthly
            </button>
            <button
              onClick={() => subscribe("yearly")}
              disabled={loading}
              className="rounded-lg border border-green-600 px-5 py-2 font-medium hover:bg-green-600/10 disabled:opacity-50"
            >
              Yearly (discounted)
            </button>
          </div>
        </>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </section>
  );
}