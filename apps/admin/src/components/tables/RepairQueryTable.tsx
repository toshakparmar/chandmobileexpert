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
import { ActionGroup, ViewAction, EditAction, DeleteAction } from "../common/TableActions";

interface RepairQuery {
  id: string;
  referenceNumber?: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  deviceBrand?: string;
  deviceModel: string;
  issueDesc: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

export default function RepairQueryTable() {
  const [queries, setQueries] = useState<RepairQuery[]>([]);
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
  const [selectedQuery, setSelectedQuery] = useState<RepairQuery | null>(null);
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/book-repairs");
      setQueries(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Failed to fetch repair queries", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch repair queries");
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const openEditModal = (query: RepairQuery) => {
    setSelectedQuery(query);
    setStatus(query.status);
    setAdminNotes(query.adminNotes || "");
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (query: RepairQuery) => {
    setSelectedQuery(query);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuery(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery) return;

    try {
      setIsSubmitting(true);
      await api.patch(`/book-repairs/${selectedQuery.id}`, {
        status,
        adminNotes: adminNotes.trim() || undefined,
      });
      await fetchQueries();
      closeModal();
    } catch (err: any) {
      console.error("Failed to update repair query", err);
      alert(err?.response?.data?.message || "Failed to update repair query");
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
      await api.delete(`/book-repairs/${deleteId}`);
      await fetchQueries();
      setIsConfirmOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      console.error("Failed to delete repair query", err);
      alert(err?.response?.data?.message || "Failed to delete repair query");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredQueries = useMemo(() => {
    const safeQueries = Array.isArray(queries) ? queries : [];
    return safeQueries
      .filter((q) => (statusFilter === "ALL" ? true : q.status === statusFilter))
      .filter((q) => {
        if (!searchQuery.trim()) return true;
        const s = searchQuery.toLowerCase();
        return (
          q.customerName.toLowerCase().includes(s) ||
          q.customerPhone.toLowerCase().includes(s) ||
          q.deviceModel.toLowerCase().includes(s) ||
          (q.deviceBrand && q.deviceBrand.toLowerCase().includes(s)) ||
          (q.referenceNumber && q.referenceNumber.toLowerCase().includes(s)) ||
          q.issueDesc.toLowerCase().includes(s)
        );
      });
  }, [queries, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredQueries.length / pageSize) || 1;
  const paginatedQueries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQueries.slice(start, start + pageSize);
  }, [filteredQueries, currentPage, pageSize]);

  const getStatusColor = (st: string) => {
    switch (st) {
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      case "PENDING":
        return "warning";
      case "IN_PROGRESS":
        return "info";
      default:
        return "light";
    }
  };

  if (loading && queries.length === 0) {
    return <ComponentLoader text="Loading repair requests..." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchQueries} className="font-semibold text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search repairs by customer, phone, device, issue..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
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

      {/* Repair Queries Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[950px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Query / Ref</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Customer</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Device</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Issue Description</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Date</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedQueries.map((query) => (
                  <TableRow key={query.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                    <TableCell className="px-5 py-3.5 text-start">
                      <span className="block font-semibold text-gray-900 text-theme-sm dark:text-white" title={query.id}>
                        {query.referenceNumber || `#${query.id.slice(0, 8)}`}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-start text-theme-sm">
                      <span className="block font-semibold text-gray-800 dark:text-white/90">
                        {query.customerName}
                      </span>
                      <span className="block text-xs text-gray-400">
                        {query.customerPhone}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {query.deviceBrand ? `${query.deviceBrand} ` : ""}{query.deviceModel}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="truncate max-w-[220px]" title={query.issueDesc}>
                        {query.issueDesc}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-start text-theme-sm">
                      <Badge size="sm" color={getStatusColor(query.status)}>
                        {query.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-400 text-start text-xs">
                      {new Date(query.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <ActionGroup>
                        <ViewAction
                          onClick={() => openViewModal(query)}
                          title="View Details"
                        />
                        <EditAction
                          onClick={() => openEditModal(query)}
                          title="Diagnose & Update Status"
                        />
                        <DeleteAction
                          onClick={() => handleDeleteClick(query.id)}
                          title="Delete Query"
                        />
                      </ActionGroup>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedQueries.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-400 text-xs">
                      {searchQuery ? "No matching repair queries found." : "No repair queries found."}
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
            totalItems={filteredQueries.length}
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
              Diagnose & Update Repair
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="status">Repair Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="PENDING">Pending (New Query Received)</option>
                  <option value="IN_PROGRESS">In Progress (Under Diagnosis / Repair)</option>
                  <option value="COMPLETED">Completed (Repaired & Ready for Pickup)</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <Label htmlFor="adminNotes">Technician / Admin Notes</Label>
                <textarea
                  id="adminNotes"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Screen replaced with genuine OLED panel. Tested touch sensitivity & FaceID."
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                <Button variant="outline" onClick={closeModal} type="button">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : "Save Diagnosis"}
                </Button>
              </div>
            </form>
          </>
        ) : selectedQuery ? (
          <>
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Repair Request ({selectedQuery.referenceNumber || `#${selectedQuery.id.slice(0, 8)}`})
            </h3>
            <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Customer</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedQuery.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Phone</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedQuery.customerPhone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Device</span>
                <span>{selectedQuery.deviceBrand ? `${selectedQuery.deviceBrand} ` : ""}{selectedQuery.deviceModel}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Status</span>
                <Badge size="sm" color={getStatusColor(selectedQuery.status)}>{selectedQuery.status}</Badge>
              </div>
              <div className="pt-1">
                <span className="font-semibold text-gray-500 block mb-1">Issue Description:</span>
                <p className="bg-gray-50 dark:bg-white/[0.02] p-2.5 rounded-xl text-gray-800 dark:text-gray-200">
                  {selectedQuery.issueDesc}
                </p>
              </div>
              {selectedQuery.adminNotes && (
                <div className="pt-1">
                  <span className="font-semibold text-gray-500 block mb-1">Technician Notes:</span>
                  <p className="bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl text-emerald-800 dark:text-emerald-300">
                    {selectedQuery.adminNotes}
                  </p>
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Repair Query"
        message="Are you sure you want to delete this repair request? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
