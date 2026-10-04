"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  async function check(userId?: string) {
    setLoggedIn(!!userId);
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    setIsAdmin(data?.role === "admin");
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => check(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
  }

  const links = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/charities", label: "Charities" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090d]/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          DIGITAL <span className="gradient-text">HEROES</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-300 hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {loggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
                Dashboard
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm text-gray-300 hover:text-white">
                  Admin
                </Link>
              )}
              <button onClick={logout} className="text-sm text-gray-400 hover:text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-300 hover:text-white">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-green-400"
              >
                Subscribe
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 hover:bg-white/10 md:hidden"
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#07090d] px-5 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-gray-200">
                {l.label}
              </Link>
            ))}
            {loggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="text-gray-200">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="text-gray-200">
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="text-left text-gray-400">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-gray-200">
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-green-500 py-3 text-center font-semibold text-black"
                >
                  Subscribe
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}