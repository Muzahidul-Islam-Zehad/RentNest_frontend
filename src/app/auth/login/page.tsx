import Link from "next/link";

export const revalidate = 0;

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Login to manage your rentals.{" "}
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </p>

        {/* placeholder — real form arrives in the next commit */}
        <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          Login form is being built…
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
