import {useEffect, useRef, useState} from "react";
import {ChatMessage} from "./ChatMessage/ChatMessage";
import {ChatSummary, MessageDto} from "@/types/chat";
import {useApi} from "@/hooks/useApi";
import {useChatChannel} from "@/hooks/useChatChannel";

interface ChatContentProps {
  activeChat: ChatSummary
}

export function ChatContent({ activeChat }: ChatContentProps) {
  const { get } = useApi();
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  if (!activeChat) {
    return <div className="flex-1 flex items-center justify-center">Select a chat</div>;
  }

  console.log("messages", messages);

  useEffect(() => {
    if (!activeChat) return;
    get<MessageDto[]>(`/chats/${activeChat.id}/messages`).then(setMessages);
  }, [activeChat?.id]);

  useChatChannel(activeChat?.id, {
    onMessage: m => setMessages(prev => {
      if (prev.some(msg => msg.id === m.id)) return prev;
      return [...prev, m];
    }),
    onDelete:   id => setMessages(prev => prev.filter(m => m.id !== id)),
    onEdit:     m  => setMessages(prev => prev.map(x => x.id === m.id ? m : x)),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-opacity-90 bg-repeat">
      {messages.map(m => (
        <ChatMessage
          key={m.id}
          sender={m.sender.name}
          text={m.body}
          time={new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          isIncoming={m.sender_id !== activeChat.me_id}
          isOutgoing={m.sender_id === activeChat.me_id}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
