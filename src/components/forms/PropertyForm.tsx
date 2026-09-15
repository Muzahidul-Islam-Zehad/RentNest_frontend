"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, ImagePlus } from "lucide-react";
import { landlordApi, categoriesApi, type PropertyListingPayload } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { useCategories } from "@/hooks/useProperties";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

const AMENITY_OPTIONS = [
  "Parking", "Elevator", "Balcony", "Air Conditioning", "Heating",
  "Furnished", "Pet Friendly", "Gym", "Pool", "Security",
];

type FormState = {
  title: string;
  description: string;
  location: string;
  city: string;
  price: string;
  categoryId: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  amenities: string[];
  images: string[];
};

function toFormState(property?: Property | null): FormState {
  return {
    title: property?.title ?? "",
    description: property?.description ?? "",
    location: property?.location ?? "",
    city: property?.city ?? "",
    price: property?.price != null ? String(property.price) : "",
    categoryId: property?.categoryId ?? "",
    bedrooms: property?.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property?.bathrooms != null ? String(property.bathrooms) : "",
    area: property?.area != null ? String(property.area) : "",
    amenities: property?.amenities ?? [],
    images: property?.images?.length ? property.images : [""],
  };
}

export default function PropertyForm({ property }: { property?: Property | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(property?.id);

  const { data: categories } = useCategories();
  const [values, setValues] = useState<FormState>(() => toFormState(property));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (property) setValues(toFormState(property));
  }, [property]);

  const mutation = useMutation({
    mutationFn: (payload: PropertyListingPayload) =>
      isEdit
        ? landlordApi.updateProperty(property!.id, payload)
        : landlordApi.createProperty(payload),
    onSuccess: () => {
      toast.success(isEdit ? "Listing updated!" : "Listing created!");
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      router.push("/dashboard/landlord/properties");
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const set = (key: keyof FormState, value: string | string[]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!values.title.trim()) next.title = "Title is required";
    if (!values.description.trim()) next.description = "Description is required";
    if (!values.location.trim()) next.location = "Location is required";
    if (!values.city.trim()) next.city = "City is required";
    if (!values.price || Number(values.price) <= 0) next.price = "Enter a valid monthly price";
    if (!values.categoryId) next.categoryId = "Select a property type";
    const validImages = values.images.filter((img) => img.trim());
    if (validImages.length === 0) next.images = "Add at least one image URL";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate({
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      city: values.city.trim(),
      price: Number(values.price),
      categoryId: values.categoryId,
      bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
      bathrooms: values.bathrooms ? Number(values.bathrooms) : undefined,
      area: values.area ? Number(values.area) : undefined,
      amenities: values.amenities,
      images: values.images.filter((img) => img.trim()),
    });
  };

  const inputClass = (hasError?: string) => cn(
    "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition",
    "focus:border-primary focus:ring-2 focus:ring-primary/20",
    hasError ? "border-red-500" : "border-border"
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Basics */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Basic information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Title *</label>
            <input
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Sunny 2-bedroom apartment near the park"
              className={inputClass(errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Description *</label>
            <textarea
              rows={4}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the space, natural light, neighborhood…"
              className={cn(inputClass(errors.description), "resize-none")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Location / address *</label>
            <input
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. House 12, Road 5, Dhanmondi"
              className={inputClass(errors.location)}
            />
            {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">City *</label>
            <input
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Dhaka"
              className={inputClass(errors.city)}
            />
            {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Monthly rent ($) *</label>
            <input
              type="number"
              min="0"
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="e.g. 850"
              className={inputClass(errors.price)}
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Property type *</label>
            <select
              value={values.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={inputClass(errors.categoryId)}
            >
              <option value="">Select type…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
            )}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Property details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Bedrooms</label>
            <input
              type="number" min="0"
              value={values.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)}
              className={inputClass()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Bathrooms</label>
            <input
              type="number" min="0"
              value={values.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)}
              className={inputClass()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Area (sqft)</label>
            <input
              type="number" min="0"
              value={values.area}
              onChange={(e) => set("area", e.target.value)}
              className={inputClass()}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => {
              const active = values.amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() =>
                    set(
                      "amenities",
                      active
                        ? values.amenities.filter((a) => a !== amenity)
                        : [...values.amenities, amenity]
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Images</h2>
          <button
            type="button"
            onClick={() => set("images", [...values.images, ""])}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" /> Add image URL
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {values.images.map((img, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {img.trim().startsWith("http") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-full w-full object-cover" />
                )}
                {!img.trim() && (
                  <ImagePlus className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                )}
              </div>
              <input
                value={img}
                onChange={(e) => {
                  const next = [...values.images];
                  next[index] = e.target.value;
                  set("images", next);
                }}
                placeholder="https://images.unsplash.com/…"
                className={inputClass(errors.images)}
              />
              {values.images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "images",
                      values.images.filter((_, i) => i !== index)
                    )
                  }
                  className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}
      </section>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create listing"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
