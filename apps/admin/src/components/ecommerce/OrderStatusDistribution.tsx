"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import Link from "next/link";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface OrderStatusDistributionProps {
  distribution?: Record<string, number>;
}

export default function OrderStatusDistribution({ distribution }: OrderStatusDistributionProps) {
  const pending = distribution?.PENDING || 0;
  const confirmed = distribution?.CONFIRMED || 0;
  const processing = distribution?.PROCESSING || 0;
  const shipped = distribution?.SHIPPED || 0;
  const delivered = distribution?.DELIVERED || 0;
  const cancelled = distribution?.CANCELLED || 0;

  const total = pending + confirmed + processing + shipped + delivered + cancelled;
  const deliveredRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

  const series = total > 0 
    ? [delivered, shipped + processing, confirmed, pending, cancelled]
    : [1, 0, 0, 0, 0];

  const labels = ["Delivered", "In Transit / Processing", "Confirmed", "Pending", "Cancelled"];

  const options: ApexOptions = {
    labels,
    colors: ["#047857", "#0ea5e9", "#f59e0b", "#fb923c", "#ef4444"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 250,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Fulfillment",
              formatter: () => `${deliveredRate}%`,
              fontSize: "14px",
              fontWeight: 600,
              color: "#047857",
            },
            value: {
              fontSize: "24px",
              fontWeight: 700,
              color: "#0f172a",
              offsetY: 2,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    stroke: {
      width: 2,
      colors: ["#ffffff"],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} orders`,
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Fulfillment
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Lifecycle status of all store orders
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Manage &rarr;
          </Link>
        </div>

        <div className="flex justify-center my-2">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={220}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 dark:border-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
          <span className="text-gray-600 dark:text-gray-400">Delivered:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{delivered}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          <span className="text-gray-600 dark:text-gray-400">Processing:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{processing + shipped}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-gray-600 dark:text-gray-400">Confirmed:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{confirmed}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
          <span className="text-gray-600 dark:text-gray-400">Pending:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{pending}</span>
        </div>
      </div>
    </div>
  );
}

