"use client"

import { ChatHeader } from "./ChatHeader/ChatHeader"
import { ChatContent } from "./ChatContent/ChatContent"
import { ChatFooter } from "./ChatFooter/ChatFooter"
import {ChatSummary} from "@/types/chat";

interface ChatProps {
  activeChat: ChatSummary
  toggleSidebar: () => void
}

export function Chat({ activeChat, toggleSidebar }: ChatProps) {
  console.log("activeChat", activeChat);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {activeChat ? (
        <>
          <ChatHeader activeChat={activeChat} toggleSidebar={toggleSidebar}/>
          <ChatContent activeChat={activeChat}/>
          <ChatFooter chat={activeChat}/>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">Select a chat</div>
      )}
    </div>
  )
}

// Export nested components
Chat.Header = ChatHeader
Chat.Content = ChatContent
Chat.Footer = ChatFooter

