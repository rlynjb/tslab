"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CHANNEL_KEY = "tslab-channel";

export default function HomePage() {
  const router = useRouter();
  const [channel, setChannel] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(CHANNEL_KEY);
    if (saved) setChannel(saved);
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const name = channel.trim();
    if (!name) return;
    localStorage.setItem(CHANNEL_KEY, name);
    router.push(`/dashboard?channel=${encodeURIComponent(name)}`);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Chat Question Tracker</h1>
        <p className="text-neutral-400">
          Never miss a viewer question in Twitch chat
        </p>
      </div>

      <form onSubmit={handleConnect} className="flex w-full max-w-sm gap-2">
        <input
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder='Channel name (or "mock" to test)'
          className="flex-1 rounded border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-200 placeholder-neutral-500 focus:border-purple-500 focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          className="rounded bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700"
        >
          Go
        </button>
      </form>

      <p className="text-xs text-neutral-600">
        Tip: use &quot;mock&quot; as the channel name to see it in action with fake data
      </p>
    </main>
  );
}
