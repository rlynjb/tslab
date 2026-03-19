import { ChatMessage } from "../questions/types";

const BOT_USERNAMES = new Set([
  "nightbot",
  "streamelements",
  "moobot",
  "streamlabs",
  "soundalerts",
  "fossabot",
  "wizebot",
]);

export function passesCommandFilter(msg: ChatMessage): boolean {
  if (msg.message.startsWith("!")) return false;
  if (BOT_USERNAMES.has(msg.username.toLowerCase())) return false;
  return true;
}
