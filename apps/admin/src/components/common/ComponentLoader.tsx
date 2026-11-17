import React from "react";

interface ComponentLoaderProps {
  text?: string;
  minHeight?: string;
}

export default function ComponentLoader({
  text = "Loading data...",
  minHeight = "min-h-[350px]",
}: ComponentLoaderProps) {
  return (
    <div className={`flex ${minHeight} items-center justify-center p-6`}>
      <div className="flex flex-col items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        <span className="font-medium text-gray-600 dark:text-gray-300">{text}</span>
      </div>
    </div>
  );
}

