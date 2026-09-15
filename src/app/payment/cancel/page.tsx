import Link from "next/link";
import { AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Payment cancelled" };

export default function PaymentCancelPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <AlertCircle className="mx-auto h-14 w-14 text-yellow-500" />
          <h1 className="mt-6 text-2xl font-bold">Payment cancelled</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No worries — your rental request is still approved and waiting. You can pay
            anytime from your dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/dashboard/tenant/requests"
              className="rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Back to my requests
            </Link>
            <Link
              href="/properties"
              className="rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted"
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
