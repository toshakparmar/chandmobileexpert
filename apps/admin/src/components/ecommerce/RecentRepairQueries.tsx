"use client";
import React from "react";
import Link from "next/link";
import Badge from "../ui/badge/Badge";

interface RepairQuery {
  id: string;
  referenceNumber?: string;
  name: string;
  phone: string;
  deviceBrand: string;
  deviceModel: string;
  issue: string;
  status: string;
  createdAt: string;
}

interface RecentRepairQueriesProps {
  queries?: RepairQuery[];
}

export default function RecentRepairQueries({ queries = [] }: RecentRepairQueriesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "info";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "light";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Repair Queries
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live device repair requests from customers
            </p>
          </div>
          <Link
            href="/repair-queries"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            All Repairs &rarr;
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {queries.map((q) => (
            <div key={q.id} className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {q.deviceBrand} {q.deviceModel}
                  </span>
                  {q.referenceNumber && (
                    <span className="text-[11px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {q.referenceNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{q.name}</span> • {q.phone}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5 italic">
                  &ldquo;{q.issue}&rdquo;
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge size="sm" color={getStatusColor(q.status)}>
                  {q.status}
                </Badge>
                <span className="text-[10px] text-gray-400">
                  {new Date(q.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          ))}

          {queries.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
              No recent repair queries.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
        <Link
          href="/repair-queries"
          className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300 transition"
        >
          Diagnose & Update Status
        </Link>
      </div>
    </div>
  );
}

