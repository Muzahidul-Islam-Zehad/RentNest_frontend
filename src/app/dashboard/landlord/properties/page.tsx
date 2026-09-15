"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Pencil, Plus, Power } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import { landlordApi } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { useLandlordProperties } from "@/hooks/useLandlord";
import { formatPrice, cn } from "@/lib/utils";

export default function LandlordPropertiesPage() {
  return (
    <RoleGuard role="LANDLORD">
      <LandlordProperties />
    </RoleGuard>
  );
}

function LandlordProperties() {
  const { data: properties, isLoading } = useLandlordProperties();
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleStatus = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      landlordApi.updatePropertyStatus(id, isAvailable),
    onMutate: async ({ id, isAvailable }) => {
      // Optimistic update — flip availability immediately
      await queryClient.cancelQueries({ queryKey: ["landlordProperties"] });
      const previous = queryClient.getQueryData<NonNullable<ReturnType<typeof useLandlordProperties>["data"]>>(["landlordProperties"]);
      queryClient.setQueryData(["landlordProperties"], (old: typeof previous) =>
        old?.map((p) => (p.id === id ? { ...p, isAvailable } : p))
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["landlordProperties"], context.previous);
      }
      toast.error(toApiError(error).message);
    },
    onSettled: (_data, _error, vars) => {
      setTogglingId(null);
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
      toast.success(
        vars.isAvailable ? "Property is now available" : "Property marked unavailable"
      );
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit and toggle availability of your listings.
          </p>
        </div>
        <Link
          href="/dashboard/landlord/properties/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New property
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : properties?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">City</th>
                  <th className="px-5 py-3 font-semibold">Rent</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{property.title}</p>
                      <p className="text-xs text-muted-foreground">{property.location}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{property.city}</td>
                    <td className="px-5 py-3.5 font-semibold text-primary">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          property.isAvailable
                            ? "bg-green-500/15 text-green-600 dark:text-green-400"
                            : "bg-red-500/15 text-red-500"
                        )}
                      >
                        {property.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setTogglingId(property.id);
                            toggleStatus.mutate({
                              id: property.id,
                              isAvailable: !property.isAvailable,
                            });
                          }}
                          disabled={togglingId === property.id && toggleStatus.isPending}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                          title={property.isAvailable ? "Mark unavailable" : "Mark available"}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {property.isAvailable ? "Disable" : "Enable"}
                        </button>
                        <Link
                          href={`/dashboard/landlord/properties/${property.id}/edit`}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="font-medium">No listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first listing to start receiving rental requests.
            </p>
            <Link
              href="/dashboard/landlord/properties/new"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Create listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
