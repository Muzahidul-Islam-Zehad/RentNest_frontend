"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Mail } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace("/auth/login?redirect=/profile");
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    if (user) setEmail(user.email);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    setSaving(true);
    try {
      const updated = await authApi.updateMe({ email });
      setUser(updated);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your account details and update your email.
        </p>

        {/* Account summary */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              Role: <span className="font-medium">{user.role}</span>
              {user.status && (
                <>
                  {" · "}Status: <span className="font-medium">{user.status}</span>
                </>
              )}
            </p>
            {user.createdAt && (
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(user.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Update form */}
        <form
          onSubmit={handleSave}
          className="mt-6 rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="font-semibold">Update email</h2>

          <label htmlFor="profile-email" className="mt-4 mb-1.5 block text-sm font-medium">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
