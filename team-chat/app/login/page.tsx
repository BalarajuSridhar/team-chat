// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      setMessage("Login successful! Redirecting to channels...");
      setTimeout(() => router.push("/channels"), 800);
    } catch (err) {
      console.error(err);
      setMessage("Network error, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/70 shadow-2xl backdrop-blur-md p-8 space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400/80">
            Team Chat
          </p>
          <h1 className="text-xl font-semibold text-zinc-50">
            Welcome back
          </h1>
          <p className="text-xs text-zinc-500">
            Log in to access your channels and messages.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-xl bg-zinc-950/70 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl bg-zinc-950/70 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </div>

          {message && (
            <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800 rounded-xl px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-emerald-500 text-black text-sm font-medium py-2.5 mt-1 hover:bg-emerald-400 disabled:opacity-50 transition"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <footer className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
          <span>
            New here?{" "}
            <Link
              href="/register"
              className="text-emerald-300 hover:text-emerald-200 underline-offset-2 hover:underline"
            >
              Create an account
            </Link>
          </span>
          <Link
            href="/"
            className="text-zinc-400 hover:text-zinc-200 underline-offset-2 hover:underline"
          >
            Home
          </Link>
        </footer>
      </div>
    </div>
  );
}
