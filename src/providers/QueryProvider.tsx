"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { setLogoutSweeper } from "@/store/auth-store";

/**
 * Global TanStack Query client.
 * - staleTime 0: data is always revalidated in the background on mount, so the
 *   UI shows fresh server state as soon as possible (cached data renders
 *   instantly while the refetch is in flight — no blank/loading flashes).
 * - refetchOnWindowFocus off to avoid redundant request bursts.
 * - Registers the client with the auth store so logging out wipes ALL cached
 *   server data immediately (no stale cross-account data after logout).
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Give the auth store a handle to wipe the cache on logout
  setLogoutSweeper(queryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
