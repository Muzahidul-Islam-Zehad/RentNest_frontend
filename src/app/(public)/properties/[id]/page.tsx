"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bath, BedDouble, Building2, CalendarDays, CheckCircle2, Mail,
  MapPin, Maximize, Star,
} from "lucide-react";
import { PropertyImage } from "@/components/property/PropertyCard";
import { useProperty } from "@/hooks/useProperties";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice, formatDate, cn } from "@/lib/utils";

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const propertyId = params?.id;
  const { data: property, isLoading, isError } = useProperty(propertyId);

  const user = useAuthStore((s) => s.user);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl bg-muted md:h-96" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <p className="mt-2 text-muted-foreground">
          This listing may have been removed or is no longer available.
        </p>
        <Link
          href="/properties"
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Browse properties
        </Link>
      </div>
    );
  }

  const isTenant = user?.role === "TENANT";
  const isLandlord = user?.role === "LANDLORD";
  const isLoggedIn = Boolean(user);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <Link href="/properties" className="hover:text-foreground">Properties</Link>
        {" / "}
        <span className="text-foreground">{property.title}</span>
      </nav>

      {/* Gallery */}
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
          <PropertyImage src={property.images?.[0]} alt={property.title} />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
          {(property.images?.slice(1, 5) ?? [null, null, null, null]).map((img, i) => (
            <button
              key={i}
              onClick={() => img && setLightbox(i + 1)}
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
            >
              {img ? (
                <PropertyImage src={img} alt={`${property.title} photo ${i + 2}`} />
              ) : (
                <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No photo
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left: info */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.location}, {property.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
          </div>

          {/* Key facts */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: BedDouble, label: "Bedrooms", value: property.bedrooms ?? "—" },
              { icon: Bath, label: "Bathrooms", value: property.bathrooms ?? "—" },
              { icon: Maximize, label: "Area", value: property.area ? `${property.area} sqft` : "—" },
              { icon: Building2, label: "Type", value: property.category?.name ?? "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
                <Icon className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-1 text-sm font-semibold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">About this property</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          </section>

          {/* Amenities */}
          {property.amenities?.length ? (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {a}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* Reviews */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Reviews {property.reviews?.length ? `(${property.reviews.length})` : ""}
            </h2>
            {property.reviews?.length ? (
              <div className="mt-4 space-y-4">
                {property.reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {(review.tenant?.email ?? "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.tenant?.email ?? "Tenant"}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < (review.rating ?? 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/40"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
            )}
          </section>
        </div>

        {/* Right: sticky CTA card */}
        <aside>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-3xl font-bold">
              {formatPrice(property.price)}
              <span className="text-sm font-normal text-muted-foreground"> / month</span>
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                {property.category?.name ?? "Rental"}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Listed {formatDate(property.createdAt)}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span className="line-clamp-1">{property.landlord?.email ?? "Landlord"}</span>
              </p>
            </div>

            <div className="mt-6">
              {!isLoggedIn ? (
                <>
                  <Link
                    href={`/auth/login?redirect=/properties/${property.id}`}
                    className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Login to request
                  </Link>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    New here?{" "}
                    <Link href="/auth/register" className="text-primary hover:underline">
                      Create an account
                    </Link>
                  </p>
                </>
              ) : isTenant ? (
                property.isAvailable ? (
                  <Link
                    href={`/properties/${property.id}/request`}
                    className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Request to Rent
                  </Link>
                ) : (
                  <p className="rounded-xl bg-red-500/10 py-3 text-center text-sm font-medium text-red-500">
                    Currently unavailable for rent
                  </p>
                )
              ) : isLandlord ? (
                <p className="rounded-xl bg-muted py-3 text-center text-sm text-muted-foreground">
                  You are viewing as a landlord
                </p>
              ) : (
                <p className="rounded-xl bg-muted py-3 text-center text-sm text-muted-foreground">
                  Viewing as admin
                </p>
              )}
            </div>

            {!property.isAvailable && (
              <p className="mt-3 rounded-lg bg-red-500/10 p-2.5 text-center text-xs font-medium text-red-500">
                Currently unavailable
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-2xl">
            <PropertyImage
              src={property.images?.[lightbox]}
              alt={`${property.title} photo ${lightbox + 1}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
