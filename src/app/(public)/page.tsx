"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Search, Sparkles } from "lucide-react";
import PropertyCard, { PropertyCardSkeleton } from "@/components/property/PropertyCard";
import { useProperties } from "@/hooks/useProperties";

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: properties, isLoading, isError } = useProperties();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(search.trim() ? `/properties?search=${encodeURIComponent(search.trim())}` : "/properties");
  };

  const featured = (properties ?? []).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-transparent to-primary/5" />
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 md:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Find your next nest
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold tracking-tight md:text-5xl">
            Find &amp; list rental properties{" "}
            <span className="text-primary">with ease</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Browse verified listings, request to rent in one click, and pay securely —
            landlords manage everything from a clean dashboard.
          </p>

          {/* Hero search */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by city, location or keyword…"
                className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured properties */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured properties</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hand-picked homes available right now.
            </p>
          </div>
          <Link
            href="/properties"
            className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted sm:block"
          >
            View all
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}

          {!isLoading &&
            featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
        </div>

        {isError && (
          <p className="mt-6 rounded-lg bg-red-500/10 p-4 text-center text-sm text-red-500">
            Failed to load properties. Please refresh the page.
          </p>
        )}

        {!isLoading && featured.length === 0 && !isError && (
          <p className="mt-6 rounded-lg bg-muted p-8 text-center text-sm text-muted-foreground">
            No properties listed yet. Landlords — add the first one!
          </p>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/properties"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          >
            View all properties
          </Link>
        </div>
      </section>

      {/* Role highlights */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-3">
          {[
            {
              title: "For tenants",
              body: "Filter listings, submit rental requests, track approvals and pay securely via Stripe checkout.",
            },
            {
              title: "For landlords",
              body: "Publish listings with photos and amenities, approve or reject requests and manage availability.",
            },
            {
              title: "For admins",
              body: "Monitor users, moderate listings and keep the marketplace healthy from one overview.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-border bg-background p-6">
              <h3 className="font-semibold text-primary">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
