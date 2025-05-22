"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/AuthLayout/Sidebar/Sidebar";
import { Chat } from "@/components/features/Chat/Chat";
import {useScreenWidth} from "@/hooks/useScreenWidth";
import {useApi} from "@/hooks/useApi";
import {ChatSummary} from "@/types/chat";
import {toastError} from "@/lib/utils";

const MainPage: React.FC = () => {
  const { get } = useApi()

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSummary | null>(null);

  const [key, setKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.location.hash.slice(1) || null;
  });

  /* ───────── initial load ───────── */
  useEffect(() => {
    get<ChatSummary[]>("/chats")
      .then(setChats)
      .catch(toastError);
  }, []); // тільки на mount

  /* ───────── helper ───────── */
  const getHashKey = () => {
    if (typeof window === "undefined") return null;
    const h = window.location.hash;
    return h ? h.slice(1) : null;
  };

  /* ───────── resolve hash → activeChat ───────── */
  useEffect(() => {
    const key = getHashKey();
    console.log('key', key);
    if (!key) {
      setActiveChat(null);
      return;
    }

    // 1) already in list?
    const found = chats.find(c => c.alias === key || String(c.id) === key);
    if (found) {
      setActiveChat(found);
      return;
    }

    // 2) fetch the single chat
    get<ChatSummary>(`/chats/${encodeURIComponent(key)}`)
      .then(chat => {
        setActiveChat(chat);
      })
      .catch(e => {
        toastError(e);
        setActiveChat(null);
      });
  }, [key, chats]);               // ⬅️ без get — посилання стабільне

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


  // useEffect(() => {
  //   const getUser = async () => {
  //     const response = await get('/user');
  //     console.log('response', response);
  //   }
  //
  //   getUser()
  // }, []);

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
