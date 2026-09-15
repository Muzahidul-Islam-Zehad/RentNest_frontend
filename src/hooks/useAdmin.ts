"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: adminApi.users,
    placeholderData: keepPreviousData,
  });
}

export function useAdminProperties() {
  return useQuery({
    queryKey: ["adminProperties"],
    queryFn: adminApi.properties,
    placeholderData: keepPreviousData,
  });
}

export function useAdminRequests() {
  return useQuery({
    queryKey: ["adminRequests"],
    queryFn: adminApi.rentalRequests,
    placeholderData: keepPreviousData,
  });
}
