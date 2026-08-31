"use client";

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-surface-hover",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function SessionLoading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 py-16">
      <Skeleton className="size-14 rounded-2xl" />
      <div className="flex w-full flex-col items-center gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="size-64 rounded-full" />
      <div className="flex w-full flex-col items-center gap-3">
        <Skeleton className="h-10 w-32 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
