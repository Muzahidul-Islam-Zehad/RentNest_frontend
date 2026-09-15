"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, ClipboardList, Users } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import { adminApi } from "@/lib/api";

export default function AdminDashboardPage() {
  return (
    <RoleGuard role="ADMIN">
      <AdminDashboard />
    </RoleGuard>
  );
}

function AdminDashboard() {
  const usersQuery = useQuery({ queryKey: ["adminUsers"], queryFn: adminApi.users });
  const propertiesQuery = useQuery({
    queryKey: ["adminProperties"],
    queryFn: adminApi.properties,
  });
  const requestsQuery = useQuery({
    queryKey: ["adminRequests"],
    queryFn: adminApi.rentalRequests,
  });

  const users = usersQuery.data ?? [];
  const properties = propertiesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];

  const stats = [
    {
      label: "Total users",
      value: users.length,
      sub: `${users.filter((u) => u.status === "BANNED").length} banned`,
      icon: Users,
      href: "/dashboard/admin/users",
    },
    {
      label: "Listings",
      value: properties.length,
      sub: `${properties.filter((p) => p.isAvailable).length} available`,
      icon: Building2,
      href: "/dashboard/admin/properties",
    },
    {
      label: "Rental requests",
      value: requests.length,
      sub: `${requests.filter((r) => r.status === "PENDING").length} pending`,
      icon: ClipboardList,
      href: "/dashboard/admin/requests",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Platform health at a glance.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, sub, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-border bg-card p-5 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-bold">
                  {usersQuery.isLoading || propertiesQuery.isLoading || requestsQuery.isLoading
                    ? "…"
                    : value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick lists */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold">Latest users</h2>
            <Link href="/dashboard/admin/users" className="text-sm text-primary hover:underline">
              Manage
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {users.slice(0, 5).map((user) => (
              <li key={user.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.status === "BANNED"
                      ? "bg-red-500/15 text-red-500"
                      : "bg-green-500/15 text-green-600 dark:text-green-400"
                  }`}
                >
                  {user.status ?? "ACTIVE"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold">Latest requests</h2>
            <Link href="/dashboard/admin/requests" className="text-sm text-primary hover:underline">
              Moderate
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {requests.slice(0, 5).map((req) => (
              <li key={req.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {req.property?.title ?? "Property"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {req.tenant?.email ?? "tenant"}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                  {req.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
