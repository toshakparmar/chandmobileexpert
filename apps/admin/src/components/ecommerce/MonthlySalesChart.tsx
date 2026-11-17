"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface MonthlySalesChartProps {
  data?: {
    categories: string[];
    revenue: number[];
    orders: number[];
  };
}

export default function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  const categories = data?.categories && data.categories.length > 0
    ? data.categories
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const revenueData = data?.revenue && data.revenue.length > 0
    ? data.revenue
    : [0, 0, 0, 0, 0, 0];

  const ordersData = data?.orders && data.orders.length > 0
    ? data.orders
    : [0, 0, 0, 0, 0, 0];

  const totalPeriodRevenue = revenueData.reduce((acc, curr) => acc + curr, 0);

  const options: ApexOptions = {
    colors: ["#047857", "#10b981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "42%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 3,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit",
      labels: {
        colors: "#64748b",
      },
    },
    yaxis: [
      {
        title: {
          text: undefined,
        },
        labels: {
          formatter: (val) => `₹${Math.round(val).toLocaleString("en-IN")}`,
          style: {
            colors: "#64748b",
            fontSize: "11px",
          },
        },
      },
      {
        opposite: true,
        title: {
          text: undefined,
        },
        labels: {
          formatter: (val) => `${Math.round(val)} orders`,
          style: {
            colors: "#64748b",
            fontSize: "11px",
          },
        },
      },
    ],
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number, opts) => {
          if (opts.seriesIndex === 0) {
            return `₹${Number(val || 0).toLocaleString("en-IN")}`;
          }
          return `${val} orders`;
        },
      },
    },
  };

  const series = [
    {
      name: "Revenue (₹)",
      data: revenueData,
    },
    {
      name: "Orders Count",
      data: ordersData,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sales & Revenue Trend
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Monthly performance across device sales & certified repairs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
            6-Month Volume: ₹{totalPeriodRevenue.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="-ml-3 min-w-[500px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={250}
          />
        </div>
      </div>
    </div>
  );
}
