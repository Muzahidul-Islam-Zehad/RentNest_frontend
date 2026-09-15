"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import { useAdminProperties } from "@/hooks/useAdmin";
import { formatPrice, formatDate, cn } from "@/lib/utils";

export default function AdminPropertiesPage() {
  return (
    <RoleGuard role="ADMIN">
      <AdminProperties />
    </RoleGuard>
  );
}

function AdminProperties() {
  const { data: properties, isLoading } = useAdminProperties();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">All listings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect every property listed on the platform.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : properties?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Landlord</th>
                  <th className="px-5 py-3 font-semibold">City</th>
                  <th className="px-5 py-3 font-semibold">Rent</th>
                  <th className="px-5 py-3 font-semibold">Availability</th>
                  <th className="px-5 py-3 font-semibold">Listed</th>
                  <th className="px-5 py-3 text-right font-semibold">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{property.title}</p>
                      <p className="text-xs text-muted-foreground">{property.location}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {property.landlord?.email ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{property.city}</td>
                    <td className="px-5 py-3.5 font-semibold text-primary">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          property.isAvailable
                            ? "bg-green-500/15 text-green-600 dark:text-green-400"
                            : "bg-red-500/15 text-red-500"
                        )}
                      >
                        {property.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDate(property.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/properties/${property.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No listings on the platform yet.
          </div>
        )}
      </div>
    </div>
  );
}
