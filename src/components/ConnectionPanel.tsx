"use client";

import { useState } from "react";
import { ConnectionStatus } from "@/lib/twitch/client";
import { FilterToggles } from "@/hooks/useTwitchChat";

const STATUS_STYLES: Record<ConnectionStatus, { label: string; color: string }> = {
  disconnected: { label: "Disconnected", color: "text-neutral-500" },
  connecting: { label: "Connecting...", color: "text-yellow-400" },
  connected: { label: "Connected", color: "text-green-400" },
  error: { label: "Error", color: "text-red-400" },
};

interface ConnectionPanelProps {
  status: ConnectionStatus;
  messageCount: number;
  channel: string | null;
  filters: FilterToggles;
  onConnect: (channel: string) => void;
  onDisconnect: () => void;
  onToggleFilter: (key: keyof FilterToggles) => void;
}

export function ConnectionPanel({
  status,
  messageCount,
  channel,
  filters,
  onConnect,
  onDisconnect,
  onToggleFilter,
}: ConnectionPanelProps) {
  const [input, setInput] = useState("");
  const isConnected = status === "connected";
  const statusInfo = STATUS_STYLES[status];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const channelName = input.trim();
    if (channelName) {
      onConnect(channelName);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-100">
          Chat Question Tracker
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <span className={statusInfo.color}>{statusInfo.label}</span>
          {isConnected && (
            <span className="text-neutral-500">{messageCount} messages</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        {!isConnected ? (
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Channel name (or "mock" for testing)'
              className="flex-1 rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Connect
            </button>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm text-neutral-300">
              Watching <span className="font-medium text-purple-400">#{channel}</span>
            </span>
            <button
              type="button"
              onClick={onDisconnect}
              className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-400 hover:bg-neutral-800"
            >
              Disconnect
            </button>
          </div>
        )}
      </form>

      {/* Filter toggles */}
      <div className="flex gap-3 text-xs">
        <span className="text-neutral-500">Filters:</span>
        {(Object.keys(filters) as (keyof FilterToggles)[]).map((key) => (
          <button
            key={key}
            onClick={() => onToggleFilter(key)}
            className={`rounded px-2 py-0.5 ${
              filters[key]
                ? "bg-purple-600/20 text-purple-400"
                : "bg-neutral-800 text-neutral-500"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
