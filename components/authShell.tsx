import Link from "next/link";
import type { ReactNode } from "react";
import { HeartHandshake, Target, Trophy } from "lucide-react";

const points = [
  { icon: HeartHandshake, text: "A share of every plan goes to your chosen charity" },
  { icon: Target, text: "Enter your latest scores in seconds" },
  { icon: Trophy, text: "Monthly prize draws with real winners" },
];

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div className="animate-blob pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-green-500/25 blur-[100px]" />
        <div className="animate-blob pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px] [animation-delay:4s]" />

        <div className="relative">
          <p className="text-sm font-medium text-green-400">Digital Heroes</p>
          <h2 className="mt-3 text-5xl font-extrabold leading-tight">
            Play. <span className="gradient-text">Give.</span> Win.
          </h2>

          <ul className="mt-10 space-y-5">
            {points.map((p, i) => (
              <li
                key={p.text}
                style={{ animationDelay: `${i * 150 + 200}ms` }}
                className="animate-fade-up flex items-center gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
                  <p.icon size={22} />
                </span>
                <span className="text-gray-300">{p.text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex gap-3">
            {[7, 18, 24, 33, 41].map((n, i) => (
              <div
                key={n}
                style={{ animationDelay: `${i * 200}ms` }}
                className="animate-float flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 font-bold text-black shadow-lg shadow-green-500/30"
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="relative flex items-center justify-center px-5 py-12">
        <div className="animate-blob pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-green-500/10 blur-[90px] lg:hidden" />

        <div className="animate-fade-up relative w-full max-w-md">
          <Link href="/" className="text-lg font-extrabold tracking-tight lg:hidden">
            DIGITAL <span className="gradient-text">HEROES</span>
          </Link>

          <h1 className="mt-6 text-3xl font-extrabold lg:mt-0">{title}</h1>
          <p className="mt-2 text-gray-400">{subtitle}</p>

          <div className="glass mt-8 rounded-2xl p-6 sm:p-8">{children}</div>
          <div className="mt-6 text-center text-sm text-gray-400">{footer}</div>
        </div>
      </section>
    </main>
  );
}