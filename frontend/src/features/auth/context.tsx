"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/shared/lib/storage";
import { ApiException } from "@/shared/api/types";
import type { User } from "@/entities/user/types";
import { authApi, type LoginPayload, type RegisterPayload } from "./api";

interface AuthContextValue {
  user: User | null;
  status: "loading" | "authenticated" | "guest";
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [status, setStatus] = React.useState<AuthContextValue["status"]>("loading");

  const refreshSession = React.useCallback(async () => {
    if (!tokenStorage.getAccess()) {
      setUser(null);
      setStatus("guest");
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
    } catch (err) {
      if (err instanceof ApiException && (err.status === 401 || err.status === 403)) {
        tokenStorage.clear();
      }
      setUser(null);
      setStatus("guest");
    }
  }, []);

  React.useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = React.useCallback(
    async (payload: LoginPayload) => {
      const tokens = await authApi.login(payload);
      tokenStorage.set(tokens.accessToken, tokens.refreshToken);
      setUser(tokens.user);
      setStatus("authenticated");
      router.push("/dashboard");
      router.refresh();
    },
    [router],
  );

  const register = React.useCallback(
    async (payload: RegisterPayload) => {
      const tokens = await authApi.register(payload);
      tokenStorage.set(tokens.accessToken, tokens.refreshToken);
      setUser(tokens.user);
      setStatus("authenticated");
      router.push("/dashboard");
      router.refresh();
    },
    [router],
  );

  const logout = React.useCallback(async () => {
    const refresh = tokenStorage.getRefresh();
    tokenStorage.clear();
    setUser(null);
    setStatus("guest");
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch {
        // best-effort; tokens are already cleared client-side
      }
    }
    router.push("/login");
    router.refresh();
  }, [router]);

  const value = React.useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
