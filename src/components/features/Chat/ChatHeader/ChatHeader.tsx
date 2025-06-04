"use client";

import { ChevronLeft, Search, Phone, Video, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {useScreenWidth} from "@/hooks/useScreenWidth";

interface ChatHeaderProps {
  activeChat: any
  toggleSidebar: () => void
}

export function ChatHeader({ activeChat, toggleSidebar }: ChatHeaderProps) {
  const { isBelowThreshold: showBackButton } = useScreenWidth(920);

  return (
    <div className="h-16 border-b flex items-center justify-between px-4 gap-5">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className={"w-6"}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        <span>{activeChat?.name}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative max-w-64 mr-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input disabled={true} className="pl-9" placeholder="Search" />
        </div>
        {/*<Button variant="ghost" size="icon">*/}
        {/*  <Phone className="h-5 w-5" />*/}
        {/*</Button>*/}
        {/*<Button variant="ghost" size="icon">*/}
        {/*  <Video className="h-5 w-5" />*/}
        {/*</Button>*/}
        <Button disabled={true} variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
