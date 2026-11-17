"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { api } from "@/lib/api";
import { Modal } from "../ui/modal";
import { ConfirmModal } from "../ui/modal/ConfirmModal";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Pagination from "./Pagination";
import ComponentLoader from "../common/ComponentLoader";
import { TrashBinIcon, PencilIcon, EyeIcon } from "@/icons";

interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  user?: { firstName?: string; lastName?: string; phone?: string; email?: string; name?: string };
  items?: { quantity: number; product: { name: string; basePrice: number } }[];
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
}

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "view">("edit");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/orders");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Failed to fetch orders", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (order: Order) => {
    setSelectedOrder(order);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsSubmitting(true);
      await api.patch(`/orders/${selectedOrder.id}`, { status });
      await fetchOrders();
      closeModal();
    } catch (err: any) {
      console.error("Failed to update order status", err);
      alert(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.delete(`/orders/${deleteId}`);
      await fetchOrders();
      setIsConfirmOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      console.error("Failed to delete order", err);
      alert(err?.response?.data?.message || "Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    return safeOrders
      .filter((o) => (statusFilter === "ALL" ? true : o.status === statusFilter))
      .filter((o) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const customerName = `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
          customerName.includes(q) ||
          (o.user?.email && o.user.email.toLowerCase().includes(q)) ||
          (o.user?.phone && o.user.phone.toLowerCase().includes(q))
        );
      });
  }, [orders, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  if (loading && orders.length === 0) {
    return <ComponentLoader text="Loading orders & transactions..." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchOrders} className="font-semibold text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search orders by ID, customer, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                statusFilter === st
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[950px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Order ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Customer</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Total Amount</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Items</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Created At</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedOrders.map((order) => {
                  const customerName = order.user?.firstName
                    ? `${order.user.firstName} ${order.user.lastName || ""}`.trim()
                    : (order.user?.name || `Customer #${order.userId.slice(0, 8)}`);

                  return (
                    <TableRow key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                      <TableCell className="px-5 py-3.5 text-start">
                        <span className="block font-semibold text-gray-900 text-theme-sm dark:text-white" title={order.id}>
                          {order.orderNumber || `#${order.id.slice(0, 8)}`}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-start text-theme-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 dark:text-white/90">
                            {customerName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {order.user?.phone || order.user?.email || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 font-bold text-gray-900 text-start text-theme-sm dark:text-white">
                        ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order.items?.length || 0} items
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-start text-theme-sm">
                        <Badge
                          size="sm"
                          color={
                            order.status === "DELIVERED"
                              ? "success"
                              : order.status === "CANCELLED"
                              ? "error"
                              : order.status === "CONFIRMED"
                              ? "primary"
                              : "warning"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-gray-400 text-start text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openViewModal(order)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                            title="View Order Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                            title="Update Status"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(order.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-error-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                            title="Delete"
                          >
                            <TrashBinIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedOrders.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-400 text-xs">
                      {searchQuery ? "No matching orders found." : "No orders found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Edit / View Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[500px] p-6">
        {modalMode === "edit" ? (
          <>
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Update Order Status
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="status">Fulfillment Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="PENDING">Pending (Payment verification / Processing)</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing / Packaging</option>
                  <option value="SHIPPED">Shipped (In Transit)</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                <Button variant="outline" onClick={closeModal} type="button">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Updating..." : "Save Status"}
                </Button>
              </div>
            </form>
          </>
        ) : selectedOrder ? (
          <>
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Order Details ({selectedOrder.orderNumber || `#${selectedOrder.id.slice(0, 8)}`})
            </h3>
            <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Customer</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedOrder.user?.firstName
                    ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName || ""}`.trim()
                    : (selectedOrder.user?.name || "Customer")}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Phone & Email</span>
                <span>{selectedOrder.user?.phone || "—"} • {selectedOrder.user?.email || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Total Amount</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Status</span>
                <Badge size="sm" color="primary">{selectedOrder.status}</Badge>
              </div>
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="pt-2">
                  <span className="font-semibold text-gray-500 block mb-1">Purchased Items:</span>
                  <div className="space-y-1 bg-gray-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.product?.name || "Product"} × {it.quantity}</span>
                        <span className="font-semibold">₹{(it.product?.basePrice * it.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2.5 mt-6">
              <Button onClick={closeModal} type="button">
                Close
              </Button>
            </div>
          </>
        ) : null}
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order record? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
