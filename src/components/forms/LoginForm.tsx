"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi, type LoginPayload } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const initial: LoginPayload = { email: "", password: "" };

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;

  const setSession = useAuthStore((s) => s.setSession);
  const [values, setValues] = useState<LoginPayload>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginPayload, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!values.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email address";
    if (!values.password) next.password = "Password is required";
    else if (values.password.length < 6) next.password = "Password must be at least 6 characters";
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
      const tokens = await authApi.login(values);

      // Store the JWT in our httpOnly cookie BEFORE calling /me — the proxy
      // attaches it to authenticate the request. The interim user is a
      // placeholder kept only for the duration of the /me call below.
      await setSession({ id: "", email: values.email, role: "TENANT" }, tokens.accessToken);

      const user = await useAuthStore.getState().syncUser();
      if (!user) {
        // /me failed → roll back to a clean logged-out state
        await useAuthStore.getState().logout();
        toast.error("Logged in but could not load your profile. Please retry.");
        return;
      }
      // Replace the placeholder with the real profile (cookie already stored)
      useAuthStore.getState().setUser(user);

      toast.success(`Welcome back, ${user.email}!`);

      // role-aware redirect (or back to the page the user came from)
      const fallback = `/dashboard/${user.role.toLowerCase()}`;
      router.push(redirectTo || fallback);
      router.refresh();
    } catch (error) {
      const apiError = toApiError(error);
      toast.error(apiError.message);
      if (apiError.status === 401) {
        setErrors({ password: "Incorrect email or password" });
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
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={onChange}
          className={inputClass(errors.email)}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={onChange}
          className={inputClass(errors.password)}
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Logging in…" : "Login"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        New to RentNest?{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
