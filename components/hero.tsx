import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";

const balls = [7, 18, 24, 33, 41];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-green-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-cyan-500/15 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:py-24 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-medium text-green-400 sm:text-sm">
            <HeartHandshake size={16} /> Every subscription supports a charity
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your game can <span className="gradient-text">change someone&apos;s life.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-gray-400 sm:text-lg">
            Subscribe, pick a cause you believe in, and enter monthly prize draws with your
            scores. Giving and winning, together.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-7 py-3.5 font-semibold text-black transition hover:bg-green-400"
            >
              Subscribe Now <ArrowRight size={18} />
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 font-medium transition hover:bg-white/5"
            >
              How It Works
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center sm:text-left">
            <div>
              <p className="text-xl font-bold sm:text-2xl">10%+</p>
              <p className="text-xs text-gray-400 sm:text-sm">to your charity</p>
            </div>
            <div>
              <p className="text-xl font-bold sm:text-2xl">Monthly</p>
              <p className="text-xs text-gray-400 sm:text-sm">prize draws</p>
            </div>
            <div>
              <p className="text-xl font-bold sm:text-2xl">3 tiers</p>
              <p className="text-xs text-gray-400 sm:text-sm">of winners</p>
            </div>
          </div>
        </div>

        {/* Sample draw card */}
        <div className="animate-fade-up [animation-delay:200ms]">
          <div className="glass animate-float mx-auto max-w-md rounded-3xl p-6 shadow-2xl shadow-green-500/10 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Sample monthly draw</p>
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                Live format
              </span>
            </div>

            <div className="mt-6 flex justify-between gap-2">
              {balls.map((n, i) => (
                <div
                  key={n}
                  style={{ animationDelay: `${i * 150}ms` }}
                  className="animate-float flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-lg font-bold text-black shadow-lg shadow-green-500/30 sm:h-14 sm:w-14"
                >
                  {n}
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-gray-400">
              Match your latest scores with the drawn numbers to win.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between rounded-xl bg-white/5 px-4 py-2.5">
                <span>5 matches</span>
                <span className="text-green-400">Jackpot 40%</span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/5 px-4 py-2.5">
                <span>4 matches</span>
                <span className="text-green-400">35% pool</span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/5 px-4 py-2.5">
                <span>3 matches</span>
                <span className="text-green-400">25% pool</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}