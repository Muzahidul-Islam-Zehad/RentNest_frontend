"use client";

import Link from "next/link";
import RoleGuard from "@/components/guards/RoleGuard";
import { useMyPayments } from "@/hooks/useRentals";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  COMPLETED: "bg-green-500/15 text-green-600 dark:text-green-400",
  FAILED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export default function TenantPaymentsPage() {
  return (
    <RoleGuard role="TENANT">
      <TenantPayments />
    </RoleGuard>
  );
}

function TenantPayments() {
  const { data: payments, isLoading } = useMyPayments();

  return (
    <div>
      <h1 className="text-2xl font-bold">Payment history</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        All Stripe transactions for your rentals.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : payments?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3.5 font-medium">
                      {payment.rentalRequest?.property?.title ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-primary">
                      {formatPrice(payment.amount, payment.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_STYLES[payment.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDate(payment.paidAt ?? payment.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="block max-w-[160px] truncate font-mono text-xs text-muted-foreground">
                        {payment.transactionId ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="font-medium">No payments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Payments appear here after a landlord approves one of your requests.
            </p>
            <Link
              href="/dashboard/tenant/requests"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Check my requests
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
