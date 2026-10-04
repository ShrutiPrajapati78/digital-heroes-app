import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/requireAdmin";
import { loadDrawInputs } from "../../../../../lib/draw/loadInputs";
import {
  calculateDraw,
  generateRandomNumbers,
  generateWeightedNumbers,
} from "../../../../../lib/draw/engine";

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { drawType } = await req.json();
  if (drawType !== "random" && drawType !== "algorithm") {
    return NextResponse.json({ error: "Invalid draw type" }, { status: 400 });
  }

  const { allScores, ...inputs } = await loadDrawInputs();
  const winningNumbers =
    drawType === "algorithm"
      ? generateWeightedNumbers(allScores)
      : generateRandomNumbers();

  const result = calculateDraw({ ...inputs, winningNumbers });
  return NextResponse.json({ result, entriesCount: inputs.entries.length });
}