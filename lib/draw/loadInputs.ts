import { supabaseAdmin } from "../supabaseAdmin";
import type { Entry, TierConfig } from "./engine";

export async function loadDrawInputs() {
  // 1) Active subscribers
  const { data: subs } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("subscription_status", "active");
  const activeIds = (subs ?? []).map((s) => s.id);

  // 2) Unke scores
  let scoreRows: { user_id: string; score: number }[] = [];
  if (activeIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("scores")
      .select("user_id, score")
      .in("user_id", activeIds);
    scoreRows = data ?? [];
  }

  const byUser = new Map<string, number[]>();
  for (const r of scoreRows) {
    byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.score]);
  }

  // Entry tabhi milti hai jab kam se kam 3 scores hon
  const entries: Entry[] = [];
  byUser.forEach((numbers, user_id) => {
    if (numbers.length >= 3) entries.push({ user_id, numbers });
  });

  // 3) Config: per-subscriber amount, tiers, pichla rollover
  const { data: setting } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "pool_per_subscriber")
    .single();

  const { data: tierConfig } = await supabaseAdmin
    .from("prize_config")
    .select("match_type, pool_share, rollover");

  const { data: last } = await supabaseAdmin
    .from("draws")
    .select("jackpot_rollover")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1);

  return {
    entries,
    allScores: scoreRows.map((r) => r.score),
    activeSubscribers: activeIds.length,
    poolPerSubscriber: Number(setting?.value ?? 0),
    tierConfig: (tierConfig ?? []) as TierConfig[],
    rolloverIn: Number(last?.[0]?.jackpot_rollover ?? 0),
  };
}