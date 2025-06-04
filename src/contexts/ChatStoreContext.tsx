import React, { createContext, useContext, useReducer } from "react";
import {ChatSummary, Message, MessageStat} from "@/types/chat";

type State = {
  chats: Record<number, ChatSummary>;
  messages: Record<number, Message[]>;
  scroll: Record<number, number>;
  activeChatId: number | null;  // ← Move this to store
  loading: boolean;
};

type Action =
  | { type: "SET_CHATS"; payload: ChatSummary[] }
  | { type: "UPSERT_CHAT"; payload: ChatSummary }
  | { type: "ADD_MSG"; chatId: number; msg: Message }
  | { type: "DELETE_MSG"; chatId: number; msgId: number }
  | { type: "EDIT_MSG"; chatId: number; msg: Message }
  | { type: "MARK_READ"; chatId: number; message: Message; user: number }
  | { type: "SET_SCROLL"; chatId: number; offset: number }
  | { type: "INIT_HISTORY"; chatId: number; list: Message[] }
  | { type: "PREPEND_OLDER"; chatId: number; older: Message[] }
  | { type: "APPEND_NEWER"; chatId: number; newer: Message[] }
  | { type: "SET_ACTIVE_CHAT"; chatId: number | null }
  | { type: "SET_LOADING"; loading: boolean };

const MAX_BUFFER = 50;

const dedup = (arr: Message[]) =>
  Array.from(new Map(arr.map(m => [m.id, m])).values());

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_CHATS":
      return {
        ...state,
        chats: Object.fromEntries(action.payload.map(c => [c.id!, c])),
        loading: false
      };

    case "UPSERT_CHAT":
      console.log("upsert chat", action.payload)
      return {
        ...state,
        chats: { ...state.chats, [action.payload.id!]: action.payload }
      };

    case "ADD_MSG": {
      const list = [
        ...(state.messages[action.chatId] ?? [])
          .filter(m => m.id !== action.msg.id),
        action.msg
      ];

      return {
        ...state,
        messages: { ...state.messages, [action.chatId]: list }
      };
    }

    case "DELETE_MSG": {
      const next = (state.messages[action.chatId] ?? [])
        .filter(m => m.id !== action.msgId);
      return {
        ...state,
        messages: { ...state.messages, [action.chatId]: next }
      };
    }

    case "EDIT_MSG": {
      const next = (state.messages[action.chatId] ?? [])
        .map(m => m.id === action.msg.id ? action.msg : m);
      return {
        ...state,
        messages: { ...state.messages, [action.chatId]: next }
      };
    }

    case "MARK_READ": {
      const { chatId, message: payloadMsg, user } = action;

      console.log(
        "MARK_READ payload:",
        "chatId =", chatId,
        "msgId =", payloadMsg,
        "user =", user
      );

      const incomingStat: MessageStat | undefined = (payloadMsg.stats ?? []).find(
        (s) => s.user_id === user
      );

      if (!incomingStat) {
        return state;
      }

      console.log("gfkjondfgojhuidfoghujik");

      const updatedList = (state.messages[chatId] ?? []).map((m) => {
        if (m.id <= payloadMsg.id) {
          const existingStats: MessageStat[] = m.stats ?? [];

          const idx = existingStats.findIndex((s) => s.user_id === user);

          if (idx !== -1) {
            const oldStat = existingStats[idx];
            if (oldStat.read_at) {
              return m;
            }

            const updatedStat: MessageStat = {
              ...oldStat,
              read_at: incomingStat.read_at,
              reacted_at: oldStat.reacted_at,
              reaction: oldStat.reaction,
              user: oldStat.user,
            };

            const newStatsArray = [...existingStats];
            newStatsArray[idx] = updatedStat;
            return { ...m, stats: newStatsArray };
          } else {
            const newStatForOlder: MessageStat = {
              message_id: m.id,
              user_id: user,
              read_at: incomingStat.read_at,
              reaction: "",
              reacted_at: null,
              user: incomingStat.user!,
            };

            return {
              ...m,
              stats: [...existingStats, newStatForOlder],
            };
          }
        }
        return m;
      });

      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: updatedList,
        },
      };
    }

    case "SET_SCROLL":
      console.log("setting scroll", action.chatId, action.offset, "");
      return {
        ...state,
        scroll: { ...state.scroll, [action.chatId]: action.offset }
      };

    case "INIT_HISTORY": {
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.chatId]: action.list.slice(-MAX_BUFFER)   // лише останні
        }
      };
    }

    case "PREPEND_OLDER": {
      // const merged = dedup([...action.older, ...(state.messages[action.chatId] ?? [])]);
      // const cropped = merged.slice(0, MAX_BUFFER);
      return {
        ...state,
        messages: {
          ...state.messages,
            [action.chatId]: [...action.older, ...(state.messages[action.chatId] ?? [])]
        }
      };
    }

    case "APPEND_NEWER": {
      const merged  = dedup([...(state.messages[action.chatId] ?? []), ...action.newer]);
      // const cropped = merged.slice(-MAX_BUFFER);   // зайві — найстаріші
      return {
        ...state,
        messages: { ...state.messages, [action.chatId]: merged }
      };
    }

    case "SET_ACTIVE_CHAT":
      return {
        ...state,
        activeChatId: action.chatId
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading
      };

    default:
      return state;
  }
};

const ChatStoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  activeChat: ChatSummary | null;
  navigateToChat: (aliasOrId: string) => void;
}>({
  state: { chats:{}, messages:{}, scroll:{}, activeChatId: null, loading: true },
  dispatch: () => {},
  activeChat: null,
  navigateToChat: () => {}
});

export const ChatStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    chats: {},
    messages: {},
    scroll: {},
    activeChatId: null,
    loading: true
  });

  const activeChat = state.activeChatId ? state.chats[state.activeChatId] || null : null;

  const navigateToChat = (aliasOrId: string) => {
    window.location.hash = aliasOrId;
  };

  return (
    <ChatStoreContext.Provider value={{ state, dispatch, activeChat, navigateToChat }}>
      {children}
    </ChatStoreContext.Provider>
  );
};

export const useChatStore = () => useContext(ChatStoreContext);