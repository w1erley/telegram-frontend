import { MessageCircle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {useApi} from "@/hooks/useApi";
import {useState} from "react";
import {ChatSummary, MessageDto} from "@/types/chat";
import {useChatStore} from "@/contexts/ChatStoreContext";

interface ChatFooterProps {
  chat: ChatSummary
}

export function ChatFooter({ chat }: ChatFooterProps) {
  const { post } = useApi();
  const { dispatch } = useChatStore();

  const [body, setBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSendingMessage(true);
    try {
      if (chat.id) {
        const msg = await post<MessageDto>(
          `/chats/${chat.id}/messages`, { body: { body } }
        );
        dispatch({ type:"ADD_MSG", chatId: chat.id, msg });
      } else {
        // virtual chat
        const realChat = await post<ChatSummary>(
          `/chats/private/${chat?.recipient_id}`, { body: { body } }
        );
        dispatch({ type:"UPSERT_CHAT", payload: realChat });
        // active chat setter in parent should pick this up via hash change
      }
      setBody("");
    } finally { setSendingMessage(false); }
  };

  return (
    <form
      onSubmit={send}
      className="h-16 border-t flex items-center px-4 gap-2"
    >
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-5 w-5" />
      </Button>
      <Input
        className="flex-1"
        placeholder="Message"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <Button disabled={!body.trim() || sendingMessage} onClick={send}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Send
      </Button>
    </form>
  )
}