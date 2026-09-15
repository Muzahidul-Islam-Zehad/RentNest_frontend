"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarDays, Loader2 } from "lucide-react";
import { rentalsApi, type RentalRequestPayload } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { useProperty } from "@/hooks/useProperties";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice } from "@/lib/utils";

export default function RentalRequestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useAuthStore((s) => s.user);
  const propertyId = params?.id;
  const { data: property, isLoading } = useProperty(propertyId);

  const [values, setValues] = useState<RentalRequestPayload>({
    startDate: "",
    endDate: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const mutation = useMutation({
    mutationFn: (payload: RentalRequestPayload) =>
      rentalsApi.submit(propertyId!, payload),
    onSuccess: () => {
      toast.success("Rental request submitted! The landlord will review it soon.");
      queryClient.invalidateQueries({ queryKey: ["rentalRequests"] });
      router.push("/dashboard/tenant/requests");
    },
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });

  const validate = () => {
    const next: typeof errors = {};
    if (!values.startDate) next.startDate = "Start date is required";
    if (values.endDate && values.startDate && values.endDate <= values.startDate) {
      next.endDate = "End date must be after the start date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      message: values.message || undefined,
    });
  };

  const inputClass = (hasError?: string) => `
    w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none
    focus:border-primary focus:ring-2 focus:ring-primary/20
    ${hasError ? "border-red-500" : "border-border"}`;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">Please login as a tenant</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only tenants can submit rental requests.
        </p>
        <Link
          href={`/auth/login?redirect=/properties/${propertyId}/request`}
          className="mt-5 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Login
        </Link>
      </div>
    );
  }

  if (user.role !== "TENANT") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">Tenants only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You are signed in as a {user.role.toLowerCase()}. Rental requests can only be
          made from tenant accounts.
        </p>
        <Link href="/" className="mt-5 inline-block text-sm text-primary hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Request to rent</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Send a rental request to the landlord of{" "}
        <span className="font-medium text-foreground">{property?.title ?? "this property"}</span>.
      </p>

      {/* Property summary */}
      {property && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div>
            <p className="font-semibold">{property.title}</p>
            <p className="text-sm text-muted-foreground">
              {property.location}, {property.city}
            </p>
          </div>
          <p className="font-bold text-primary">{formatPrice(property.price)}/mo</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-primary" /> Start date
            </label>
            <input
              id="startDate"
              type="date"
              value={values.startDate}
              onChange={(e) => setValues((v) => ({ ...v, startDate: e.target.value }))}
              className={inputClass(errors.startDate)}
            />
            {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="endDate" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-primary" /> End date (optional)
            </label>
            <input
              id="endDate"
              type="date"
              value={values.endDate}
              onChange={(e) => setValues((v) => ({ ...v, endDate: e.target.value }))}
              className={inputClass(errors.endDate)}
            />
            {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
            Message to landlord (optional)
          </label>
          <textarea
            id="message"
            rows={4}
            value={values.message}
            onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
            placeholder="Introduce yourself, mention your move-in plan, number of occupants…"
            className={`${inputClass()} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mutation.isPending ? "Submitting request…" : "Submit rental request"}
        </button>
      </form>
    </div>
  );
}
