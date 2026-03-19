import { ChatMessage } from "../questions/types";

const MOCK_USERS = [
  { username: "gamer42", displayName: "Gamer42" },
  { username: "pixelcat", displayName: "PixelCat" },
  { username: "alexplays", displayName: "AlexPlays" },
  { username: "streamfan99", displayName: "StreamFan99" },
  { username: "chatbot_lover", displayName: "ChatBot_Lover" },
  { username: "nightbot", displayName: "Nightbot" },
];

const MOCK_MESSAGES = [
  // Questions
  "What microphone are you using?",
  "What graphics settings are those?",
  "Are you streaming tomorrow?",
  "What keyboard do you have?",
  "How long have you been playing this game?",
  "What's your rank in this game?",
  "Can you show your setup?",
  "What monitor is that?",
  "Do you have a Discord server?",
  "What game are you playing next?",
  // Normal chat
  "GG",
  "lol nice play",
  "let's gooooo",
  "haha that was hilarious",
  "POG",
  "hello everyone",
  "first time here, love the stream",
  "F",
  "KEKW",
  // Commands
  "!rank",
  "!uptime",
  "!discord",
  "!followage",
  // Spam-like
  "?",
  "??",
  "lol?",
];

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startMockChat(
  onMessage: (msg: ChatMessage) => void,
  intervalMs = 1500
): void {
  stopMockChat();
  intervalId = setInterval(() => {
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const message = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
    onMessage({
      id: crypto.randomUUID(),
      username: user.username,
      displayName: user.displayName,
      message,
      timestamp: new Date(),
    });
  }, intervalMs);
}

export function stopMockChat(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
