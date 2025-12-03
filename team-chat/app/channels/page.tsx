// app/channels/page.tsx
"use client";

import { useEffect, useState } from "react";

type Channel = {
  id: string;
  name: string;
  memberCount: number;
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");

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

async function handleJoin(id: string) {
  setMessage("");
  try {
    const res = await fetch(`/api/channels/${id}/join`, { method: "POST" });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      // response body is empty or not JSON
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

async function handleLeave(id: string) {
  setMessage("");
  try {
    const res = await fetch(`/api/channels/${id}/leave`, { method: "POST" });

    let data: any = {};
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

  return (
    <div style={{ padding: 20 }}>
      <h1>Channels</h1>

      <form
        onSubmit={handleCreate}
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          maxWidth: 400,
        }}
      >
        <input
          placeholder="New channel name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Create</button>
      </form>

      {message && <p>{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : channels.length === 0 ? (
        <p>No channels yet. Create one!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {channels.map((ch) => (
            <li
              key={ch.id}
              style={{
                border: "1px solid #ccc",
                padding: 8,
                marginBottom: 8,
                borderRadius: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong
  style={{ cursor: "pointer", textDecoration: "underline" }}
  onClick={() => (window.location.href = `/channels/${ch.id}`)}
>
  {ch.name}
</strong>

                <div style={{ fontSize: 12 }}>
                  Members: {ch.memberCount}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => handleJoin(ch.id)}>
                  Join
                </button>
                <button type="button" onClick={() => handleLeave(ch.id)}>
                  Leave
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
