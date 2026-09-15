"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for debugging; could hook into a reporting service
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred while loading this page. Please try again.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      </div>
    </div>
  );
}
