"use client";

import Link from "next/link";
import { ClipboardList, CreditCard, Home, Search } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import StatusBadge from "@/components/ui/StatusBadge";
import { useMyRentalRequests } from "@/hooks/useRentals";
import { formatPrice, formatDate } from "@/lib/utils";

export default function TenantDashboardPage() {
  return (
    <RoleGuard role="TENANT">
      <TenantDashboard />
    </RoleGuard>
  );
}

function TenantDashboard() {
  const { data: requests, isLoading } = useMyRentalRequests();

  const stats = {
    total: requests?.length ?? 0,
    pending: requests?.filter((r) => r.status === "PENDING").length ?? 0,
    approved: requests?.filter((r) => r.status === "APPROVED").length ?? 0,
    completed: requests?.filter((r) => r.status === "COMPLETED").length ?? 0,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Tenant overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Track your rental requests and payments.
      </p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total requests", value: stats.total, icon: ClipboardList, href: "/dashboard/tenant/requests" },
          { label: "Pending", value: stats.pending, icon: Search, href: "/dashboard/tenant/requests" },
          { label: "Approved", value: stats.approved, icon: CreditCard, href: "/dashboard/tenant/requests" },
          { label: "Completed", value: stats.completed, icon: Home, href: "/dashboard/tenant/payments" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-border bg-card p-5 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent requests */}
      <div className="mt-8 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-semibold">Recent requests</h2>
          <Link href="/dashboard/tenant/requests" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : requests?.length ? (
          <ul className="divide-y divide-border">
            {requests.slice(0, 5).map((req) => (
              <li key={req.id} className="flex items-center justify-between gap-3 p-4 sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {req.property?.title ?? "Property"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(req.startDate)} · {formatPrice(req.property?.price ?? 0)}/mo
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No rental requests yet.</p>
            <Link
              href="/properties"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Browse properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
