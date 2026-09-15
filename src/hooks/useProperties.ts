"use client";

import { useQuery } from "@tanstack/react-query";
import { propertiesApi } from "@/lib/api";

/**
 * Fetches a page of properties. Used by the home page for the featured grid.
 * Filters are applied server-side by the backend.
 */
export function useProperties(filters?: Record<string, unknown> | PropertyFiltersLike) {
  return useQuery({
    queryKey: ["properties", filters ?? {}],
    queryFn: () => propertiesApi.list(filters as never),
  });
}

type PropertyFiltersLike = Parameters<typeof propertiesApi.list>[0];

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => propertiesApi.getById(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => import("@/lib/api").then((m) => m.categoriesApi.list()),
    staleTime: 10 * 60 * 1000,
  });
}
