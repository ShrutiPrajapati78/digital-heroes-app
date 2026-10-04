"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, User, MailCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import AuthShell from "../../components/authShell";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (error) {
      setLoading(false);
      const msg = error.message.toLowerCase();
      if (msg.includes("already")) {
        setError("This email is already registered. Please login instead.");
      } else if (msg.includes("rate limit")) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (msg.includes("database error")) {
        setError("Account setup failed on the server. Please contact the admin.");
      } else {
        setError(error.message);
      }
      return;
    }

    // Supabase repeat signup pe error nahi deta, identities khali aati hai
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setLoading(false);
      setError("This email is already registered. Please login instead.");
      return;
    }

    // Session mil gaya (confirm email off) to seedha dashboard
    if (data.session) {
      router.push("/dashboard");
      return;
    }

    // Session nahi mila: pehle login try karo
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    setLoading(false);

    if (!loginErr) {
      router.push("/dashboard");
      return;
    }

    // Email confirm required hai
    setInfo("Account created. Please check your email and confirm it, then login.");
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join, give and win every month."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-green-400 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="relative">
          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="input !pl-11"
          />
        </div>

        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input !pl-11"
          />
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type={show ? "text" : "password"}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input !pl-11 !pr-12"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            aria-label="Toggle password"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="animate-pop rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {info && (
          <p className="animate-pop flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">
            <MailCheck size={18} className="mt-0.5 shrink-0" />
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3 font-semibold text-black transition hover:bg-green-400 disabled:opacity-60"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </AuthShell>
  );
}