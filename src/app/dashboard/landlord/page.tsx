"use client";

import Link from "next/link";
import { Building2, ClipboardList, DollarSign, Plus } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import { useLandlordProperties } from "@/hooks/useLandlord";
import { formatPrice } from "@/lib/utils";

export default function LandlordDashboardPage() {
  return (
    <RoleGuard role="LANDLORD">
      <LandlordDashboard />
    </RoleGuard>
  );
}

function LandlordDashboard() {
  const { data: properties, isLoading } = useLandlordProperties();

  const stats = {
    total: properties?.length ?? 0,
    available: properties?.filter((p) => p.isAvailable).length ?? 0,
    monthlyEarnings: properties
      ?.filter((p) => p.isAvailable)
      .reduce((sum, p) => sum + (p.price ?? 0), 0) ?? 0,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Landlord overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your listings and rental requests.
          </p>
        </div>
        <Link
          href="/dashboard/landlord/properties/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New property
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total properties", value: stats.total, icon: Building2 },
          { label: "Available now", value: stats.available, icon: ClipboardList },
          {
            label: "Potential monthly earnings",
            value: formatPrice(stats.monthlyEarnings),
            icon: DollarSign,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Properties preview */}
      <div className="mt-8 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-semibold">Your listings</h2>
          <Link href="/dashboard/landlord/properties" className="text-sm text-primary hover:underline">
            Manage all
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : properties?.length ? (
          <ul className="divide-y divide-border">
            {properties.slice(0, 5).map((property) => (
              <li key={property.id} className="flex items-center justify-between p-4 sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{property.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {property.city} · {formatPrice(property.price)}/mo
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    property.isAvailable
                      ? "bg-green-500/15 text-green-600 dark:text-green-400"
                      : "bg-red-500/15 text-red-500"
                  }`}
                >
                  {property.isAvailable ? "Available" : "Unavailable"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No listings yet.</p>
            <Link
              href="/dashboard/landlord/properties/new"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Create your first listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
