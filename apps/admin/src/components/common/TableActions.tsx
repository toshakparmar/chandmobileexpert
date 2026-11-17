"use client";

import React from "react";

export interface ActionButtonProps {
  onClick: () => void;
  title?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * View / Preview Action Button (Vibrant Blue)
 */
export const ViewAction: React.FC<ActionButtonProps> = ({
  onClick,
  title = "View details",
  disabled = false,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 active:bg-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60 dark:border-blue-800/40 border border-blue-200/70 shadow-2xs transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
  >
    <svg
      className="w-4 h-4 overflow-visible shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  </button>
);

/**
 * Edit / Modify Action Button (Warm Amber / Gold)
 */
export const EditAction: React.FC<ActionButtonProps> = ({
  onClick,
  title = "Edit",
  disabled = false,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 active:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60 dark:border-amber-800/40 border border-amber-200/70 shadow-2xs transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
  >
    <svg
      className="w-4 h-4 overflow-visible shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  </button>
);

/**
 * Delete / Remove Action Button (Vibrant Rose / Crimson)
 */
export const DeleteAction: React.FC<ActionButtonProps> = ({
  onClick,
  title = "Delete",
  disabled = false,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 active:bg-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 dark:border-rose-800/40 border border-rose-200/70 shadow-2xs transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
  >
    <svg
      className="w-4 h-4 overflow-visible shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  </button>
);

/**
 * Container helper for aligning table actions consistently
 */
export const ActionGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`flex items-center justify-end gap-1.5 ${className}`}>
    {children}
  </div>
);

