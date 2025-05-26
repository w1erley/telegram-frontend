import React, { createContext, useContext, useReducer } from "react";
import { ChatSummary, MessageDto } from "@/types/chat";

type State = {
  chats: Record<number, ChatSummary>;
  messages: Record<number, MessageDto[]>;
  scroll: Record<number, number>;
};

type Action =
  | { type: "SET_CHATS";  payload: ChatSummary[] }
  | { type: "UPSERT_CHAT"; payload: ChatSummary }
  | { type: "ADD_MSG";    chatId: number; msg: MessageDto }
  | { type: "DELETE_MSG"; chatId: number; msgId: number }
  | { type: "EDIT_MSG";   chatId: number; msg: MessageDto }
  | { type: "SET_SCROLL"; chatId: number; offset: number }
  | { type: "APPEND_HISTORY"; chatId: number; older: MessageDto[] };

const MAX_BUFFER = 50;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_CHATS":
      return { ...state,
        chats: Object.fromEntries(action.payload.map(c => [c.id!, c]))
      };

    case "UPSERT_CHAT":
      return { ...state,
        chats: { ...state.chats, [action.payload.id!]: action.payload }
      };

    case "ADD_MSG": {
      const list = [
        ...(state.messages[action.chatId] ?? [])
          .filter(m => m.id !== action.msg.id),   // ← remove if present
        action.msg
      ].slice(-MAX_BUFFER);
      return { ...state,
        messages: { ...state.messages, [action.chatId]: list }
      };
    }

    case "DELETE_MSG": {
      const next = (state.messages[action.chatId] ?? [])
        .filter(m => m.id !== action.msgId);
      return { ...state,
        messages: { ...state.messages, [action.chatId]: next }
      };
    }

    case "EDIT_MSG": {
      const next = (state.messages[action.chatId] ?? [])
        .map(m => m.id === action.msg.id ? action.msg : m);
      return { ...state,
        messages: { ...state.messages, [action.chatId]: next }
      };
    }

    case "SET_SCROLL":
      return { ...state,
        scroll: { ...state.scroll, [action.chatId]: action.offset }
      };

    case "APPEND_HISTORY": {
      const joined = [
        ...action.older,
        ...(state.messages[action.chatId] ?? [])
      ];
      if (joined.length > MAX_BUFFER) {
        joined.length = MAX_BUFFER;
      }
      return { ...state, messages: { ...state.messages, [action.chatId]: joined } };
    }

    default:
      return state;
  }
};

const ChatStoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: { chats:{}, messages:{}, scroll:{} }, dispatch: () => {} });

export const ChatStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    chats:{}, messages:{}, scroll:{}
  });

  return (
    <ChatStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatStoreContext.Provider>
  );
};

export const useChatStore = () => useContext(ChatStoreContext);
