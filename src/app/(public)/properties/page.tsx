"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import PropertyCard, { PropertyCardSkeleton } from "@/components/property/PropertyCard";
import { useProperties, useCategories } from "@/hooks/useProperties";
import { cn } from "@/lib/utils";
import type { PropertyFilters as ApiFilters } from "@/lib/api";

const AMENITIES = [
  "Parking",
  "Elevator",
  "Balcony",
  "Air Conditioning",
  "Heating",
  "Furnished",
  "Pet Friendly",
  "Gym",
  "Pool",
  "Security",
];

const SORT_HINTS = ["All", "Under $1,000", "$1,000 – $2,500", "Over $2,500"];

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const current = useMemo<ApiFilters>(
    () => ({
      search: searchParams.get("search") || undefined,
      city: searchParams.get("city") || undefined,
      location: searchParams.get("location") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      category: searchParams.get("category") || undefined,
      amenities: searchParams.get("amenities")?.split(",").filter(Boolean),
    }),
    [searchParams]
  );

  const { data: properties, isLoading, isError } = useProperties(current);
  const { data: categories } = useCategories();

  const setParam = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value.length > 0) params.set(key, value);
      else params.delete(key);
      router.replace(`/properties${params.size ? `?${params}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const toggleAmenity = (amenity: string) => {
    const list = current.amenities ?? [];
    const next = list.includes(amenity)
      ? list.filter((a) => a !== amenity)
      : [...list, amenity];
    setParam("amenities", next.length ? next.join(",") : undefined);
  };

  const clearAll = () => router.replace("/properties", { scroll: false });

  const hasFilters = Boolean(
    current.search || current.city || current.minPrice || current.maxPrice || current.category || current.amenities?.length
  );

  const priceBandFromHints = (hint: string) => {
    switch (hint) {
      case "Under $1,000": return { minPrice: undefined, maxPrice: "1000" };
      case "$1,000 – $2,500": return { minPrice: "1000", maxPrice: "2500" };
      case "Over $2,500": return { minPrice: "2500", maxPrice: undefined };
      default: return { minPrice: undefined, maxPrice: undefined };
    }
  };

  const filterPanel = (
    <div className="space-y-6">
      {/* Search keyword */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Keyword</h3>
        <input
          defaultValue={current.search}
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("search", (e.target as HTMLInputElement).value);
          }}
          placeholder="Title, description, location…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* City */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">City</h3>
        <input
          defaultValue={current.city}
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("city", (e.target as HTMLInputElement).value);
          }}
          placeholder="e.g. Dhaka"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Price band quick picks */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Price range</h3>
        <div className="flex flex-wrap gap-2">
          {SORT_HINTS.map((hint) => {
            const band = priceBandFromHints(hint);
            const active =
              (current.minPrice ?? undefined) === band.minPrice &&
              (current.maxPrice ?? undefined) === band.maxPrice;
            return (
              <button
                key={hint}
                onClick={() => {
                  const band = priceBandFromHints(hint);
                  setParam("minPrice", band.minPrice);
                  setParam("maxPrice", band.maxPrice);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  active ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                )}
              >
                {hint}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            defaultValue={current.minPrice}
            onBlur={(e) => setParam("minPrice", e.target.value)}
            placeholder="Min"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            defaultValue={current.maxPrice}
            onBlur={(e) => setParam("maxPrice", e.target.value)}
            placeholder="Max"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Property type</h3>
        <select
          value={current.category ?? ""}
          onChange={(e) => setParam("category", e.target.value || undefined)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All types</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Amenities</h3>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                current.amenities?.includes(amenity)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
        >
          <X className="h-4 w-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Browse properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Loading listings…" : `${properties?.length ?? 0} properties found`}
          </p>
        </div>
        <button
          onClick={() => setMobileFiltersOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
            {filterPanel}
          </div>
        </aside>

        {/* Mobile collapsible filters */}
        {mobileFiltersOpen && (
          <div className="rounded-2xl border border-border bg-card p-5 lg:hidden">
            {filterPanel}
          </div>
        )}

        {/* Results grid */}
        <div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}

            {!isLoading &&
              properties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
          </div>

          {isError && (
            <p className="rounded-lg bg-red-500/10 p-4 text-center text-sm text-red-500">
              Failed to load properties. Please try again.
            </p>
          )}

          {!isLoading && properties?.length === 0 && (
            <div className="rounded-2xl bg-muted p-10 text-center">
              <p className="font-medium">No properties match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try widening the price range or removing some amenities.
              </p>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
