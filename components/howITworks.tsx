import { CreditCard, Target, Trophy } from "lucide-react";
import Reveal from "./reveal";

const steps = [
  {
    icon: CreditCard,
    title: "Subscribe",
    desc: "Choose a monthly or yearly plan and pick the charity you want to support.",
  },
  {
    icon: Target,
    title: "Enter your scores",
    desc: "Add your latest 5 Stableford scores. They become your entry in the monthly draw.",
  },
  {
    icon: Trophy,
    title: "Win and give",
    desc: "Match the drawn numbers to win, while a share of your plan goes to charity.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24">
      <Reveal>
        <p className="text-center text-sm font-medium text-green-400">Simple by design</p>
        <h2 className="mt-2 text-center text-3xl font-bold sm:text-4xl">How it works</h2>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 120}>
            <div className="glass group h-full rounded-2xl p-6 transition hover:-translate-y-1 hover:border-green-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15 text-green-400 transition group-hover:bg-green-500 group-hover:text-black">
                <s.icon size={24} />
              </div>
              <p className="mt-5 text-xs font-medium text-green-400">Step {i + 1}</p>
              <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-gray-400">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}