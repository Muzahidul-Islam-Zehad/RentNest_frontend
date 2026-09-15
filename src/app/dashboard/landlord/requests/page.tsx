"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarDays, Check, Mail, MessageSquare, X } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import StatusBadge from "@/components/ui/StatusBadge";
import { landlordApi } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { useLandlordRequests } from "@/hooks/useLandlord";
import { formatPrice, formatDate } from "@/lib/utils";
import type { RentalRequest } from "@/types";

export default function LandlordRequestsPage() {
  return (
    <RoleGuard role="LANDLORD">
      <LandlordRequests />
    </RoleGuard>
  );
}

function LandlordRequests() {
  const { data: requests, isLoading } = useLandlordRequests();

  const counts = {
    pending: requests?.filter((r) => r.status === "PENDING").length ?? 0,
    approved: requests?.filter((r) => r.status === "APPROVED").length ?? 0,
    rejected: requests?.filter((r) => r.status === "REJECTED").length ?? 0,
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">Rental requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
        </p>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : requests?.length ? (
        <div className="mt-6 space-y-4">
          {requests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-muted p-10 text-center">
          <p className="font-medium">No requests received yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Requests from tenants will appear here as soon as they are submitted.
          </p>
        </div>
      )}
    </div>
  );
}

function RequestRow({ request }: { request: RentalRequest }) {
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const updateStatus = useMutation({
    mutationFn: ({ status, rejectionReason }: { status: "APPROVED" | "REJECTED"; rejectionReason?: string }) =>
      landlordApi.updateRequestStatus(request.id, status, rejectionReason),

    onMutate: async ({ status, rejectionReason }) => {
      // Optimistic update — flip the badge instantly
      await queryClient.cancelQueries({ queryKey: ["landlordRequests"] });
      const previous = queryClient.getQueryData(["landlordRequests"]);
      queryClient.setQueryData(
        ["landlordRequests"],
        (old: RentalRequest[] | undefined) =>
          old?.map((r) =>
            r.id === request.id ? { ...r, status, rejectionReason: rejectionReason ?? r.rejectionReason } : r
          )
      );
      return { previous };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["landlordRequests"], context.previous);
      }
      toast.error(toApiError(error).message);
    },

    onSuccess: (_data, vars) => {
      toast.success(
        vars.status === "APPROVED"
          ? "Request approved — the tenant can now pay."
          : "Request rejected."
      );
      setRejectOpen(false);
      setRejectionReason("");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["landlordRequests"] });
    },
  });

  const isPending = request.status === "PENDING";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">
              {request.property?.title ?? "Unknown property"}
            </h3>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {request.tenant?.email ?? "tenant"}
          </p>
        </div>

        <p className="text-lg font-bold text-primary">
          {formatPrice(request.property?.price ?? 0)}
          <span className="text-xs font-normal text-muted-foreground"> /mo</span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(request.startDate)}
          {request.endDate ? ` → ${formatDate(request.endDate)}` : " → ongoing"}
        </span>
        {request.message && (
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> “{request.message}”
          </span>
        )}
      </div>

      {request.status === "REJECTED" && request.rejectionReason && (
        <p className="mt-3 rounded-lg bg-red-500/10 p-2.5 text-xs text-red-500">
          Reason given: {request.rejectionReason}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {isPending ? (
          <>
            <button
              onClick={() => updateStatus.mutate({ status: "APPROVED" })}
              disabled={updateStatus.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              <Check className="h-4 w-4" /> Approve
            </button>
            <button
              onClick={() => setRejectOpen(true)}
              disabled={updateStatus.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-60"
            >
              <X className="h-4 w-4" /> Reject
            </button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            {request.status === "APPROVED"
              ? "Approved — waiting for tenant payment."
              : request.status === "COMPLETED"
                ? "Completed — paid by tenant."
                : "Processed."}
          </span>
        )}

        {request.property && (
          <Link
            href={`/properties/${request.property.id}`}
            className="ml-auto rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            View listing
          </Link>
        )}
      </div>

      {/* Rejection reason modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="font-semibold">Reject rental request</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Optionally tell the tenant why:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. The property was rented to someone else…"
              className="mt-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejectOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus.mutate({ status: "REJECTED", rejectionReason })}
                disabled={updateStatus.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {updateStatus.isPending ? "Rejecting…" : "Confirm rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
