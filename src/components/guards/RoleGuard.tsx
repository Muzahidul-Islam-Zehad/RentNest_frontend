"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types";

/**
 * Client-side role gate for dashboard segments.
 * - Waits for zustand rehydration
 * - Re-validates the session against /api/auth/me once
 * - Renders an access-denied card when the role does not match
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
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.replace(`/auth/login?redirect=${window.location.pathname}`);
      return;
    }

    // Re-validate the cookie session with the backend
    syncUser().then((fresh) => {
      if (!fresh) {
        router.replace(`/auth/login?redirect=${window.location.pathname}`);
        return;
      }
      setChecked(true);
    });
  }, [isHydrated, user, syncUser, router]);

  if (!isHydrated || !checked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user?.role !== role) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <ShieldX className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold">Access denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is only for <span className="font-medium">{role.toLowerCase()}</span>{" "}
            accounts. You are signed in as {user?.role?.toLowerCase() ?? "unknown"}.
          </p>
          <button
            onClick={() => router.push(`/dashboard/${user?.role?.toLowerCase()}`)}
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
