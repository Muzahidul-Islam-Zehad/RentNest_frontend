import { cn } from "@/lib/utils";
import type { RentalStatus } from "@/types";

const STYLES: Record<RentalStatus, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  APPROVED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  REJECTED: "bg-red-500/15 text-red-600 dark:text-red-400",
  ACTIVE: "bg-green-500/15 text-green-600 dark:text-green-400",
  COMPLETED: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
};

export default function StatusBadge({ status }: { status: RentalStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        STYLES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}
