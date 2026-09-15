"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Building2, Home, Mail, Lock, Check } from "lucide-react";
import { authApi, type RegisterPayload } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Role = RegisterPayload["role"];

const roleOptions: { value: Role; label: string; description: string }[] = [
  {
    value: "TENANT",
    label: "Tenant",
    description: "Browse properties, request rentals and pay securely.",
  },
  {
    value: "LANDLORD",
    label: "Landlord",
    description: "List properties, manage requests and grow earnings.",
  },
];

export default function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterPayload & { confirmPassword: string }>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "TENANT",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!values.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email address";
    if (!values.password) next.password = "Password is required";
    else if (values.password.length < 6) next.password = "Password must be at least 6 characters";
    if (!values.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (values.confirmPassword !== values.password)
      next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await authApi.register({
        email: values.email,
        password: values.password,
        role: values.role,
      });

      toast.success("Account created! Please login to continue.");
      router.push(`/auth/login?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      const apiError = toApiError(error);
      toast.error(apiError.message);
      if (apiError.status === 409) {
        setErrors({ email: "An account with this email already exists" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError?: string) =>
    cn(
      "w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition",
      "focus:border-primary focus:ring-2 focus:ring-primary/20",
      hasError ? "border-red-500" : "border-border"
    );

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
      {/* Role selection */}
      <div>
        <span className="mb-1.5 block text-sm font-medium">I want to join as</span>
        <div className="grid grid-cols-2 gap-3">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValues((v) => ({ ...v, role: opt.value }))}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                values.role === opt.value
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between">
                {opt.value === "TENANT" ? (
                  <Home className="h-4 w-4 text-primary" />
                ) : (
                  <Building2 className="h-4 w-4 text-primary" />
                )}
                {values.role === opt.value && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="mt-2 text-sm font-semibold">{opt.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={onChange}
            className={cn(inputClass(errors.email), "pl-10")}
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 6 characters"
            value={values.password}
            onChange={onChange}
            className={cn(inputClass(errors.password), "pl-10")}
          />
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={values.confirmPassword}
          onChange={onChange}
          className={inputClass(errors.confirmPassword)}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
