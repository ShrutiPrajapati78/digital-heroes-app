import Link from "next/link";
import Reveal from "./reveal";

export default function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-green-500/30 bg-gradient-to-br from-green-600/25 via-emerald-900/20 to-cyan-900/20 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-500/20 blur-[90px]" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">
            Ready to play for a cause?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-gray-300">
            Join today, back a charity you care about, and get a shot at the monthly draw.
          </p>
          <Link
            href="/signup"
            className="relative mt-8 inline-block rounded-full bg-green-500 px-8 py-3.5 font-semibold text-black transition hover:bg-green-400"
          >
            Subscribe Now
          </Link>
        </div>
      </Reveal>
    </section>
  );
}