export type DrawType = "random" | "algorithm";

export const NUMBER_MIN = 1;
export const NUMBER_MAX = 45;
export const PICK_COUNT = 5;

// ---------- 1) Winning numbers nikalna ----------

/** Standard lottery style: 1-45 mein se 5 unique numbers */
export function generateRandomNumbers(): number[] {
  const pool = Array.from({ length: NUMBER_MAX }, (_, i) => i + 1);
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, PICK_COUNT).sort((a, b) => a - b);
}

/**
 * Weighted draw: jo score zyada baar aaya, uska chance zyada.
 * Har number ka base weight 1 hai, aur har baar score aane pe +1.
 * Isse koi number kabhi impossible nahi hota.
 */
export function generateWeightedNumbers(allScores: number[]): number[] {
  const weight = new Map<number, number>();
  for (let n = NUMBER_MIN; n <= NUMBER_MAX; n++) weight.set(n, 1);
  for (const s of allScores) {
    if (weight.has(s)) weight.set(s, weight.get(s)! + 1);
  }

  const available = Array.from(weight.keys());
  const picked: number[] = [];

  while (picked.length < PICK_COUNT) {
    const total = available.reduce((sum, n) => sum + weight.get(n)!, 0);
    let r = Math.random() * total;
    let chosenIndex = available.length - 1; // fallback
    for (let i = 0; i < available.length; i++) {
      r -= weight.get(available[i])!;
      if (r <= 0) {
        chosenIndex = i;
        break;
      }
    }
    picked.push(available[chosenIndex]);
    available.splice(chosenIndex, 1); // same number dobara nahi
  }
  return picked.sort((a, b) => a - b);
}

// ---------- 2) Match count ----------

/** User ke numbers mein se kitne winning numbers mein hain (duplicates ignore) */
export function countMatches(userNumbers: number[], winning: number[]): number {
  const win = new Set(winning);
  return Array.from(new Set(userNumbers)).filter((n) => win.has(n)).length;
}

// ---------- 3) Prize calculation ----------

export type TierConfig = { match_type: number; pool_share: number; rollover: boolean };
export type Entry = { user_id: string; numbers: number[] };

export type TierResult = {
  match_type: number;
  tier_pool: number;
  winners: string[]; // user ids
  per_winner: number;
  rolled_over: number; // agle draw mein jaane wali raashi
};

export type DrawResult = {
  winning_numbers: number[];
  total_pool: number;
  tiers: TierResult[];
  next_rollover: number;
};

const toPaise = (x: number) => Math.floor(x * 100) / 100; // 2 decimal, neeche round

/**
 * Pure function: same input -> same output. Database ko kuch nahi chhoota,
 * isliye simulation aur publish dono isi ko use karte hain.
 */
export function calculateDraw(params: {
  entries: Entry[];
  winningNumbers: number[];
  activeSubscribers: number;
  poolPerSubscriber: number;
  tierConfig: TierConfig[];
  rolloverIn: number; // pichle draw se aaya jackpot
}): DrawResult {
  const { entries, winningNumbers, activeSubscribers, poolPerSubscriber, tierConfig, rolloverIn } =
    params;

  const totalPool = toPaise(activeSubscribers * poolPerSubscriber);

  const tiers: TierResult[] = tierConfig
    .slice()
    .sort((a, b) => b.match_type - a.match_type) // 5, 4, 3
    .map((cfg) => {
      const winners = entries
        .filter((e) => countMatches(e.numbers, winningNumbers) === cfg.match_type)
        .map((e) => e.user_id);

      // Rollover sirf un tiers mein judta hai jinme rollover=true (jackpot)
      const base = (totalPool * cfg.pool_share) / 100;
      const tierPool = toPaise(base + (cfg.rollover ? rolloverIn : 0));

      const perWinner = winners.length > 0 ? toPaise(tierPool / winners.length) : 0;
      const rolledOver = winners.length === 0 && cfg.rollover ? tierPool : 0;

      return {
        match_type: cfg.match_type,
        tier_pool: tierPool,
        winners,
        per_winner: perWinner,
        rolled_over: rolledOver,
      };
    });

  return {
    winning_numbers: winningNumbers,
    total_pool: totalPool,
    tiers,
    next_rollover: tiers.reduce((sum, t) => sum + t.rolled_over, 0),
  };
}