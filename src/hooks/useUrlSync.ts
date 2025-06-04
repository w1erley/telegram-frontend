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

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentKey(hash ? hash.slice(1) : null);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Resolve hash to active chat
  useEffect(() => {
    console.log("DISPATCHING", state.activeChatId, state.chats)
    if (!currentKey) {
      dispatch({ type: "SET_ACTIVE_CHAT", chatId: null });
      return;
    }

    // Check if chat exists in store
    const found = Object.values(state.chats).find(
      c => c.alias === currentKey || String(c.id) === currentKey
    );

    if (found) {
      console.log("DISPATCHING found")
      if (state.activeChatId !== found.id) {
        console.log("DISPATCHING found setting")
        dispatch({type: "SET_ACTIVE_CHAT", chatId: found.id!});
      }
      return;
    }

    // Fetch if not found and not loading
    if (!state.loading) {
      console.log("DISPATCHING !state.loading")
      get<ChatSummary>(`/chats/${encodeURIComponent(currentKey)}`)
        .then(chat => {
          console.log("DISPATCHING after request setting")
          dispatch({ type: "UPSERT_CHAT", payload: chat });
          dispatch({ type: "SET_ACTIVE_CHAT", chatId: chat.id! });
        })
        .catch(e => {
          toastError(e);
          console.log("DISPATCHING on error setting")
          dispatch({ type: "SET_ACTIVE_CHAT", chatId: null });
        });
    }
  }, [currentKey, state.chats, state.loading, state.activeChatId]);
};