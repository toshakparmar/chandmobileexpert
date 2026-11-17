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
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Pagination from "./Pagination";
import ComponentLoader from "../common/ComponentLoader";
import { ActionGroup, ViewAction, DeleteAction } from "../common/TableActions";

interface GeneralEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isResolved: boolean;
  adminNotes: string | null;
  createdAt: string;
}

export default function GeneralEnquiryTable() {
  const [enquiries, setEnquiries] = useState<GeneralEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "RESOLVED" | "PENDING">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<GeneralEnquiry | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/general-enquiries");
      if (Array.isArray(response.data)) {
        setEnquiries(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setEnquiries(response.data.data);
      } else {
        setEnquiries([]);
      }
    } catch (error) {
      console.error("Failed to fetch enquiries", error);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const openEditModal = (enquiry: GeneralEnquiry) => {
    setSelectedEnquiry(enquiry);
    setIsResolved(enquiry.isResolved);
    setAdminNotes(enquiry.adminNotes || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEnquiry(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      setIsSubmitting(true);
      await api.patch(`/general-enquiries/${selectedEnquiry.id}`, { isResolved, adminNotes });
      await fetchEnquiries();
      closeModal();
    } catch (error) {
      console.error("Failed to update enquiry", error);
      alert("Failed to update enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await api.delete(`/general-enquiries/${id}`);
      await fetchEnquiries();
    } catch (error) {
      console.error("Failed to delete enquiry", error);
      alert("Failed to delete enquiry");
    }
  };

  // Filter & Pagination logic
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "RESOLVED" && enq.isResolved) ||
        (statusFilter === "PENDING" && !enq.isResolved);

      if (!matchesStatus) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        enq.name?.toLowerCase().includes(q) ||
        enq.email?.toLowerCase().includes(q) ||
        enq.phone?.toLowerCase().includes(q) ||
        enq.subject?.toLowerCase().includes(q) ||
        enq.message?.toLowerCase().includes(q)
      );
    });
  }, [enquiries, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredEnquiries.length / pageSize) || 1;
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEnquiries.slice(start, start + pageSize);
  }, [filteredEnquiries, currentPage, pageSize]);

  if (loading && enquiries.length === 0) {
    return <ComponentLoader text="Loading customer enquiries..." />;
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search enquiries by name, email, subject..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(["ALL", "PENDING", "RESOLVED"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-brand-500 text-white shadow-sm font-bold"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Contact
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Subject & Preview
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Submitted
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-xs uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedEnquiries.map((enq) => (
                <TableRow key={enq.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <TableCell className="px-5 py-4 text-start">
                    <span className="block font-semibold text-gray-900 text-xs dark:text-white">
                      {enq.name}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      #{enq.id.slice(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <span className="block text-xs font-mono text-gray-700 dark:text-gray-300">
                      {enq.phone}
                    </span>
                    <span className="block text-[11px] text-gray-400">
                      {enq.email}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="max-w-[260px]">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={enq.subject}>
                        {enq.subject}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate" title={enq.message}>
                        {enq.message}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={enq.isResolved ? "success" : "warning"}
                    >
                      {enq.isResolved ? "Resolved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-xs text-gray-500">
                    {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end">
                    <ActionGroup>
                      <ViewAction
                        onClick={() => openEditModal(enq)}
                        title="View Enquiry & Reply"
                      />
                      <DeleteAction
                        onClick={() => handleDelete(enq.id)}
                        title="Delete Enquiry"
                      />
                    </ActionGroup>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedEnquiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                    {searchQuery ? "No customer enquiries match your search query." : "No enquiries found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredEnquiries.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* VIEW & UPDATE MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-lg p-6">
        <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
          Customer Enquiry Details
        </h3>
        {selectedEnquiry && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {selectedEnquiry.name}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {new Date(selectedEnquiry.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Email:</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-brand-600 dark:text-brand-400 hover:underline">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Phone:</span>
                  <a href={`tel:${selectedEnquiry.phone}`} className="font-mono text-brand-600 dark:text-brand-400 hover:underline">
                    {selectedEnquiry.phone}
                  </a>
                </div>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Subject:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedEnquiry.subject}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Message:</span>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 text-xs text-gray-700 shadow-xs dark:bg-gray-800 dark:text-gray-200 border border-gray-200/60 dark:border-gray-700">
                  {selectedEnquiry.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isResolved"
                checked={isResolved}
                onChange={(e) => setIsResolved(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <Label htmlFor="isResolved" className="mb-0 text-xs font-semibold cursor-pointer">
                Mark as Resolved
              </Label>
            </div>

            <div>
              <Label htmlFor="adminNotes">Internal Resolution Notes</Label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 p-3 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                placeholder="Add notes about customer follow-up or resolution..."
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" onClick={closeModal} type="button">
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Saving..." : "Update Enquiry"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
