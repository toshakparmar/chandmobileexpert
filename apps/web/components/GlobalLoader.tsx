"use client";

import React from "react";
import Image from "next/image";
import { useLoaderStore } from "@/store/loaderStore";

export function GlobalLoader() {
  const { isLoading, text } = useLoaderStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        {text && (
          <p className="text-foreground/90 font-semibold text-sm sm:text-base tracking-wide animate-pulse text-center">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
