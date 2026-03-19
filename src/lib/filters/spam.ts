import { ChatMessage } from "../questions/types";

const recentMessages = new Map<string, { messages: string[]; timestamps: number[] }>();

const DUPLICATE_WINDOW_MS = 60_000;
const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_MAX = 3;

export function passesSpamFilter(msg: ChatMessage): boolean {
  const key = msg.username.toLowerCase();
  const now = msg.timestamp.getTime();

  if (!recentMessages.has(key)) {
    recentMessages.set(key, { messages: [], timestamps: [] });
  }

  const history = recentMessages.get(key)!;

  // Clean old entries
  const cutoff = now - DUPLICATE_WINDOW_MS;
  while (history.timestamps.length > 0 && history.timestamps[0] < cutoff) {
    history.timestamps.shift();
    history.messages.shift();
  }

  // Check duplicate
  const normalized = msg.message.toLowerCase().trim();
  if (history.messages.includes(normalized)) {
    return false;
  }

  // Check rate limit (questions per window)
  const rateCutoff = now - RATE_LIMIT_WINDOW_MS;
  const recentCount = history.timestamps.filter((t) => t >= rateCutoff).length;
  if (recentCount >= RATE_LIMIT_MAX) {
    return false;
  }

  // Track this message
  history.messages.push(normalized);
  history.timestamps.push(now);

  return true;
}

export function resetSpamFilter(): void {
  recentMessages.clear();
}
