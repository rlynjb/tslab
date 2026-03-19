import { ChatMessage } from "../questions/types";

const MIN_LENGTH = 5;
const MIN_WORDS = 3;

export function passesQualityFilter(msg: ChatMessage): boolean {
  const text = msg.message.trim();

  if (text.length < MIN_LENGTH) return false;

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < MIN_WORDS) return false;

  return true;
}
