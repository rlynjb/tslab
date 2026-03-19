"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { QuestionQueue } from "@/components/QuestionQueue";
import { useTwitchChat } from "@/hooks/useTwitchChat";

function Dashboard() {
  const searchParams = useSearchParams();
  const chat = useTwitchChat();

  // Auto-connect if channel is in URL params
  useEffect(() => {
    const channel = searchParams.get("channel");
    if (channel && chat.status === "disconnected") {
      chat.connect(channel);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <ConnectionPanel
        status={chat.status}
        messageCount={chat.messageCount}
        channel={chat.channel}
        filters={chat.filters}
        onConnect={chat.connect}
        onDisconnect={chat.disconnect}
        onToggleFilter={chat.toggleFilter}
      />
      <QuestionQueue />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
