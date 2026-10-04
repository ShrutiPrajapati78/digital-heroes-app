import Link from "next/link";

const sections = [
  { href: "/admin/draws", title: "Draws", desc: "Configure, simulate and publish monthly draws" },
  { href: "/admin/winners", title: "Winners", desc: "Verify proofs and mark payouts" },
  { href: "/admin/users", title: "Users", desc: "Manage subscriptions and edit scores" },
  { href: "/admin/charities", title: "Charities", desc: "Add, edit and feature charities" },
  { href: "/admin/reports", title: "Reports", desc: "Users, prize pool and charity totals" },
];

export default function AdminHub() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-3xl font-bold">Admin</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="glass rounded-2xl p-6 transition hover:-translate-y-1 hover:border-green-500/40"
          >
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-gray-400">{s.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}