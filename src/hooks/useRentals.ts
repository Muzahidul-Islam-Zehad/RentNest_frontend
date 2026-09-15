"use client";

import { useQuery } from "@tanstack/react-query";
import { rentalsApi, paymentsApi } from "@/lib/api";

export function useMyRentalRequests() {
  return useQuery({
    queryKey: ["rentalRequests", "mine"],
    queryFn: () => rentalsApi.myRequests(),
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: ["payments", "mine"],
    queryFn: () => paymentsApi.myPayments(),
  });
}
