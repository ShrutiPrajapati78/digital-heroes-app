"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
    router.push("/");
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
      <Link href="/" className="text-xl font-bold">
        DIGITAL HEROES
      </Link>

      <ul className="flex items-center gap-6">
        <li><Link href="/#how-it-works">How It Works</Link></li>
        <li><Link href="/charities">Charities</Link></li>
      </ul>

      <div className="flex items-center gap-4">
        {loggedIn ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
           {isAdmin && (
  <>
                <Link href="/admin/draws">Draws</Link>
                <Link href="/admin/winners">Winners</Link>
                <Link href="/admin/users">Users</Link>
                <Link href="/admin/charities">Charities</Link>
                <Link href="/admin/reports">Reports</Link>
              </>
            )}
            <button onClick={logout} className="hover:underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link
              href="/signup"
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Subscribe
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}