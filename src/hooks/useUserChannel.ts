import { useEffect } from "react";
import { echo } from "@/lib/echo";
import { useChatStore } from "@/contexts/ChatStoreContext";
import { ChatSummary, MessageDto } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useUserChannel = (activeChatId: number | null) => {
  const { user } = useAuth();
  const { dispatch } = useChatStore();

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    const channel = echo.private(`user-chats.${userId}`);

    /* chat list updates */
    channel.listen(".chat.created",  (chat: ChatSummary) => {
      dispatch({ type:"UPSERT_CHAT", payload: chat });
    });
    channel.listen(".chat.updated",  (chat: ChatSummary) => {
      dispatch({ type:"UPSERT_CHAT", payload: chat });
    });

    /* message events */
    const addMsg   = (msg: MessageDto & { chat_id: number }) =>
      dispatch({ type:"ADD_MSG", chatId: msg.chat_id, msg });

    const editMsg  = (msg: MessageDto & { chat_id: number }) =>
      dispatch({ type:"EDIT_MSG", chatId: msg.chat_id, msg });

    const delMsg   = ({ chat_id, id }: { chat_id: number; id: number }) =>
      dispatch({ type:"DELETE_MSG", chatId: chat_id, msgId: id });

    channel.listen(".message.sent",   addMsg);
    channel.listen(".message.edited", editMsg);
    channel.listen(".message.deleted", delMsg);

    /* simple toast notification */
    channel.listen(".message.sent",  (msg: MessageDto & { chat_id: number }) => {
      console.log("chat_id", msg.chat_id, activeChatId);
      console.log("sender_id", msg.sender_id, userId);
      if (msg.chat_id !== activeChatId && msg.sender_id !== userId) {
        toast(`New message from ${msg.sender.name}`);
      }
    });

    return () => echo.leave(`user-chats.${userId}`);
  }, [userId, activeChatId]);
};
