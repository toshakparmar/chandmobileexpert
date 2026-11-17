"use client";
import React, { useEffect, useState } from "react";
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
import { TrashBinIcon } from "@/icons";

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

  if (loading && enquiries.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span>Loading enquiries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Subject</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Date</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {Array.isArray(enquiries) && enquiries.map((enq) => (
                  <TableRow key={enq.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {enq.id.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {enq.name}<br/>
                      <span className="text-xs">{enq.email}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="truncate max-w-[200px]" title={enq.subject}>
                        {enq.subject}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={enq.isResolved ? "success" : "warning"}
                      >
                        {enq.isResolved ? "Resolved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(enq)}
                          className="text-brand-500 hover:text-brand-600 font-medium"
                        >
                          View / Update
                        </button>
                        <button
                          onClick={() => handleDelete(enq.id)}
                          className="text-error-500 hover:text-error-600 font-medium"
                         title="Delete"><TrashBinIcon className="w-5 h-5" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {enquiries.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="px-5 py-4 text-center text-gray-500">
                      No enquiries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[500px] p-6">
        <h3 className="mb-5 text-lg font-bold text-gray-800 dark:text-white/90">
          Enquiry Details
        </h3>
        {selectedEnquiry && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Name:</strong> {selectedEnquiry.name}</p>
              <p><strong>Email:</strong> {selectedEnquiry.email}</p>
              <p><strong>Phone:</strong> {selectedEnquiry.phone}</p>
              <p><strong>Subject:</strong> {selectedEnquiry.subject}</p>
              <div className="mt-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="whitespace-pre-wrap">{selectedEnquiry.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="isResolved"
                checked={isResolved}
                onChange={(e) => setIsResolved(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <Label htmlFor="isResolved" className="mb-0">Mark as Resolved</Label>
            </div>
            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Internal notes..."
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={closeModal} type="button">
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Saving..." : "Update"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
