"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { landlordApi } from "@/lib/api";
import type { Property, RentalRequest } from "@/types";

export function useLandlordProperties() {
  return useQuery({
    queryKey: ["landlordProperties"],
    queryFn: () => landlordApi.myProperties(),
    placeholderData: keepPreviousData,
  });
}

/**
 * GET /api/landlords/requests returns the landlord's PROPERTIES that have
 * rental requests, each carrying its nested rentalRequests[] (see
 * landlordsService.getAllRequestsByTenant). Normalize that nested shape into
 * a flat RentalRequest[] (with property + tenant attached) so the requests
 * table can render rows directly.
 */
function flattenLandlordRequests(properties: Property[]): RentalRequest[] {
  return properties.flatMap((property) =>
    (property.rentalRequests ?? []).map((request) => ({
      ...request,
      property,
      tenant: request.tenant ?? undefined,
    }))
  );
}

export function useLandlordRequests() {
  return useQuery({
    queryKey: ["landlordRequests"],
    queryFn: async () => flattenLandlordRequests(await landlordApi.myRequests()),
    placeholderData: keepPreviousData,
  });
}
