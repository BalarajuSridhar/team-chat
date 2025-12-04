// app/channels/[id]/page.tsx
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

    // initial load
    loadMessages(true);

    // subscribe to real-time updates
    const channelName = `channel-${channelId}`;
    const channel = pusherClient.subscribe(channelName);

    const handler = (data: Message) => {
      setMessages((prev) => {
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

      // Pusher will append it
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-900/70 shadow-2xl backdrop-blur-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 md:px-6 py-3">
          <div className="space-y-1">
            <button
              onClick={() => router.push("/channels")}
              className="text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              ← Back to channels
            </button>
            <h1 className="text-sm md:text-base font-semibold text-zinc-50">
              Channel
            </h1>
            <p className="text-[11px] text-zinc-500">
              Messages update in real-time across tabs.
            </p>
          </div>
        </div>

        {/* Info / errors */}
        {info && (
          <div className="px-4 md:px-6 pt-3">
            <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800 rounded-xl px-3 py-2">
              {info}
            </p>
          </div>
        )}

        {/* Message list */}
        <div className="flex-1 px-4 md:px-6 py-4 flex flex-col gap-3">
          {initialLoading ? (
            <p className="text-sm text-zinc-400">Loading messages...</p>
          ) : (
            <>
              {nextCursor && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="self-center mb-2 rounded-full border border-zinc-700 px-3 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load older messages"}
                </button>
              )}

              <div className="flex-1 h-[420px] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 px-3 py-3 flex flex-col gap-2">
                {messages.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className="max-w-[80%] rounded-2xl bg-zinc-800/80 px-3 py-2 text-sm text-zinc-100"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-medium text-emerald-300">
                          {m.user?.name || m.user?.email || "User"}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(m.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-100 break-words">
                        {m.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="border-t border-zinc-800 px-4 md:px-6 py-3 flex gap-2"
        >
          <input
            className="flex-1 rounded-full bg-zinc-950/70 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
