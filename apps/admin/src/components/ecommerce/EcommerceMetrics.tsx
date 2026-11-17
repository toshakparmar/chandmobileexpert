"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

interface EcommerceMetricsProps {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingRepairs: number;
  pendingUpiPayments?: number;
  totalProducts?: number;
}

export const EcommerceMetrics = ({
  totalUsers,
  totalOrders,
  totalRevenue,
  pendingRepairs,
  pendingUpiPayments = 0,
  totalProducts = 0,
}: EcommerceMetricsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 md:gap-5">
      {/* Total Revenue */}
      <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-700">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <span className="text-xl font-bold">₹</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
            <ArrowUpIcon className="h-3 w-3" />
            Live
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Revenue
          </span>
          <h4 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            ₹{(totalRevenue || 0).toLocaleString("en-IN")}
          </h4>
        </div>
      </div>

      {/* Total Orders */}
      <Link
        href="/orders"
        className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-950/40 dark:text-blue-light-400">
            <BoxIconLine className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
            View &rarr;
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Orders
          </span>
          <h4 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {totalOrders}
          </h4>
        </div>
      </Link>

      {/* Pending UPI Verifications */}
      <Link
        href="/payments"
        className={`group rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
          pendingUpiPayments > 0
            ? "border-amber-200 bg-amber-50/40 hover:border-amber-400 dark:border-amber-900/40 dark:bg-amber-950/20"
            : "border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              pendingUpiPayments > 0
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          {pendingUpiPayments > 0 && (
            <span className="inline-flex animate-pulse items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/80 dark:text-amber-200">
              Needs UTR
            </span>
          )}
        </div>
        <div className="mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            UPI Verification
          </span>
          <h4 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {pendingUpiPayments}
          </h4>
        </div>
      </Link>

      {/* Pending Repairs */}
      <Link
        href="/repair-queries"
        className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
            View &rarr;
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Pending Repairs
          </span>
          <h4 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {pendingRepairs}
          </h4>
        </div>
      </Link>

      {/* Catalog Products */}
      <Link
        href="/products"
        className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
            Store &rarr;
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Products In Stock
          </span>
          <h4 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {totalProducts}
          </h4>
        </div>
      </Link>

      {/* Registered Users */}
      <Link
        href="/users"
        className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <GroupIcon className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
            Users &rarr;
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Users
          </span>
          <h4 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {totalUsers}
          </h4>
        </div>
      </Link>
    </div>
  );
};
