"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Star } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import { reviewsApi } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { useMyRentalRequests } from "@/hooks/useRentals";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
  return (
    <RoleGuard role="TENANT">
      <ReviewInner />
    </RoleGuard>
  );
}

function ReviewInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: requests } = useMyRentalRequests();
  const request = requests?.find((r) => r.id === params?.id);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      reviewsApi.post(request!.propertyId, {
        rating,
        comment: comment || undefined,
      }),
    onSuccess: () => {
      toast.success("Review posted — thank you!");
      queryClient.invalidateQueries({ queryKey: ["property"] });
      router.push("/dashboard/tenant/requests");
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }
    setError("");
    mutation.mutate();
  };

  if (request && request.status !== "COMPLETED") {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <h1 className="font-semibold">Review unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You can review a property only after your rental is completed (payment done).
        </p>
        <Link
          href="/dashboard/tenant/requests"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Back to requests
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Leave a review</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {request?.property?.title
          ? `How was ${request.property.title}?`
          : "Share your rental experience."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-border bg-card p-6">
        {/* Star picker */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition",
                  star <= (hover || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/40 hover:text-yellow-300"
                )}
              />
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like? Anything future tenants should know? (optional)"
          className="mt-5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mutation.isPending ? "Posting…" : "Post review"}
        </button>
      </form>
    </div>
  );
}
