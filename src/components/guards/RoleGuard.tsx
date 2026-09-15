"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types";

/**
 * Client-side role gate for dashboard segments.
 * - Waits for zustand rehydration
 * - Renders immediately when a persisted user with the right role exists
 *   (no spinner delay on every navigation)
 * - Re-validates the session against /api/auth/me in the background; a dead
 *   session bounces to login
 */
export default function RoleGuard({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const syncUser = useAuthStore((s) => s.syncUser);
  const [sessionDead, setSessionDead] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.replace(`/auth/login?redirect=${window.location.pathname}`);
      return;
    }

    // Background re-validation — UI stays rendered while this runs
    let cancelled = false;
    syncUser().then((fresh) => {
      if (cancelled) return;
      if (!fresh) {
        setSessionDead(true);
        router.replace(`/auth/login?redirect=${window.location.pathname}`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isHydrated, user, syncUser, router]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || sessionDead) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user.role !== role) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <ShieldX className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold">Access denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is only for <span className="font-medium">{role.toLowerCase()}</span>{" "}
            accounts. You are signed in as {user.role.toLowerCase()}.
          </p>
          <button
            onClick={() => router.push(`/dashboard/${user.role.toLowerCase()}`)}
            className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to my dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
