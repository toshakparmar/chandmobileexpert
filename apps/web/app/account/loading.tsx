import React from "react";

export default function AccountLoading() {
  return (
    <div className="flex-1 min-h-[380px] flex flex-col items-center justify-center gap-3 py-16 animate-in fade-in duration-150">
      <div className="w-9 h-9 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-medium text-muted-foreground animate-pulse">
        Loading section...
      </p>
    </div>
  );
}
