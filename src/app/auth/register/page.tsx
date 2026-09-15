import Link from "next/link";
import RegisterForm from "@/components/forms/RegisterForm";

export const revalidate = 0;

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join RentNest as a tenant or landlord.{" "}
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </p>

        <RegisterForm />
      </div>
    </div>
  );
}
