import {useApi} from "@/hooks/useApi";
import {useChatStore} from "@/contexts/ChatStoreContext";
import {ChatSummary} from "@/types/chat";
import {toastError} from "@/lib/utils";
import {useEffect} from "react";

export const useInitialDataLoad = () => {
  const { get } = useApi();
  const { dispatch } = useChatStore();

  useEffect(() => {
    dispatch({ type: "SET_LOADING", loading: true });

    get<ChatSummary[]>("/chats")
      .then(list => dispatch({ type: "SET_CHATS", payload: list }))
      .catch(toastError);
  }, []);
};