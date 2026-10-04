import { Crown, Medal, Award } from "lucide-react";
import Reveal from "./reveal";

const tiers = [
  {
    icon: Crown,
    match: "5 numbers",
    share: "40%",
    note: "Jackpot. If nobody wins, it rolls over to the next draw.",
    highlight: true,
  },
  { icon: Medal, match: "4 numbers", share: "35%", note: "Split equally among winners.", highlight: false },
  { icon: Award, match: "3 numbers", share: "25%", note: "Split equally among winners.", highlight: false },
];

export default function Prizes() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <Reveal>
        <p className="text-center text-sm font-medium text-green-400">Transparent prizes</p>
        <h2 className="mt-2 text-center text-3xl font-bold sm:text-4xl">How you win</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-gray-400">
          A fixed part of every subscription goes into the prize pool. The more members,
          the bigger the pool.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.match} delay={i * 120}>
            <div
              className={`h-full rounded-2xl p-6 text-center ${
                t.highlight
                  ? "border border-green-500/50 bg-gradient-to-b from-green-500/15 to-transparent"
                  : "glass"
              }`}
            >
              <t.icon className="mx-auto text-green-400" size={32} />
              <p className="mt-4 text-sm text-gray-400">Match {t.match}</p>
              <p className="gradient-text mt-1 text-5xl font-extrabold">{t.share}</p>
              <p className="mt-1 text-sm text-gray-500">of the prize pool</p>
              <p className="mt-4 text-sm text-gray-300">{t.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}