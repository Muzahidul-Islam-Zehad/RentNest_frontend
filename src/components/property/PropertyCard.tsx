import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, Maximize } from "lucide-react";
import type { Property } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=75&auto=format&fit=crop";

export function PropertyImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <Image
      src={src && src.startsWith("http") ? src : FALLBACK_IMAGE}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover"
    />
  );
}

export default function PropertyCard({
  property,
  className,
}: {
  property: Property;
  className?: string;
}) {
  const image = property.images?.[0];

  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <PropertyImage src={image} alt={property.title} />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow">
          {formatPrice(property.price)} / mo
        </span>
        {!property.isAvailable && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
            Unavailable
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold group-hover:text-primary">
          {property.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {property.location}, {property.city}
          </span>
        </p>

        <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms} bd
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {property.bathrooms} ba
            </span>
          )}
          {property.area != null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {property.area} sqft
            </span>
          )}
          {property.category?.name && (
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 font-medium">
              {property.category.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
