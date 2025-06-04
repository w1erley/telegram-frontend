import React, { createContext, useContext, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { toastError } from "@/lib/utils";

export interface User {
  id: number;
  name: string;
  username: string;
  avatar_url?: string;
  // …whatever else you return from GET /user
}

type AuthState = {
  user:    User | null;
  loading: boolean;
  refresh: () => Promise<void>;  // refetch /user
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { get } = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      setUser(await get<User>("/user/me"));
    } catch (e) {
      toastError(e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* fetch once on mount */
  useEffect(() => { fetchUser(); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
