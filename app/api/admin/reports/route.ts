import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../lib/requireAdmin";

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { count: totalUsers } = await supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { data: active } = await supabaseAdmin
    .from("profiles")
    .select("subscription_plan, charity_percent")
    .eq("subscription_status", "active");

  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("key, value");
  const s = Object.fromEntries((settings ?? []).map((r) => [r.key, Number(r.value)]));

  const activeList = active ?? [];
  const currentPool = activeList.length * (s.pool_per_subscriber ?? 0);

  // Charity ka hissa = plan price x charity percent
  const charityTotal = activeList.reduce((sum, u) => {
    const price =
      u.subscription_plan === "yearly" ? s.plan_price_yearly ?? 0 : s.plan_price_monthly ?? 0;
    return sum + (price * u.charity_percent) / 100;
  }, 0);

  const { count: drawsPublished } = await supabaseAdmin
    .from("draws")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  const { data: winners } = await supabaseAdmin
    .from("winners")
    .select("prize_amount, payment_status");
  const winnersList = winners ?? [];
  const totalAwarded = winnersList.reduce((a, w) => a + Number(w.prize_amount), 0);
  const totalPaid = winnersList
    .filter((w) => w.payment_status === "paid")
    .reduce((a, w) => a + Number(w.prize_amount), 0);

  const { data: lastDraw } = await supabaseAdmin
    .from("draws")
    .select("jackpot_rollover")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1);

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    activeSubscribers: activeList.length,
    currentPool,
    charityTotal,
    drawsPublished: drawsPublished ?? 0,
    totalWinners: winnersList.length,
    totalAwarded,
    totalPaid,
    jackpotRollover: Number(lastDraw?.[0]?.jackpot_rollover ?? 0),
  });
}