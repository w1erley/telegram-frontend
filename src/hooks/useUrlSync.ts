import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { toastError } from "@/lib/utils";
import {useChatStore} from "@/contexts/ChatStoreContext";
import {ChatSummary} from "@/types/chat";

export const useUrlSync = () => {
  const { get } = useApi();
  const { state, dispatch } = useChatStore();
  const [currentKey, setCurrentKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.location.hash.slice(1) || null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentKey(hash ? hash.slice(1) : null);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!currentKey) {
      dispatch({ type: "SET_ACTIVE_CHAT", chatId: null });
      return;
    }

    const found = Object.values(state.chats).find(
      c => c.alias === currentKey || String(c.id) === currentKey
    );

    if (found) {
      if (state.activeChatId !== found.id) {
        dispatch({type: "SET_ACTIVE_CHAT", chatId: found.id!});
      }
      return;
    }

    if (!state.loading) {
      get<ChatSummary>(`/chats/${encodeURIComponent(currentKey)}`)
        .then(chat => {
          dispatch({ type: "UPSERT_CHAT", payload: chat });
          dispatch({ type: "SET_ACTIVE_CHAT", chatId: chat.id! });
        })
        .catch(e => {
          toastError(e);
          dispatch({ type: "SET_ACTIVE_CHAT", chatId: null });
        });
    }
  }, [currentKey, state.chats, state.loading, state.activeChatId]);
};