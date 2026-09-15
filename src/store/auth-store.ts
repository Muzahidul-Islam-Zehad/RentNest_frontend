"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import type { AuthUser, UserRole } from "@/types";

/**
 * Handle to the TanStack Query cache, registered by QueryProvider so logout
 * can wipe all cached server data instantly. Avoids a circular import.
 */
let logoutSweeper: QueryClient | null = null;
export function setLogoutSweeper(client: QueryClient) {
  logoutSweeper = client;
}

/**
 * Global auth state.
 *
 * Session strategy: the JWT returned by login is mirrored into an httpOnly
 * first-party cookie via /api/auth/session (the backend's own cookie can't be
 * used cross-origin — see the API proxy route). This store keeps the user
 * object for instant role-aware rendering; the cookie is what authorizes API
 * calls through the proxy.
 */

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrated: boolean;

  setSession: (user: AuthUser, accessToken: string) => Promise<void>;
  setUser: (user: AuthUser) => void;
  /** Fetch fresh profile from /api/auth/me; returns null when not logged in */
  syncUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isHydrated: false,

      setSession: async (user, accessToken) => {
        // Persist the JWT in an httpOnly first-party cookie for the API proxy.
        // This cookie is also the middleware's session indicator.
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        set({ user, accessToken });
      },

      setUser: (user) => set({ user }),

      syncUser: async () => {
        try {
          const user = await authApi.me();
          set({ user });
          return user;
        } catch {
          // 401/403 → session expired or revoked → clean up instantly
          set({ user: null, accessToken: null });
          logoutSweeper?.clear();
          await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
          return null;
        }
      },

      logout: async () => {
        // 1. Update state FIRST → UI re-renders instantly
        set({ user: null, accessToken: null });
        // 2. Wipe all cached server data so no cross-account data lingers
        logoutSweeper?.clear();
        // 3. Clear the httpOnly JWT cookie and WAIT for it — callers navigate
        //    after this resolves, so the middleware already sees a signed-out
        //    user (prevents login-page → /dashboard bounce races)
        await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
      },
    }),
    {
      name: "rentnest-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    }
  )
);

/** Convenience role selector */
export function useRole(): UserRole | null {
  return useAuthStore((s) => s.user?.role ?? null);
}

/** Convenience auth checker */
export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => Boolean(s.user));
}
