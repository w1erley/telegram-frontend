import {useEffect, useRef} from "react";
import { echo } from "@/lib/echo";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {useChatStore} from "@/contexts/ChatStoreContext";
import {ChatSummary, Message} from "@/types/chat";

export const useWebSocketConnection = () => {
  const { user } = useAuth();
  const { state, dispatch } = useChatStore();

  const activeChatIdRef = useRef<number | null>(state.activeChatId);
  useEffect(() => {
    activeChatIdRef.current = state.activeChatId;
  }, [state.activeChatId]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = echo.private(`user-chats.${user.id}`);

    const handleChatCreated = (chat: ChatSummary) => {
      dispatch({ type: "UPSERT_CHAT", payload: chat });
    };

    const handleChatUpdated = (chat: ChatSummary) => {
      dispatch({ type: "UPSERT_CHAT", payload: chat });
    };

    const handleMessageSent = (msg: Message & { chat_id: number }) => {
      dispatch({ type: "ADD_MSG", chatId: msg.chat_id, msg });

      console.log("handle message sent", msg, state.activeChatId);

      if (
        msg.chat_id !== activeChatIdRef.current &&
        msg.sender_id !== user.id
      ) {
        toast(`${msg.sender.name}: ${msg.body}`);
      }
    };

    const handleMessageEdited = (msg: Message & { chat_id: number }) => {
      dispatch({ type: "EDIT_MSG", chatId: msg.chat_id, msg });
    };

    const handleMessageDeleted = ({ chat_id, id }: { chat_id: number; id: number }) => {
      dispatch({ type: "DELETE_MSG", chatId: chat_id, msgId: id });
    };

    const handleMessageRead = (payload: Message & { reader_id: number }) => {
      dispatch({
        type: "MARK_READ",
        chatId: payload.chat_id,
        message: payload,
        user: payload.reader_id
      });
    }

    channel.listen(".chat.created", handleChatCreated);
    channel.listen(".chat.updated", handleChatUpdated);
    channel.listen(".message.sent", handleMessageSent);
    channel.listen(".message.edited", handleMessageEdited);
    channel.listen(".message.deleted", handleMessageDeleted);
    channel.listen(".message.read", handleMessageRead);


    return () => echo.leave(`user-chats.${user.id}`);
  }, [user?.id]);
};