"use client";

import { useQuery } from "@tanstack/react-query";
import { landlordApi } from "@/lib/api";

export function useLandlordProperties() {
  return useQuery({
    queryKey: ["landlordProperties"],
    queryFn: () => landlordApi.myProperties(),
  });
}

export function useLandlordRequests() {
  return useQuery({
    queryKey: ["landlordRequests"],
    queryFn: () => landlordApi.myRequests(),
  });
}
