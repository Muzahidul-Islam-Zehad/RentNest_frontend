"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, Loader2 } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import { rentalsApi, paymentsApi } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { useMyRentalRequests } from "@/hooks/useRentals";
import { formatPrice, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export default function PaymentPage() {
  return (
    <RoleGuard role="TENANT">
      <PaymentInner />
    </RoleGuard>
  );
}

function PaymentInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: requests, isLoading } = useMyRentalRequests();
  const request = requests?.find((r) => r.id === params?.id);
  const [redirecting, setRedirecting] = useState(false);

  const createSession = useMutation({
    mutationFn: () => paymentsApi.createSession(request!.id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      const url = result.checkoutSession?.url;
      if (!url) {
        return;
      }
      setRedirecting(true);
      // Full page navigation to Stripe Checkout
      window.location.href = url;
    },
  });

  const handlePay = () => {
    if (!request) return;
    createSession.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <h1 className="font-semibold">Rental request not found</h1>
        <Link
          href="/dashboard/tenant/requests"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Back to my requests
        </Link>
      </div>
    );
  }

  if (request.status !== "APPROVED") {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <h1 className="font-semibold">Payment unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Payments can only be made for approved requests. Current status:{" "}
          <span className="font-medium">{request.status}</span>
        </p>
        <Link
          href="/dashboard/tenant/requests"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Back to my requests
        </Link>
      </div>
    );
  }

  const alreadyPaid =
    request.payment?.status === "COMPLETED" ||
    (request.status as string) === "COMPLETED";

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Complete your payment</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Secure checkout powered by Stripe.
      </p>

      {/* Order summary */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Order summary
        </h2>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Property</span>
            <span className="max-w-[60%] text-right font-medium">
              {request.property?.title}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="text-right">
              {request.property?.location}, {request.property?.city}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Move-in date</span>
            <span className="text-right">{formatDate(request.startDate)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <span className="font-semibold">First month rent</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(request.property?.price ?? 0)}
            </span>
          </div>
        </div>

        {alreadyPaid ? (
          <div className="mt-6 rounded-xl bg-green-500/10 p-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
            This rental is already paid. ✓
          </div>
        ) : (
          <button
            onClick={handlePay}
            disabled={createSession.isPending || redirecting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {(createSession.isPending || redirecting) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {redirecting
              ? "Redirecting to Stripe…"
              : createSession.isPending
                ? "Creating checkout session…"
                : `Pay ${formatPrice(request.property?.price ?? 0)} with Stripe`}
          </button>
        )}

        {createSession.isError && (
          <p className="mt-3 rounded-lg bg-red-500/10 p-2.5 text-xs text-red-500">
            {toApiError(createSession.error).message}
          </p>
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> Payments are processed securely by Stripe
        </p>
      </div>

      <button
        onClick={() => router.push("/dashboard/tenant/requests")}
        className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to my requests
      </button>
    </div>
  );
}
