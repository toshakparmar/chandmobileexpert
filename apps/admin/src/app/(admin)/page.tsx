"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import OrderStatusDistribution from "@/components/ecommerce/OrderStatusDistribution";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import RecentRepairQueries from "@/components/ecommerce/RecentRepairQueries";
import { api } from "@/lib/api";

export default function Ecommerce() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/analytics');
      setData(response.data);
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
          <span className="font-medium">Connecting to Chand Mobile Expert Command Center...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20 max-w-lg mx-auto my-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h4 className="mt-4 text-base font-semibold text-red-800 dark:text-red-400">Unable to load analytics</h4>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error || "Could not retrieve live store metrics."}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 p-6 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
              Live Store Operations • Sambhal, UP
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
            Chand Mobile Expert
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Phone Repairs, Certified Refurbished Devices & Accessories Management
          </p>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition border border-white/10"
          >
            <span>+ Add Product</span>
          </Link>
          <Link
            href="/payments"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition"
          >
            <span>Verify UPI</span>
            {data.pendingUpiPayments > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-emerald-900">
                {data.pendingUpiPayments}
              </span>
            )}
          </Link>
          <Link
            href="/repair-queries"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition border border-white/10"
          >
            <span>Repair Inbox</span>
            {data.pendingRepairs > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-amber-950">
                {data.pendingRepairs}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 6 Key Operational Metric Cards */}
      <EcommerceMetrics 
        totalUsers={data.totalUsers} 
        totalOrders={data.totalOrders}
        totalRevenue={data.totalRevenue}
        pendingRepairs={data.pendingRepairs}
        pendingUpiPayments={data.pendingUpiPayments}
        totalProducts={data.totalProducts}
      />

      {/* Analytics & Fulfillment Section */}
      <div className="grid grid-cols-12 gap-5 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <MonthlySalesChart data={data.monthlyChart} />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <OrderStatusDistribution distribution={data.orderStatusDistribution} />
        </div>
      </div>

      {/* Operations & Customer Requests Section */}
      <div className="grid grid-cols-12 gap-5 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <RecentOrders orders={data.recentOrders} />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <RecentRepairQueries queries={data.recentRepairQueries} />
        </div>
      </div>
    </div>
  );
}
