"use client";

import RoleGuard from "@/components/guards/RoleGuard";
import PropertyForm from "@/components/forms/PropertyForm";

export default function NewPropertyPage() {
  return (
    <RoleGuard role="LANDLORD">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">Create a new listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide details and image URLs. Tenants will see this listing in search results.
        </p>
        <div className="mt-6">
          <PropertyForm />
        </div>
      </div>
    </RoleGuard>
  );
}
