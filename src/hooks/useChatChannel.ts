import { useEffect } from "react";
import { echo } from "@/lib/echo";
import { MessageDto } from "@/types/chat";

export const useChatChannel = (
  chatId: number | undefined,
  handlers: {
    onMessage: (m: MessageDto) => void;
    onDelete: (id: number) => void;
    onEdit:   (m: MessageDto) => void;
  }
) => {
  useEffect(() => {
    if (!chatId) return;
    const channel = echo.private(`private-chat.${chatId}`);

    channel.listen(".message.sent",   ({ id, ...rest }: MessageDto) => handlers.onMessage({ id, ...rest }));
    channel.listen(".message.deleted", ({ id }: { id: number })     => handlers.onDelete(id));
    channel.listen(".message.edited", (msg: MessageDto)            => handlers.onEdit(msg));

    return () => { echo.leave(`private-chat.${chatId}`); };
  }, [chatId]);
};