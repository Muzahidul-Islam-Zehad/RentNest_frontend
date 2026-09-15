"use client";

import Link from "next/link";
import { CalendarDays, CreditCard, MessageSquare } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import StatusBadge from "@/components/ui/StatusBadge";
import { useMyRentalRequests } from "@/hooks/useRentals";
import { formatPrice, formatDate } from "@/lib/utils";
import type { RentalRequest } from "@/types";

export default function TenantRequestsPage() {
  return (
    <RoleGuard role="TENANT">
      <TenantRequests />
    </RoleGuard>
  );
}

function TenantRequests() {
  const { data: requests, isLoading } = useMyRentalRequests();

  return (
    <div>
      <h1 className="text-2xl font-bold">My rental requests</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Follow the status of each request. Approved requests can be paid directly.
      </p>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : requests?.length ? (
        <div className="mt-6 space-y-4">
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-muted p-10 text-center">
          <p className="font-medium">No rental requests yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Find a place you love and submit your first request.
          </p>
          <Link
            href="/properties"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Browse properties
          </Link>
        </div>
      )}
    </div>
  );
}

function RequestCard({ request }: { request: RentalRequest }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">
              {request.property?.title ?? "Property removed"}
            </h3>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {request.property?.location}, {request.property?.city}
          </p>
        </div>

        <p className="text-lg font-bold text-primary">
          {formatPrice(request.property?.price ?? 0)}
          <span className="text-xs font-normal text-muted-foreground"> /mo</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(request.startDate)}
          {request.endDate ? ` → ${formatDate(request.endDate)}` : " → ongoing"}
        </span>
        {request.message && (
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> with message
          </span>
        )}
      </div>

      {request.status === "REJECTED" && request.rejectionReason && (
        <p className="mt-3 rounded-lg bg-red-500/10 p-2.5 text-xs text-red-500">
          Rejection reason: {request.rejectionReason}
        </p>
      )}

      {/* Role/status CTAs */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {request.status === "APPROVED" && (
          <Link
            href={`/dashboard/tenant/requests/${request.id}/pay`}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <CreditCard className="h-4 w-4" /> Pay now
          </Link>
        )}
        {request.status === "COMPLETED" && request.property && (
          <Link
            href={`/dashboard/tenant/requests/${request.id}/review`}
            className="flex items-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            ★ Leave review
          </Link>
        )}
        {request.property && (
          <Link
            href={`/properties/${request.property.id}`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            View property
          </Link>
        )}
      </div>
    </div>
  );
}
