export type ChatType = "private" | "group" | "channel";

export interface ChatSummary {
  id: number;
  type: ChatType;
  title: string | null;
  alias: string;
  last_message?: Message;
  unread: number;
  me_id: number;
  recipient_id?: number | null;
  created_at: string | Date;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  body: string;
  type: "plain";
  reply_to_id: number | null;
  thread_root_id: number | null;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  sender: { id: number; name: string };
  stats: MessageStat[];
}

export interface MessageStat {
  message_id: number;
  user_id: number;
  reaction: string | null;
  user?: { id: number; name: string; username: string };
  read_at: Date | string | null;
  reacted_at: Date | string | null;
}
