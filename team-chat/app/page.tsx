// app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-50 flex items-center justify-center px-4">
      <main className="w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-2xl backdrop-blur-md p-8 md:p-10 flex flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Team Chat
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50 mt-1">
              Real-time Channels & Presence
            </h1>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs text-zinc-500">
            <span>Next.js · Prisma · Supabase</span>
            <span>Pusher · JWT Auth</span>
          </div>
        </header>

        <section className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="flex-1 space-y-3">
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
              This app lets users register, log in, join channels, and chat in
              real time with presence (who&apos;s online). Built for your
              full-stack assignment using a production-style stack.
            </p>

            <ul className="space-y-2 text-sm text-zinc-400">
              <li>• JWT-based auth (register &amp; login)</li>
              <li>• Channel creation, join &amp; leave</li>
              <li>• Real-time messages with Pusher</li>
              <li>• Online users presence powered by the database</li>
            </ul>
          </div>

          <div className="w-full md:w-[220px] space-y-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Get started
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-zinc-50 text-zinc-950 text-sm font-medium h-10 px-4 hover:bg-zinc-200 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-700 text-zinc-200 text-sm font-medium h-10 px-4 hover:bg-zinc-800 transition"
                >
                  Register
                </Link>
                <Link
                  href="/channels"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-700 text-zinc-200 text-xs h-9 px-4 hover:bg-zinc-800 transition"
                >
                  Go to Channels (requires login)
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between text-xs text-zinc-500">
          <span>Assignment demo build</span>
          <span>Recorded best in dark mode ✦</span>
        </footer>
      </main>
    </div>
  );
}
