"use client";
import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Order {
  id: string;
  orderNumber?: string;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  user?: { email?: string; firstName?: string; lastName?: string; name?: string };
  payment?: { status: string; method?: string; paymentMethod?: string; utr?: string };
}

interface RecentOrdersProps {
  orders?: Order[];
}

export default function RecentOrders({ orders = [] }: RecentOrdersProps) {
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge size="sm" color="success">Delivered</Badge>;
      case "SHIPPED":
        return <Badge size="sm" color="info">Shipped</Badge>;
      case "PROCESSING":
        return <Badge size="sm" color="info">Processing</Badge>;
      case "CONFIRMED":
        return <Badge size="sm" color="primary">Confirmed</Badge>;
      case "PENDING":
        return <Badge size="sm" color="warning">Pending</Badge>;
      case "CANCELLED":
        return <Badge size="sm" color="error">Cancelled</Badge>;
      default:
        return <Badge size="sm" color="light">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (order: Order) => {
    const status = order.payment?.status || order.paymentStatus;
    switch (status) {
      case "PAID":
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full">Paid</span>;
      case "AWAITING_VERIFICATION":
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full">Verify UTR</span>;
      case "AWAITING_PAYMENT":
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/60 dark:text-orange-300 px-2 py-0.5 rounded-full">Awaiting</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 dark:bg-red-950/60 dark:text-red-300 px-2 py-0.5 rounded-full">Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full">COD / Unpaid</span>;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Orders & Transactions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Latest customer purchases with live UPI verification status
          </p>
        </div>
        <Link
          href="/orders"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition"
        >
          View All Orders &rarr;
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Order
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Customer
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Payment
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Amount
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                Fulfillment
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                <TableCell className="py-3.5">
                  <span className="font-semibold text-gray-900 text-theme-sm dark:text-white">
                    {order.orderNumber || `#${order.id.slice(0, 8)}`}
                  </span>
                  <span className="block text-[11px] text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 text-theme-sm">
                  <span className="block font-medium text-gray-800 dark:text-gray-200">
                    {order.user?.firstName ? `${order.user.firstName} ${order.user.lastName || ""}`.trim() : (order.user?.name || "Customer")}
                  </span>
                  <span className="block text-xs text-gray-400 truncate max-w-[150px]">
                    {order.user?.email || "Guest"}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  {getPaymentStatusBadge(order)}
                </TableCell>
                <TableCell className="py-3.5 font-bold text-gray-900 text-theme-sm dark:text-white">
                  ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="py-3.5 text-end">
                  {getOrderStatusBadge(order.status)}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                  No recent orders recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
