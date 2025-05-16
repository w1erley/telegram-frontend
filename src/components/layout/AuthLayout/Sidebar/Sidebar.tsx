"use client"
import {
  MessageCircle,
  Search,
  ChevronRight,
  Menu,
  Bookmark,
  Archive,
  History,
  Users,
  Settings,
  MoreHorizontal,
  Plus,
  Moon,
  Zap,
  SwitchCamera,
  Info,
  AlertTriangle,
  Download,
} from "lucide-react"
import {JSX, useState} from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCookies } from 'next-client-cookies';

interface SidebarProps {
  chats: any[]
  activeChat: any
  setActiveChat: (chatAlias: string) => void
}

export function Sidebar({ chats, activeChat, setActiveChat }: SidebarProps) {
  const cookies = useCookies();

  const currentTheme = cookies.get('theme');

  const [chatGroups, setChatGroups] = useState([
    { id: 1, name: "All Chats", isActive: true },
    { id: 2, name: "Personal", isActive: false },
    { id: 3, name: "Work", isActive: false },
    { id: 4, name: "Friends", isActive: false },
    { id: 5, name: "Family", isActive: false },
    { id: 6, name: "News", isActive: false },
    { id: 7, name: "Important", isActive: false },
  ])

  const menuItems: { icon: JSX.Element; label: string; onClick?: () => void }[] = [
    { icon: <Bookmark className="h-5 w-5" />, label: "Saved Messages" },
    { icon: <Archive className="h-5 w-5" />, label: "Archived Chats" },
    { icon: <History className="h-5 w-5" />, label: "My Stories" },
    { icon: <Users className="h-5 w-5" />, label: "Contacts" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  const moreMenuItems = [
    {
      icon: <Moon className="h-5 w-5" />,
      label: currentTheme === "dark" ?
        "Disable Dark Mode" :
        "Enable Dark Mode",
      onClick: () => {
        currentTheme === "dark" ?
          cookies.set('theme', 'light') :
          cookies.set('theme', 'dark')
        window.location.reload();
      }
    },
    { icon: <Zap className="h-5 w-5" />, label: "Disable Animations" },
    { icon: <SwitchCamera className="h-5 w-5" />, label: "Switch to A version" },
    { icon: <Info className="h-5 w-5" />, label: "Telegram Features" },
    { icon: <AlertTriangle className="h-5 w-5" />, label: "Report Bug" },
    { icon: <Download className="h-5 w-5" />, label: "Install App" },
  ]

  const handleGroupChange = (groupId: number) => {
    setChatGroups(
      chatGroups.map((group) => ({
        ...group,
        isActive: group.id === groupId,
      })),
    )
  }

  const isOpen = true;

  return (
    <div
      className={cn(
        "h-full border-r bg-background flex flex-col transition-all duration-300",
        isOpen ? "w-full" : "w-0",
      )}
    >
      {isOpen ? (
        <>
          {/* Header with Search and Menu */}
          <div className="p-3 border-b flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start" side="bottom" sideOffset={5}>
                <div className="py-2">
                  <div className="p-3 flex items-center gap-2 border-b">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      К
                    </div>
                    <div className="font-medium">котакбас 1992</div>
                  </div>

                  <Button variant="ghost" className="w-full justify-start px-3 py-2 h-10 rounded-none">
                    <Plus className="h-5 w-5" />
                    <span className="ml-2">Add Account</span>
                  </Button>

                  <div className="border-t my-1"></div>

                  {menuItems.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 h-10 rounded-none"
                      onClick={item.onClick}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}

                  <div className="border-t my-1"></div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start px-3 py-2 h-10 rounded-none">
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="ml-2">More</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="end" side="right" sideOffset={-40}>
                      <div className="py-2">
                        {moreMenuItems.map((item, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            onClick={item?.onClick}
                            className="w-full justify-start px-3 py-2 h-10 rounded-none"
                          >
                            {item.icon}
                            <span className="ml-2">{item.label}</span>
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </PopoverContent>
            </Popover>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search" />
            </div>
          </div>

          {/* Chat Groups Selector */}
          <div className="border-b">
            <div className="px-3 py-2">
              <h3 className="text-sm font-medium mb-2">Chat Groups</h3>
              <div className="relative">
                <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
                  {chatGroups.map((group) => (
                    <Button
                      key={group.id}
                      variant={group.isActive ? "default" : "outline"}
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => handleGroupChange(group.id)}
                    >
                      {group.name}
                    </Button>
                  ))}
                </div>
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Chats */}
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => {
              const isActive = activeChat?.id === chat.id;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "p-3 flex items-center gap-3 cursor-pointer",
                    isActive ? "bg-primary text-light" : "hover:bg-popover",
                  )}
                  onClick={() => setActiveChat(chat.alias)}
                >
                  <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center text-primary-foreground">
                    {chat.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div className="font-medium truncate">{chat.name}</div>
                      <div className={cn("text-xs", !isActive && "text-muted-foreground")}>{chat.time}</div>
                    </div>
                    <div className={"flex justify-between"}>
                      <div className={cn("text-sm truncate", !isActive && "text-muted-foreground")}>{chat.lastMessage}</div>
                      {chat.unread > 0 && (
                        <div className={cn(
                          "min-w-5 h-5 p-1 rounded-full flex items-center justify-center text-xs",
                          isActive ? "bg-light text-primary" : "bg-secondary"
                        )}>
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center pt-3">
          <Button variant="ghost" size="icon" className="mb-3">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}

