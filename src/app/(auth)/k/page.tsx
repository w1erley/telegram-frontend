"use client"

import MainPage from "@/components/pages/MainPage/MainPage";
import {ChatStoreProvider} from "@/contexts/ChatStoreContext";
import {AuthProvider} from "@/contexts/AuthContext";

export default function Home() {
  return (
    <ChatStoreProvider>
      <AuthProvider>
        <MainPage />
      </AuthProvider>
    </ChatStoreProvider>
  );
}
