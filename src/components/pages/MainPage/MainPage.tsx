"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/AuthLayout/Sidebar/Sidebar";
import { Chat } from "@/components/features/Chat/Chat";
import {useScreenWidth} from "@/hooks/useScreenWidth";
import {useApi} from "@/hooks/useApi";
import {ChatSummary} from "@/types/chat";

const MainPage: React.FC = () => {
  const { get } = useApi()

  const [chats, setChats] = useState<ChatSummary[]>([]);

  const [activeChat, setActiveChat] = useState<any | null>(null);

  useEffect(() => {
    get<ChatSummary[]>("/chats").then(setChats);
  }, []);

  const getChatFromHash = () => {
    if (typeof window !== "undefined" && window.location.hash.startsWith("#@")) {
      const alias = window.location.hash.slice(1); // Remove the `#`
      return chats.find(chat => chat.alias === alias) || null
    }
    return null;
  };

  useEffect(() => {
    setActiveChat(getChatFromHash());

    const handleHashChange = () => {
      setActiveChat(getChatFromHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
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


  useEffect(() => {
    const getUser = async () => {
      const response = await get('/user');
      console.log('response', response);
    }

    getUser()
  }, []);

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
          "No chat selected"
        )}
      </div>

    </div>
  );
};

export default MainPage;
