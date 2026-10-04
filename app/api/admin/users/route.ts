import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../lib/requireAdmin";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page") ?? 1));
  const from = (page - 1) * PAGE_SIZE;

  const { data, count, error } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, full_name, role, subscription_status, subscription_plan, renewal_date, charity_percent",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data, total: count ?? 0, pageSize: PAGE_SIZE });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, subscription_status, subscription_plan } = await req.json();

  const statuses = ["active", "inactive", "cancelled", "lapsed"];
  const plans = ["monthly", "yearly", null];
  if (!id || !statuses.includes(subscription_status) || !plans.includes(subscription_plan)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ subscription_status, subscription_plan })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}