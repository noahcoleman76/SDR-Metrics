import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, body } from "../services/api";
import type { User } from "../types/models";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ user: User | null }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const data = await api<{ user: User }>("/auth/login", { method: "POST", ...body({ email, password }) });
        setUser(data.user);
      },
      async register(email, password) {
        const data = await api<{ user: User }>("/auth/register", { method: "POST", ...body({ email, password }) });
        setUser(data.user);
      },
      async logout() {
        await api<void>("/auth/logout", { method: "POST" });
        setUser(null);
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
