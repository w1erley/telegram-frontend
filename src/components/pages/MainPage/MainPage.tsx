"use client";

import {useEffect, useMemo, useState, useRef} from "react";
import { Sidebar } from "@/components/layout/AuthLayout/Sidebar/Sidebar";
import { Chat } from "@/components/features/Chat/Chat";
import {useScreenWidth} from "@/hooks/useScreenWidth";
import {useApi} from "@/hooks/useApi";
import {ChatSummary} from "@/types/chat";
import {toastError} from "@/lib/utils";
import {useChatStore} from "@/contexts/ChatStoreContext";
import {useUserChannel} from "@/hooks/useUserChannel";

const MainPage: React.FC = () => {
  const { get } = useApi()
  const { state, dispatch } = useChatStore();

  const chats = useMemo(() => {
    return Object.values(state.chats) || []
  }, [state.chats]);

  const [activeChat, setActiveChat] = useState<ChatSummary | null>(null);

  // Use ref to track the current activeChat to avoid dependency issues
  const activeChatRef = useRef<ChatSummary | null>(null);
  activeChatRef.current = activeChat;

  const [key, setKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.location.hash.slice(1) || null;
  });

  useUserChannel(activeChat?.id ?? null);

  /* ───────── initial load ───────── */
  useEffect(() => {
    get<ChatSummary[]>("/chats")
      .then(list => dispatch({ type:"SET_CHATS", payload: list }))
      .catch(toastError);
  }, []); // тільки на mount

  /* ───────── resolve hash → activeChat ───────── */
  useEffect(() => {
    if (!key) {
      setActiveChat(null);
      return;
    }

    const currentActiveChat = activeChatRef.current;

    // Check if we need to upgrade a temporary chat (null id) to a real one
    if (
      currentActiveChat &&
      currentActiveChat.id === null &&
      currentActiveChat.alias === key
    ) {
      const upgraded = chats.find(c => c.alias === currentActiveChat.alias);
      if (upgraded) {
        setActiveChat(upgraded);
      }
      return;
    }

    // 1) Check if already have the right chat active
    if (currentActiveChat && (currentActiveChat.alias === key || String(currentActiveChat.id) === key)) {
      return; // No need to change
    }

    // 2) Look for chat in the list
    const found = chats.find(c => c.alias === key || String(c.id) === key);
    if (found) {
      setActiveChat(found);
      return;
    }

    // 3) Fetch the single chat if not found
    get<ChatSummary>(`/chats/${encodeURIComponent(key)}`)
      .then(chat => {
        setActiveChat(chat);
      })
      .catch(e => {
        toastError(e);
        setActiveChat(null);
      });
  }, [key, chats, get]); // Remove activeChat from dependencies

  /* ───────── listen hashchange ───────── */
  useEffect(() => {
    const handle = () => {
      const hash = window.location.hash;
      setKey(hash ? hash.slice(1) : null);
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);

  const handleChatSelect = (alias: string) => {
    window.location.hash = alias;
    if (sidebarFullWidth) {
      setIsSidebarOpen(false)
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { isAboveThreshold: sidebarAlwaysOpened } = useScreenWidth(920);
  const { isBelowThreshold: sidebarFullWidth } = useScreenWidth(600);

  useEffect(() => {
    if (sidebarAlwaysOpened) {
      setIsSidebarOpen(true);
    }
  }, [sidebarAlwaysOpened]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full">
      {isSidebarOpen && (
        <div className={`transition-all duration-300 ${sidebarFullWidth ? "w-full" : "w-96"}`}>
          <Sidebar chats={chats} activeChat={activeChat} setActiveChat={handleChatSelect} />
        </div>
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarFullWidth && isSidebarOpen ? "hidden" : "block"
        }`}
      >
        {activeChat ? (
          <Chat activeChat={activeChat} toggleSidebar={toggleSidebar}/>
        ) : (
          <div
            className={"flex items-center justify-center h-full w-full text-muted-foreground"}
          >
            No chat selected
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;