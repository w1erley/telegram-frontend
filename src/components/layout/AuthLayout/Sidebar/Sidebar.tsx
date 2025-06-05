"use client"
import {
  MessageCircle,
  Search,
  ChevronRight,
  Menu,
  Bookmark,
  Archive,
  Users,
  Settings,
  MoreHorizontal,
  Plus,
  Moon,
  User,
  Megaphone, LogOut
} from "lucide-react"
import {JSX, useState} from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {cn, formatTime, toastError} from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCookies } from 'next-client-cookies';

import { Settings as SettingsLayer, Search as SearchLayer } from "./Layers"
import {ChatSummary, type Message} from "@/types/chat";
import {useAuth} from "@/contexts/AuthContext";
import ActiveSessions from "@/components/layout/AuthLayout/Sidebar/Layers/ActiveSessions";
import {useApi} from "@/hooks/useApi";

interface SidebarProps {
  chats: ChatSummary[]
  activeChat: ChatSummary | null
  setActiveChat: (chatAlias: string) => void
}

export type LayerType = 'main' | 'archive' | 'search' | 'active_sessions' | 'settings'

export function Sidebar({ chats, activeChat, setActiveChat }: SidebarProps) {
  const { post } = useApi()

  const cookies = useCookies();
  const currentTheme = cookies.get('theme');

  const { user } = useAuth()

  const [activeLayer, setActiveLayer] = useState<LayerType>('main');

  // const [chatGroups, setChatGroups] = useState([
  //   { id: 1, name: "All Chats", isActive: true },
  //   { id: 2, name: "Personal", isActive: false },
  //   { id: 3, name: "Work", isActive: false },
  //   { id: 4, name: "Friends", isActive: false },
  //   { id: 5, name: "Family", isActive: false },
  //   { id: 6, name: "News", isActive: false },
  //   { id: 7, name: "Important", isActive: false },
  // ]);
  //
  // const archivedChats = [
  //   { id: 101, name: "Old Project", alias: "old-project", lastMessage: "We should archive this project", time: "2w", unread: 0 },
  //   { id: 102, name: "Previous Team", alias: "prev-team", lastMessage: "Thanks for all your work!", time: "1m", unread: 0 },
  //   { id: 103, name: "Conference 2023", alias: "conf-2023", lastMessage: "The slides are now available", time: "3m", unread: 0 },
  // ];
  //
  // // Sample contacts
  // const contacts = [
  //   { id: 201, name: "Alex Johnson", alias: "alex", status: "online", lastSeen: "now" },
  //   { id: 202, name: "Maria Garcia", alias: "maria", status: "offline", lastSeen: "2h ago" },
  //   { id: 203, name: "James Smith", alias: "james", status: "online", lastSeen: "now" },
  //   { id: 204, name: "Sarah Wilson", alias: "sarah", status: "offline", lastSeen: "yesterday" },
  //   { id: 205, name: "David Brown", alias: "david", status: "online", lastSeen: "now" },
  // ];

  // Settings options


  const menuItems: { icon: JSX.Element; label: string; onClick?: () => void }[] = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Create group"
    },
    {
      icon: <Megaphone className="h-5 w-5" />,
      label: "Create channel"
    },
    {
      icon: <Bookmark className="h-5 w-5" />,
      label: "Saved Messages"
    },
    {
      icon: <Archive className="h-5 w-5" />,
      label: "Archived Chats"
    },
    // { icon: <History className="h-5 w-5" />, label: "My Stories" },
    {
      icon: <User className="h-5 w-5" />,
      label: "Contacts"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      onClick: () => setActiveLayer('settings')
    },
  ];

  const handleLogout = async () => {
    try {
      await post(`/logout`)
      cookies.remove("access_token");
      window.location.reload();
    } catch (e) {
      toastError(e)
    }
  }

  const moreMenuItems = [
    {
      icon: <Moon className="h-5 w-5" />,
      label: currentTheme === "dark" ?
        "Disable Dark Mode" :
        "Enable Dark Mode",
      onClick: () => {
        void (currentTheme === "dark"
          ? cookies.set('theme', 'light')
          : cookies.set('theme', 'dark'))
        window.location.reload();
      }
    },
    {
      icon: <LogOut className="h-5 w-5" />,
      label: "Logout",
      onClick: handleLogout,
    },
    // { icon: <Zap className="h-5 w-5" />, label: "Disable Animations" },
    // { icon: <SwitchCamera className="h-5 w-5" />, label: "Switch to A version" },
    // { icon: <Info className="h-5 w-5" />, label: "Telegram Features" },
    // { icon: <AlertTriangle className="h-5 w-5" />, label: "Report Bug" },
    // { icon: <Download className="h-5 w-5" />, label: "Install App" },
  ]

  // const handleGroupChange = (groupId: number) => {
  //   setChatGroups(
  //     chatGroups.map((group) => ({
  //       ...group,
  //       isActive: group.id === groupId,
  //     })),
  //   )
  // }

  const isOpen = true;

  const handleSearchClick = () => {
    setActiveLayer('search');
  };

  const filteredChats = chats.sort((a, b) => {
    const aTime = new Date(a.last_message?.created_at ?? a.created_at).getTime();
    const bTime = new Date(b.last_message?.created_at ?? b.created_at).getTime();
    return bTime - aTime;
  });

  return (
    <div className="relative h-full overflow-hidden">
      {activeLayer === 'main' && (
        <div
          className={cn(
            "absolute inset-0 h-full border-r bg-background flex flex-col transition-transform duration-300 ease-in-out",
            activeLayer === 'main' ? "translate-x-0" : "translate-x-full"
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
                          {user?.username.charAt(0)}
                        </div>
                        <div className="font-medium">{user?.username}</div>
                      </div>

                      <Button disabled={true} variant="ghost" className="w-full justify-start px-3 py-2 h-10 rounded-none">
                        <Plus className="h-5 w-5" />
                        <span className="ml-2">Add Account</span>
                      </Button>

                      <div className="border-t my-1"></div>

                      {menuItems.map((item, index) => (
                        <Button
                          disabled={!item?.onClick}
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
                  <Input className="pl-9" placeholder="Search" onClick={handleSearchClick}/>
                </div>
              </div>

              {/*/!* Chat Groups Selector *!/*/}
              {/*<div className="border-b">*/}
              {/*  <div className="px-3 py-2">*/}
              {/*    <h3 className="text-sm font-medium mb-2">Chat Groups</h3>*/}
              {/*    <div className="relative">*/}
              {/*      <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">*/}
              {/*        {chatGroups.map((group) => (*/}
              {/*          <Button*/}
              {/*            key={group.id}*/}
              {/*            variant={group.isActive ? "default" : "outline"}*/}
              {/*            size="sm"*/}
              {/*            className="whitespace-nowrap"*/}
              {/*            onClick={() => handleGroupChange(group.id)}*/}
              {/*          >*/}
              {/*            {group.name}*/}
              {/*          </Button>*/}
              {/*        ))}*/}
              {/*      </div>*/}
              {/*      <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</div>*/}

              {/* Chats */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.map((chat) => {
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
                        {chat?.title?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div className="font-medium truncate">{chat.title}</div>
                          <div className={cn("text-xs", !isActive && "text-muted-foreground")}>{formatTime(chat?.last_message?.created_at)}</div>
                        </div>
                        <div className={"flex justify-between"}>
                          <div className={cn("text-sm truncate", !isActive && "text-muted-foreground")}>{chat?.last_message?.body}</div>
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
      )}
      {/* Archive Layer */}
      {/*{activeLayer === 'archive' && (*/}
      {/*  <div*/}
      {/*    className={cn(*/}
      {/*      "absolute inset-0 h-full border-r bg-background flex flex-col transition-transform duration-300 ease-in-out",*/}
      {/*      activeLayer === 'archive' ? "translate-x-0 z-20" : "translate-x-full z-10"*/}
      {/*    )}*/}
      {/*  >*/}
      {/*    <div className="p-3 border-b flex items-center gap-2">*/}
      {/*      <Button variant="ghost" size="icon" onClick={() => setActiveLayer('main')}>*/}
      {/*        <ArrowLeft className="h-5 w-5" />*/}
      {/*      </Button>*/}
      {/*      <h2 className="font-medium">Archived Chats</h2>*/}
      {/*    </div>*/}
      {/*    <div className="flex-1 overflow-y-auto">*/}
      {/*      {archivedChats.map((chat) => (*/}
      {/*        <div*/}
      {/*          key={chat.id}*/}
      {/*          className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted"*/}
      {/*          onClick={() => {*/}
      {/*            setActiveChat(chat.alias);*/}
      {/*            setActiveLayer('main');*/}
      {/*          }}*/}
      {/*        >*/}
      {/*          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">*/}
      {/*            {chat.name.charAt(0)}*/}
      {/*          </div>*/}
      {/*          <div className="flex-1 min-w-0">*/}
      {/*            <div className="flex justify-between">*/}
      {/*              <div className="font-medium truncate">{chat.name}</div>*/}
      {/*              <div className="text-xs text-muted-foreground">{chat.time}</div>*/}
      {/*            </div>*/}
      {/*            <div className="text-sm truncate text-muted-foreground">{chat.lastMessage}</div>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/* Search Layer */}
      {activeLayer === 'search' && (
        <SearchLayer activeLayer={activeLayer} setActiveLayer={setActiveLayer}/>
      )}

      {/* Settings Layer */}
      {activeLayer === 'settings' && (
        <SettingsLayer
          user={user}
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
        />
      )}

      {activeLayer === 'active_sessions' && (
        <ActiveSessions activeLayer={activeLayer} setActiveLayer={setActiveLayer}/>
      )}
    </div>
  )
}

