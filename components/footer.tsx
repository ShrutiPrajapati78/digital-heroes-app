import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
        <p className="font-semibold text-gray-300">
          DIGITAL <span className="gradient-text">HEROES</span>
        </p>
        <div className="flex gap-6">
          <Link href="/charities" className="hover:text-white">Charities</Link>
          <Link href="/login" className="hover:text-white">Login</Link>
          <Link href="/signup" className="hover:text-white">Subscribe</Link>
        </div>
        <p>© {new Date().getFullYear()} Digital Heroes. Play. Give. Win.</p>
      </div>
    </footer>
  );
}