"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/AuthLayout/Sidebar/Sidebar";
import { Chat } from "@/components/features/Chat/Chat";
import { useScreenWidth } from "@/hooks/useScreenWidth";
import {useInitialDataLoad} from "@/components/pages/MainPage/hooks/useInitialDataLoad";
import {useUrlSync} from "@/hooks/useUrlSync";
import {useWebSocketConnection} from "@/hooks/useWebSocketConnection";
import {useChatStore} from "@/contexts/ChatStoreContext";

const MainPage: React.FC = () => {
  const { state, activeChat, navigateToChat } = useChatStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useInitialDataLoad();
  useUrlSync();
  useWebSocketConnection();

  const { isAboveThreshold: sidebarAlwaysOpened } = useScreenWidth(920);
  const { isBelowThreshold: sidebarFullWidth } = useScreenWidth(600);

  useEffect(() => {
    if (sidebarAlwaysOpened) {
      setIsSidebarOpen(true);
    }
  }, [sidebarAlwaysOpened]);

  const handleChatSelect = (alias: string) => {
    navigateToChat(alias);
    if (sidebarFullWidth) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const chats = Object.values(state.chats);

  return (
    <div className="flex h-screen w-full">
      {isSidebarOpen && (
        <div className={`transition-all duration-300 ${sidebarFullWidth ? "w-full" : "w-96"}`}>
          <Sidebar
            chats={chats}
            activeChat={activeChat}
            setActiveChat={handleChatSelect}
          />
        </div>
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarFullWidth && isSidebarOpen ? "hidden" : "block"
        }`}
      >
        {activeChat ? (
          <Chat activeChat={activeChat} toggleSidebar={toggleSidebar} />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-muted-foreground">
            {state.loading ? "Loading..." : "No chat selected"}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;