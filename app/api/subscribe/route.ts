import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Server config missing: SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }
  const admin = createClient(url, key);

  // 1) Token se user verify karo
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data } = await admin.auth.getUser(token);
  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Plan validate karo
  const { plan } = await req.json();
  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // 3) Renewal date
  const renewal = new Date();
  if (plan === "monthly") renewal.setMonth(renewal.getMonth() + 1);
  else renewal.setFullYear(renewal.getFullYear() + 1);

  // 4) Profile update (service role se)
  const { error } = await admin
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_plan: plan,
      renewal_date: renewal.toISOString().slice(0, 10),
    })
    .eq("id", data.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}