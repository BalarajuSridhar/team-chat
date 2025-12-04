// app/channels/page.tsx
"use client";

import { useEffect, useState } from "react";

type Channel = {
  id: string;
  name: string;
  memberCount: number;
};

type OnlineUser = {
  id: string;
  name: string;
  email: string;
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loadingOnline, setLoadingOnline] = useState(true);

  // Load channels
  async function loadChannels() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/channels");
      if (res.status === 401) {
        setMessage("You are not logged in. Go to /login.");
        setChannels([]);
        return;
      }
      const data = await res.json();
      setChannels(data.channels || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load channels");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChannels();
  }, []);

  // Create channel
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!newName.trim()) return;

    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    const data = await res.json();
    setMessage(data.message || "Done");

    if (res.ok) {
      setNewName("");
      await loadChannels();
    }
  }

  // Join
  async function handleJoin(id: string) {
    setMessage("");
    try {
      const res = await fetch(`/api/channels/${id}/join`, { method: "POST" });

      let data: { message?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setMessage(data.message || "Failed to join channel");
      } else {
        setMessage(data.message || "Joined channel");
      }

      await loadChannels();
    } catch (err) {
      console.error(err);
      setMessage("Network error while joining channel");
    }
  }

  // Leave
  async function handleLeave(id: string) {
    setMessage("");
    try {
      const res = await fetch(`/api/channels/${id}/leave`, { method: "POST" });

      let data: { message?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setMessage(data.message || "Failed to leave channel");
      } else {
        setMessage(data.message || "Left channel");
      }

      await loadChannels();
    } catch (err) {
      console.error(err);
      setMessage("Network error while leaving channel");
    }
  }

  // Presence heartbeat
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    async function sendHeartbeat() {
      try {
        await fetch("/api/presence/heartbeat", {
          method: "POST",
        });
      } catch (err) {
        console.error("heartbeat error", err);
      }
    }

    sendHeartbeat();
    interval = setInterval(sendHeartbeat, 15_000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Load online users
  async function loadOnlineUsers() {
    try {
      const res = await fetch("/api/presence/online");
      if (!res.ok) {
        setLoadingOnline(false);
        return;
      }
      const data = await res.json();
      setOnlineUsers(data.users || []);
    } catch (err) {
      console.error("loadOnlineUsers error", err);
    } finally {
      setLoadingOnline(false);
    }
  }

  useEffect(() => {
    loadOnlineUsers();
    const interval = setInterval(loadOnlineUsers, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6">
        {/* Left: presence + create channel */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Online users
            </h2>
            {loadingOnline ? (
              <p className="mt-2 text-xs text-zinc-500">Loading...</p>
            ) : onlineUsers.length === 0 ? (
              <p className="mt-2 text-xs text-zinc-500">No one online.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                {onlineUsers.map((u) => (
                  <li key={u.id} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{u.name || u.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">
              Create channel
            </h2>
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                className="flex-1 rounded-full bg-zinc-950/70 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="New channel name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-black hover:bg-emerald-400 transition"
              >
                Create
              </button>
            </form>
          </div>

          {message && (
            <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800 rounded-xl px-3 py-2">
              {message}
            </p>
          )}
        </aside>

        {/* Right: channels list */}
        <main className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 md:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-zinc-50">
                Channels
              </h1>
              <p className="text-xs text-zinc-500">
                Click a channel name to open chat.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-400">Loading...</p>
          ) : channels.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No channels yet. Create one on the left.
            </p>
          ) : (
            <ul className="space-y-3">
              {channels.map((ch) => (
                <li
                  key={ch.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 hover:border-emerald-500/70 transition"
                >
                  <div>
                    <button
                      className="text-sm font-medium text-emerald-300 hover:text-emerald-200 underline-offset-2 hover:underline"
                      onClick={() =>
                        (window.location.href = `/channels/${ch.id}`)
                      }
                    >
                      {ch.name}
                    </button>
                    <div className="text-[11px] text-zinc-500 mt-1">
                      Members: {ch.memberCount}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleJoin(ch.id)}
                      className="rounded-full border border-emerald-500/60 px-3 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Join
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLeave(ch.id)}
                      className="rounded-full border border-zinc-700 px-3 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
                    >
                      Leave
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
