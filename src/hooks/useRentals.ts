"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { rentalsApi, paymentsApi } from "@/lib/api";

export function useMyRentalRequests() {
  return useQuery({
    queryKey: ["rentalRequests", "mine"],
    queryFn: () => rentalsApi.myRequests(),
    placeholderData: keepPreviousData,
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: ["payments", "mine"],
    queryFn: () => paymentsApi.myPayments(),
    placeholderData: keepPreviousData,
  });
}
