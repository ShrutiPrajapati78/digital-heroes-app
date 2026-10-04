import { calculateDraw } from "./engine";

const result = calculateDraw({
  entries: [
    { user_id: "A", numbers: [1, 2, 3, 4, 5] },   // 5 match
    { user_id: "B", numbers: [1, 2, 3, 4, 40] },  // 4 match
    { user_id: "C", numbers: [1, 2, 3, 41, 42] }, // 3 match
  ],
  winningNumbers: [1, 2, 3, 4, 5],
  activeSubscribers: 10,
  poolPerSubscriber: 100,
  tierConfig: [
    { match_type: 5, pool_share: 40, rollover: true },
    { match_type: 4, pool_share: 35, rollover: false },
    { match_type: 3, pool_share: 25, rollover: false },
  ],
  rolloverIn: 0,
});
console.log(JSON.stringify(result, null, 2));