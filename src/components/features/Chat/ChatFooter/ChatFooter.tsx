import { MessageCircle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {useApi} from "@/hooks/useApi";
import {useState} from "react";
import {MessageDto} from "@/types/chat";

export function ChatFooter({ chatId }: { chatId: number }) {
  const { post } = useApi();
  const [body, setBody] = useState(""); //body message, not request

  const send = () => {
    if (!body.trim()) return;
    post<MessageDto>("/messages", { body: { chat_id: chatId, body } }).then(() => setBody(""));
  };

  return (
    <div className="h-16 border-t flex items-center px-4 gap-2">
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-5 w-5" />
      </Button>
      <Input className="flex-1" placeholder="Message" />
      <Button onClick={send}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Send
      </Button>
    </div>
  )
}