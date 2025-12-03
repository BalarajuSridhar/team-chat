"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { pusherClient } from "../../lib/pusher-client";


type MessageUser = {
  id: string;
  name: string;
  email: string;
};

type Message = {
  id: string;
  text: string;
  createdAt: string;
  user: MessageUser;
};

export default function ChannelChatPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params?.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [info, setInfo] = useState("");

  async function loadMessages(initial: boolean) {
    try {
      const url = new URL(
        `/api/channels/${channelId}/messages`,
        window.location.origin
      );

      if (!initial && nextCursor) {
        url.searchParams.set("cursor", nextCursor);
      }

      const res = await fetch(url.toString());
      if (res.status === 401) {
        setInfo("You are not logged in. Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      const data = await res.json();

      if (initial) {
        setMessages(data.messages || []);
      } else {
        // prepend older messages
        setMessages((prev) => [...(data.messages || []), ...prev]);
      }

      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error(err);
      setInfo("Failed to load messages");
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
    }
  }

    useEffect(() => {
    if (!channelId) return;

    loadMessages(true);

    // 🔔 subscribe to real-time updates
    const channelName = `channel-${channelId}`;
    const channel = pusherClient.subscribe(channelName);

    const handler = (data: Message) => {
      setMessages((prev) => {
        // avoid duplicates (because we also append after POST)
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    };

    channel.bind("message:new", handler);

    return () => {
      channel.unbind("message:new", handler);
      pusherClient.unsubscribe(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);


  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setInfo("");

    if (!text.trim()) return;
    setSending(true);

    try {
      const res = await fetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInfo(data.message || "Failed to send");
        return;
      }

      // append new message at bottom
      setMessages((prev) => [...prev, data.message]);
      setText("");
    } catch (err) {
      console.error(err);
      setInfo("Network error while sending");
    } finally {
      setSending(false);
    }
  }

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    await loadMessages(false);
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>Channel Chat</h1>
      <button onClick={() => router.push("/channels")}>← Back to channels</button>

      {info && <p>{info}</p>}

      {initialLoading ? (
        <p>Loading messages...</p>
      ) : (
        <>
          {nextCursor && (
            <button onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? "Loading..." : "Load older messages"}
            </button>
          )}

          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: 8,
              marginTop: 8,
              marginBottom: 8,
              height: 400,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.length === 0 ? (
              <p>No messages yet. Start the conversation!</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: "#f5f5f5",
                    borderRadius: 4,
                    padding: 6,
                    fontSize: 14,
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 13 }}>
                    {m.user.name}{" "}
                    <span style={{ fontWeight: "normal", fontSize: 11 }}>
                      ({new Date(m.createdAt).toLocaleTimeString()})
                    </span>
                  </div>
                  <div>{m.text}</div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
            }}
          >
            <input
              style={{ flex: 1 }}
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
