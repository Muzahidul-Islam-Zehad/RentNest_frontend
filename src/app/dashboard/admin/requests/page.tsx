"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import RoleGuard from "@/components/guards/RoleGuard";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAdminRequests } from "@/hooks/useAdmin";
import { formatPrice, formatDate } from "@/lib/utils";

export default function AdminRequestsPage() {
  return (
    <RoleGuard role="ADMIN">
      <AdminRequests />
    </RoleGuard>
  );
}

function AdminRequests() {
  const { data: requests, isLoading } = useAdminRequests();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">All rental requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every request across the platform, newest first.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : requests?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Tenant</th>
                  <th className="px-5 py-3 font-semibold">Rent</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Requested</th>
                  <th className="px-5 py-3 text-right font-semibold">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">
                        {request.property?.title ?? "Deleted listing"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.property?.city ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {request.tenant?.email ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-primary">
                      {formatPrice(request.property?.price ?? 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {request.property && (
                        <Link
                          href={`/properties/${request.property.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Open
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No rental requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
