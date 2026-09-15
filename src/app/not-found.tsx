import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-7xl font-extrabold text-primary">404</p>
        <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground">
          <SearchX className="h-5 w-5" />
          <p className="font-medium">Page not found</p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Home className="h-4 w-4" /> Back home
          </Link>
          <Link
            href="/properties"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Browse properties
          </Link>
        </div>
      </div>
    </div>
  );
}
