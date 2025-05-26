import {useMemo, useEffect, useRef, useState} from "react";
import {ChatMessage} from "./ChatMessage/ChatMessage";
import {ChatSummary, MessageDto} from "@/types/chat";
import {useApi} from "@/hooks/useApi";
import {useChatChannel} from "@/hooks/useChatChannel";
import {useChatStore} from "@/contexts/ChatStoreContext";

interface ChatContentProps {
  activeChat: ChatSummary
}

export function ChatContent({ activeChat }: ChatContentProps) {
  const { state, dispatch } = useChatStore();
  const { get } = useApi();
  const [loadingMore, setLoadingMore] = useState(false);

  const messages = useMemo(() => {
    return state.messages[activeChat.id!] ?? [];
  }, [state.messages, activeChat.id]);
  const endRef   = useRef<HTMLDivElement>(null);
  const boxRef   = useRef<HTMLDivElement>(null);

  /* -------- first entry to a chat -------- */
  useEffect(() => {
    if (!activeChat.id) return;                        // virtual chat
    if (messages.length) return;                       // already cached

    get<MessageDto[]>(`/chats/${activeChat.id}/messages?limit=30`)
      .then(list => dispatch({ type:"APPEND_HISTORY",
        chatId: activeChat.id!, older: list }));
  }, [activeChat.id]);

  /* -------- live updates for open chat -------- */
  // useChatChannel(activeChat.id!, {
  //   onMessage: m  => dispatch({ type:"ADD_MSG",    chatId: activeChat.id!, msg:m }),
  //   onDelete:  id => dispatch({ type:"DELETE_MSG", chatId: activeChat.id!, msgId:id }),
  //   onEdit:    m  => dispatch({ type:"EDIT_MSG",   chatId: activeChat.id!, msg:m }),
  // });

  useEffect(() => {
    const saved = state.scroll[activeChat.id!];
    if (saved && boxRef.current) boxRef.current.scrollTop = saved;
  }, [activeChat.id]);

  const handleScroll = () => {
    if (!boxRef.current) return;
    dispatch({ type:"SET_SCROLL", chatId: activeChat.id!, offset: boxRef.current.scrollTop });

    if (boxRef.current.scrollTop === 0 && !loadingMore) {
      setLoadingMore(true);

      const prevHeight = boxRef.current.scrollHeight;

      const oldest = messages[0]?.id;
      get<MessageDto[]>(`/chats/${activeChat.id}/messages?before=${oldest}&limit=20`)
        .then(older => {
          dispatch({ type:"APPEND_HISTORY", chatId: activeChat.id!, older });

          requestAnimationFrame(() => {
            if (boxRef.current)
              boxRef.current.scrollTop =
                boxRef.current.scrollHeight - prevHeight;
          });
        })
        .finally(() => setLoadingMore(false));
    }
  };

  const atBottomRef = useRef(true);

  const updateBottomRef = () => {
    if (!boxRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = boxRef.current;
    atBottomRef.current = scrollHeight - (scrollTop + clientHeight) < 60;
  };

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    box.addEventListener("scroll", updateBottomRef);
    return () => box.removeEventListener("scroll", updateBottomRef);
  }, []);

  useEffect(() => {
    if (!endRef.current) return;
    if (loadingMore) return;
    if (!atBottomRef.current) return;

    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMore]);

  return (
    <div
      ref={boxRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 bg-opacity-90 bg-repeat"
    >
      {messages.map((m, i) => (
        <ChatMessage
          key={`${m.id}-${i}`}
          sender={m.sender.name}
          text={m.body}
          time={new Date(m.created_at)
            .toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
          isIncoming={m.sender_id !== activeChat.me_id}
          isOutgoing={m.sender_id === activeChat.me_id}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
