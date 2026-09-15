"use client";

import { use } from "react";
import RoleGuard from "@/components/guards/RoleGuard";
import PropertyForm from "@/components/forms/PropertyForm";
import { useLandlordProperties } from "@/hooks/useLandlord";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <RoleGuard role="LANDLORD">
      <EditPropertyContent params={params} />
    </RoleGuard>
  );
}

function EditPropertyContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: properties, isLoading } = useLandlordProperties();
  const property = properties?.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <h1 className="font-semibold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This property does not exist or does not belong to you.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Edit listing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Update the details of “{property.title}”.
      </p>
      <div className="mt-6">
        <PropertyForm property={property} />
      </div>
    </div>
  );
}
