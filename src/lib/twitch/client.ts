import { Client } from "tmi.js";
import { ChatMessage } from "../questions/types";

let client: Client | null = null;

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface TwitchClientCallbacks {
  onMessage: (msg: ChatMessage) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

export async function connectToChannel(
  channel: string,
  callbacks: TwitchClientCallbacks
): Promise<void> {
  await disconnect();

  callbacks.onStatusChange("connecting");

  client = new Client({
    connection: {
      secure: true,
      reconnect: true,
    },
    channels: [channel],
  });

  client.on("message", (_channel, tags, message, self) => {
    if (self) return;

    callbacks.onMessage({
      id: tags.id || crypto.randomUUID(),
      username: tags.username || "unknown",
      displayName: tags["display-name"] || tags.username || "Unknown",
      message,
      timestamp: new Date(),
    });
  });

  client.on("connected", () => {
    callbacks.onStatusChange("connected");
  });

  client.on("disconnected", () => {
    callbacks.onStatusChange("disconnected");
  });

  try {
    await client.connect();
  } catch {
    callbacks.onStatusChange("error");
  }
}

export async function disconnect(): Promise<void> {
  if (client) {
    try {
      await client.disconnect();
    } catch {
      // ignore disconnect errors
    }
    client = null;
  }
}
