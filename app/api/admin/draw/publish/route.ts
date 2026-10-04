import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/requireAdmin";
import { loadDrawInputs } from "../../../../../lib/draw/loadInputs";
import { calculateDraw, countMatches } from "../../../../../lib/draw/engine";

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { drawType, winningNumbers } = await req.json();

  // Validation: 5 unique integers, 1-45
  const valid =
    (drawType === "random" || drawType === "algorithm") &&
    Array.isArray(winningNumbers) &&
    winningNumbers.length === 5 &&
    new Set(winningNumbers).size === 5 &&
    winningNumbers.every((n: number) => Number.isInteger(n) && n >= 1 && n <= 45);
  if (!valid) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { allScores, ...inputs } = await loadDrawInputs();
  const result = calculateDraw({ ...inputs, winningNumbers });

  // 1) Draw save
  const { data: draw, error } = await supabaseAdmin
    .from("draws")
    .insert({
      draw_month: new Date().toISOString().slice(0, 7) + "-01",
      draw_type: drawType,
      status: "published",
      winning_numbers: winningNumbers,
      jackpot_rollover: result.next_rollover,
    })
    .select("id")
    .single();

  if (error || !draw) {
    return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 500 });
  }

  // 2) Entries save
  if (inputs.entries.length > 0) {
    await supabaseAdmin.from("draw_entries").insert(
      inputs.entries.map((e) => ({
        draw_id: draw.id,
        user_id: e.user_id,
        numbers: e.numbers,
        matches: countMatches(e.numbers, winningNumbers),
      }))
    );
  }

  // 3) Winners save
  const winnerRows = result.tiers.flatMap((t) =>
    t.winners.map((user_id) => ({
      draw_id: draw.id,
      user_id,
      match_type: t.match_type,
      prize_amount: t.per_winner,
    }))
  );
  if (winnerRows.length > 0) {
    await supabaseAdmin.from("winners").insert(winnerRows);
  }

  return NextResponse.json({ ok: true, drawId: draw.id });
}