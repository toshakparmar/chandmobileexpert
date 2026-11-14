"use client";

import React from "react";
import { Loader2, Database, Sparkles } from "lucide-react";

interface ShopSkeletonProps {
  count?: number;
}

export function ShopSkeleton({ count = 12 }: ShopSkeletonProps) {
  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* ── Status Banner ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card via-muted/40 to-card border border-border/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Syncing Live Catalog</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                  <Database className="w-3 h-3" /> Live Database
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Fetching master-approved accessories, pricing, and live inventory...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="h-2 w-32 sm:w-48 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent/50 via-accent to-accent/50 w-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Categories Strip Skeleton ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2.5 p-3 rounded-2xl min-w-[105px] bg-card border border-border/60 shrink-0"
            >
              <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Layout Skeleton (Sidebar + Grid) ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-5">
            <div className="bg-card rounded-2xl border border-border/70 p-5 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div className="h-4 w-20 bg-muted rounded-md animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded-md animate-pulse" />
              </div>

              {/* Filter 1: Search */}
              <div className="space-y-2">
                <div className="h-3 w-24 bg-muted rounded-md animate-pulse" />
                <div className="h-9 w-full bg-muted rounded-xl animate-pulse" />
              </div>

              {/* Filter 2: Categories */}
              <div className="space-y-2.5 pt-2">
                <div className="h-3 w-28 bg-muted rounded-md animate-pulse" />
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-28 bg-muted rounded-md animate-pulse" />
                    </div>
                    <div className="h-3 w-6 bg-muted rounded-md animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Filter 3: Price */}
              <div className="space-y-2.5 pt-2">
                <div className="h-3 w-20 bg-muted rounded-md animate-pulse" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-muted rounded-lg animate-pulse" />
                  <div className="h-8 bg-muted rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Filter 4: Rating */}
              <div className="space-y-2.5 pt-2">
                <div className="h-3 w-28 bg-muted rounded-md animate-pulse" />
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded-md animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Cards Grid Skeleton */}
          <main className="lg:col-span-3">
            {/* Top Toolbar Skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
              <div className="h-4 w-40 bg-muted rounded-md animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
                <div className="h-8 w-24 bg-muted rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
              {Array.from({ length: count }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl border border-border/60 p-3.5 sm:p-4 flex flex-col justify-between space-y-3 overflow-hidden shadow-xs"
                >
                  {/* Image Skeleton with Shimmer */}
                  <div className="relative aspect-square w-full rounded-xl bg-muted/70 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
                    <div className="w-10 h-10 rounded-full bg-foreground/5 animate-pulse" />
                  </div>

                  {/* Rating & Brand */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                  </div>

                  {/* Title Lines */}
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-full bg-muted rounded animate-pulse" />
                    <div className="h-3.5 w-3/4 bg-muted rounded animate-pulse" />
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3.5 w-12 bg-muted rounded animate-pulse" />
                  </div>

                  {/* Button Skeleton */}
                  <div className="h-9 w-full bg-muted rounded-xl animate-pulse mt-2" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
