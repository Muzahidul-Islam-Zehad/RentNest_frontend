"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { paymentsApi } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const sessionId =
    searchParams.get("session_id") || searchParams.get("sessionId") || "";

  const [state, setState] = useState<"confirming" | "success" | "error">("confirming");
  const [message, setMessage] = useState("");
  const attempted = useRef(false);

  // Auto-redirect to the tenant dashboard once the payment is confirmed
  useEffect(() => {
    if (state !== "success") return;
    const timer = setTimeout(() => router.push("/dashboard/tenant/requests"), 2500);
    return () => clearTimeout(timer);
  }, [state, router]);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!sessionId) {
      setState("error");
      setMessage("No payment session identifier found in the URL.");
      return;
    }

    paymentsApi
      .confirm(sessionId)
      .then(() => {
        setState("success");
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["rentalRequests"] });
      })
      .catch((error) => {
        const apiError = toApiError(error);
        setState("error");
        setMessage(apiError.message);
      });
  }, [sessionId, queryClient]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {state === "confirming" && (
        <>
          <Loader2 className="mx-auto h-14 w-14 animate-spin text-primary" />
          <h1 className="mt-6 text-2xl font-bold">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hold on while we verify your Stripe checkout session.
          </p>
        </>
      )}

      {state === "success" && (
        <>
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
          <h1 className="mt-6 text-2xl font-bold">Payment successful!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your rental is confirmed and marked as completed. Taking you to your
            dashboard…
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/dashboard/tenant/requests"
              className="rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Go to my requests
            </Link>
            <Link
              href="/dashboard/tenant/payments"
              className="rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted"
            >
              View payment history
            </Link>
          </div>
        </>
      )}

      {state === "error" && (
        <>
          <XCircle className="mx-auto h-14 w-14 text-red-500" />
          <h1 className="mt-6 text-2xl font-bold">We could not confirm the payment</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <Link
            href="/dashboard/tenant/requests"
            className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Back to my requests
          </Link>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
