import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/requireAdmin";  

const PAGE_SIZE = 10;

// List (pagination ke saath)
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page") ?? 1));
  const from = (page - 1) * PAGE_SIZE;

  const { data, count, error } = await supabaseAdmin
    .from("winners")
    .select(
      "id, match_type, prize_amount, proof_url, verification_status, payment_status, profiles(full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Proof ke liye 1 ghante wala signed link
  const rows = await Promise.all(
    (data ?? []).map(async (w) => {
      let proofLink: string | null = null;
      if (w.proof_url) {
        const { data: s } = await supabaseAdmin.storage
          .from("proofs")
          .createSignedUrl(w.proof_url, 3600);
        proofLink = s?.signedUrl ?? null;
      }
      return { ...w, proofLink };
    })
  );

  return NextResponse.json({
    rows,
    total: count ?? 0,
    pageSize: PAGE_SIZE,
  });
}

// Approve / reject / paid
export async function PATCH(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, action } = await req.json();
  if (!id || !["approve", "reject", "paid"].includes(action)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: w } = await supabaseAdmin
    .from("winners")
    .select("verification_status, proof_url")
    .eq("id", id)
    .single();
  if (!w) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let update: Record<string, string> = {};
  if (action === "approve" || action === "reject") {
    if (!w.proof_url) {
      return NextResponse.json({ error: "Proof abhi upload nahi hua" }, { status: 400 });
    }
    update = { verification_status: action === "approve" ? "approved" : "rejected" };
  } else {
    // Paid sirf approved winner ko hi mark ho sakta hai
    if (w.verification_status !== "approved") {
      return NextResponse.json({ error: "Pehle proof approve karo" }, { status: 400 });
    }
    update = { payment_status: "paid" };
  }

  const { error } = await supabaseAdmin.from("winners").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}