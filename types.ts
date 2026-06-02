export interface User {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Room {
  code: string;
  users: User[];
  messages: Message[];
}

export type ChatScreenState = "landing" | "waiting" | "active";
