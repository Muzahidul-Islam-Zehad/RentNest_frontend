"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

export function useAdminUsers() {
  return useQuery({ queryKey: ["adminUsers"], queryFn: adminApi.users });
}

export function useAdminProperties() {
  return useQuery({ queryKey: ["adminProperties"], queryFn: adminApi.properties });
}

export function useAdminRequests() {
  return useQuery({ queryKey: ["adminRequests"], queryFn: adminApi.rentalRequests });
}
