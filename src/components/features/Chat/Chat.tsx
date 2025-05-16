"use client"

import type { Dispatch, SetStateAction } from "react"
import { ChatHeader } from "./ChatHeader/ChatHeader"
import { ChatContent } from "./ChatContent/ChatContent"
import { ChatFooter } from "./ChatFooter/ChatFooter"

interface ChatProps {
  activeChat: any
  toggleSidebar: () => void
}

export function Chat({ activeChat, toggleSidebar }: ChatProps) {
  console.log("activeChat", activeChat);

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader activeChat={activeChat} toggleSidebar={toggleSidebar}/>
      <ChatContent activeChat={activeChat}/>
      <ChatFooter />
    </div>
  )
}

// Export nested components
Chat.Header = ChatHeader
Chat.Content = ChatContent
Chat.Footer = ChatFooter

