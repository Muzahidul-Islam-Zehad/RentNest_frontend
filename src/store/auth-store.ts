"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/api";
import type { AuthUser, UserRole } from "@/types";

/**
 * Global auth state.
 * The backend also sets httpOnly cookies on login; the cookie is what the API
 * actually validates. This store mirrors the user (id/email/role) so the UI
 * can render role-aware navigation and guards without an extra request.
 */

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrated: boolean;

  setSession: (user: AuthUser, accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  /** Fetch fresh profile from /api/auth/me; returns null when not logged in */
  syncUser: () => Promise<AuthUser | null>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isHydrated: false,

      setSession: (user, accessToken) => set({ user, accessToken }),

      setUser: (user) => set({ user }),

      syncUser: async () => {
        try {
          const user = await authApi.me();
          set({ user });
          return user;
        } catch {
          // 401/403 → cookie expired or revoked
          set({ user: null, accessToken: null });
          return null;
        }
      },

      logout: () => set({ user: null, accessToken: null }),
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
