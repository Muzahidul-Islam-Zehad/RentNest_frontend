"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2, ClipboardList, CreditCard, Home, LayoutDashboard,
  LogOut, ShieldCheck, Users,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const NAV: Record<UserRole, { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  TENANT: [
    { href: "/dashboard/tenant", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/tenant/requests", label: "My requests", icon: ClipboardList },
    { href: "/dashboard/tenant/payments", label: "Payments", icon: CreditCard },
  ],
  LANDLORD: [
    { href: "/dashboard/landlord", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/landlord/properties", label: "Properties", icon: Building2 },
    { href: "/dashboard/landlord/requests", label: "Requests", icon: ClipboardList },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/properties", label: "Listings", icon: Building2 },
    { href: "/dashboard/admin/requests", label: "Rental requests", icon: ClipboardList },
  ],
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const nav = NAV[user.role] ?? [];
  const base = `/dashboard/${user.role.toLowerCase()}`;

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 md:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.email}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> {user.role}
              </p>
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  pathname === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 border-t border-border pt-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Home className="h-4 w-4" /> Back to site
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
                router.refresh();
              }}
              className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Mobile nav */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium",
                pathname === href
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
