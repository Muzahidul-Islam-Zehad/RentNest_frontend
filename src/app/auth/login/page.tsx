import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";

export const revalidate = 0;

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Login to manage your rentals.{" "}
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </p>

        <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-lg bg-muted" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
