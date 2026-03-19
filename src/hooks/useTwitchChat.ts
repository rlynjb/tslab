"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectToChannel,
  disconnect,
  ConnectionStatus,
} from "../lib/twitch/client";
import { startMockChat, stopMockChat } from "../lib/twitch/mock";
import { passesCommandFilter } from "../lib/filters/commands";
import { passesSpamFilter, resetSpamFilter } from "../lib/filters/spam";
import { passesQualityFilter } from "../lib/filters/quality";
import { isQuestion } from "../lib/questions/detector";
import { useQuestionStore } from "../lib/questions/store";
import { ChatMessage } from "../lib/questions/types";

export interface FilterToggles {
  commands: boolean;
  spam: boolean;
  quality: boolean;
}

export function useTwitchChat() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [messageCount, setMessageCount] = useState(0);
  const [channel, setChannel] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterToggles>({
    commands: true,
    spam: true,
    quality: true,
  });

  const addQuestion = useQuestionStore((s) => s.addQuestion);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const handleMessage = useCallback(
    (msg: ChatMessage) => {
      setMessageCount((c) => c + 1);

      const f = filtersRef.current;

      // Run filter pipeline
      if (f.commands && !passesCommandFilter(msg)) return;
      if (f.spam && !passesSpamFilter(msg)) return;
      if (f.quality && !passesQualityFilter(msg)) return;

      // Check if it's a question
      if (!isQuestion(msg.message)) return;

      addQuestion({
        username: msg.username,
        displayName: msg.displayName,
        message: msg.message,
        timestamp: msg.timestamp,
      });
    },
    [addQuestion]
  );

  const connect = useCallback(
    async (channelName: string) => {
      setMessageCount(0);
      resetSpamFilter();

      if (channelName.toLowerCase() === "mock") {
        setChannel("mock");
        setStatus("connected");
        startMockChat(handleMessage);
      } else {
        setChannel(channelName);
        await connectToChannel(channelName, {
          onMessage: handleMessage,
          onStatusChange: setStatus,
        });
      }
    },
    [handleMessage]
  );

  const disconnectChat = useCallback(async () => {
    stopMockChat();
    await disconnect();
    setStatus("disconnected");
    setChannel(null);
  }, []);

  const toggleFilter = useCallback((key: keyof FilterToggles) => {
    setFilters((f) => ({ ...f, [key]: !f[key] }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMockChat();
      disconnect();
    };
  }, []);

  return {
    status,
    messageCount,
    channel,
    filters,
    connect,
    disconnect: disconnectChat,
    toggleFilter,
  };
}
