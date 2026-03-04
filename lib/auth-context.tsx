"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "user";

export interface AuthUser {
  nickname: string;
  role: UserRole;
  token: string;
  name?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (nickname: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<AuthUser, "name" | "phone" | "address">>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  login: async () => false,
  logout: () => {},
  updateProfile: () => {},
});

const STORAGE_KEY = "molandolan_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const login = async (nickname: string, password: string): Promise<boolean> => {
    const isAdmin = nickname === "admin" && password === "admin";
    persist({
      nickname,
      role: isAdmin ? "admin" : "user",
      token: `mock-token-${Date.now()}`,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = (data: Partial<Pick<AuthUser, "name" | "phone" | "address">>) => {
    if (!user) return;
    persist({ ...user, ...data });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
