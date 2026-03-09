"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/types";

const AuthContext = createContext<AuthUser | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthUser;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthUser {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useIsOwner(): boolean {
  const { staffRole } = useAuth();
  return staffRole.role === "owner";
}
