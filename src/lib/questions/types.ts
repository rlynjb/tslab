export interface ChatMessage {
  id: string;
  username: string;
  displayName: string;
  message: string;
  timestamp: Date;
}

export interface Question {
  id: string;
  username: string;
  displayName: string;
  message: string;
  timestamp: Date;
  status: "pending" | "answered" | "dismissed";
}

export type FilterFn = (msg: ChatMessage) => boolean;
