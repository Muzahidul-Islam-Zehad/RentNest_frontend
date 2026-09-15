"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Ban, ChevronLeft, ChevronRight, Search, ShieldCheck } from "lucide-react";
import RoleGuard from "@/components/guards/RoleGuard";
import { adminApi } from "@/lib/api";
import { toApiError } from "@/lib/api-client";
import { useAdminUsers } from "@/hooks/useAdmin";
import { formatDate, cn } from "@/lib/utils";
import type { AuthUser } from "@/types";

const PAGE_SIZE = 8;

export default function AdminUsersPage() {
  return (
    <RoleGuard role="ADMIN">
      <AdminUsers />
    </RoleGuard>
  );
}

function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return (users ?? []).filter((user) => {
      const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "BANNED" }) =>
      adminApi.updateUserStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["adminUsers"] });
      const previous = queryClient.getQueryData(["adminUsers"]);
      queryClient.setQueryData(["adminUsers"], (old: AuthUser[] | undefined) =>
        old?.map((u) => (u.id === id ? { ...u, status } : u))
      );
      return { previous };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["adminUsers"], context.previous);
      }
      toast.error(toApiError(error).message);
    },

    onSuccess: (_data, vars) => {
      toast.success(
        vars.status === "BANNED" ? "User banned" : "User unbanned"
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">User management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search, filter and moderate platform users.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by email…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex gap-1.5">
          {["ALL", "TENANT", "LANDLORD", "ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => {
                setRoleFilter(role);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                roleFilter === role
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : paged.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/40">
                      <td className="px-5 py-3.5 font-medium">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            user.status === "BANNED"
                              ? "bg-red-500/15 text-red-500"
                              : "bg-green-500/15 text-green-600 dark:text-green-400"
                          )}
                        >
                          {user.status ?? "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          {user.role === "ADMIN" ? (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ShieldCheck className="h-3.5 w-3.5" /> Protected
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                updateStatus.mutate({
                                  id: user.id,
                                  status: user.status === "BANNED" ? "ACTIVE" : "BANNED",
                                })
                              }
                              disabled={updateStatus.isPending}
                              className={cn(
                                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50",
                                user.status === "BANNED"
                                  ? "border-green-500/50 text-green-600 hover:bg-green-500/10"
                                  : "border-red-500/50 text-red-500 hover:bg-red-500/10"
                              )}
                            >
                              <Ban className="h-3.5 w-3.5" />
                              {user.status === "BANNED" ? "Unban" : "Ban"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Page {safePage} of {totalPages} · {filtered.length} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="rounded-lg border border-border p-2 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="rounded-lg border border-border p-2 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-10 text-center">
            <p className="font-medium">No users found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term or role filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
