"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { api } from "@/lib/api";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "@/icons";
import Pagination from "./Pagination";
import ComponentLoader from "../common/ComponentLoader";

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg
    className={`w-3.5 h-3.5 ${filled ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`}
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

interface Testimonial {
  id: string;
  customerName: string;
  rating: number;
  review: string;
  isActive: boolean;
  createdAt: string;
}

export default function TestimonialTable() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get("/testimonials");
      setTestimonials(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch testimonials", error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setCustomerName("");
    setRating(5);
    setReview("");
    setIsActive(true);
    setSelectedTestimonial(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setSelectedTestimonial(t);
    setCustomerName(t.customerName);
    setRating(t.rating || 5);
    setReview(t.review);
    setIsActive(t.isActive);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !review.trim()) {
      alert("Customer name and review are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { customerName: customerName.trim(), rating, review: review.trim(), isActive };

      if (modalMode === "create") {
        await api.post("/testimonials", payload);
      } else if (modalMode === "edit" && selectedTestimonial) {
        await api.patch(`/testimonials/${selectedTestimonial.id}`, payload);
      }
      await fetchTestimonials();
      closeModal();
    } catch (error) {
      console.error(`Failed to ${modalMode} testimonial`, error);
      alert(`Failed to ${modalMode} testimonial`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await api.delete(`/testimonials/${id}`);
      await fetchTestimonials();
    } catch (error) {
      console.error("Failed to delete testimonial", error);
      alert("Failed to delete testimonial");
    }
  };

  const filteredTestimonials = useMemo(() => {
    if (!searchQuery.trim()) return testimonials;
    const q = searchQuery.toLowerCase();
    return testimonials.filter(
      (t) =>
        t.customerName?.toLowerCase().includes(q) ||
        t.review?.toLowerCase().includes(q)
    );
  }, [testimonials, searchQuery]);

  const totalPages = Math.ceil(filteredTestimonials.length / pageSize) || 1;
  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTestimonials.slice(start, start + pageSize);
  }, [filteredTestimonials, currentPage, pageSize]);

  if (loading && testimonials.length === 0) {
    return <ComponentLoader text="Loading customer testimonials..." />;
  }

  return (
    <div className="space-y-4">
      {/* Top Search & Add Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search testimonials by customer or review..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>

        <Button onClick={openCreateModal} className="shrink-0 self-end sm:self-auto">
          + Add Testimonial
        </Button>
      </div>

      {/* Testimonials Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Rating
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Review & Feedback
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Date
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-xs uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedTestimonials.map((t) => (
                <TableRow key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <TableCell className="px-5 py-4 text-start">
                    <span className="block font-semibold text-gray-900 text-xs dark:text-white">
                      {t.customerName}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      #{t.id.slice(0, 8)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= t.rating} />
                      ))}
                      <span className="ml-1 text-xs font-bold text-gray-700 dark:text-gray-300">
                        {t.rating}/5
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md line-clamp-2" title={t.review}>
                      "{t.review}"
                    </p>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={t.isActive ? "success" : "error"}
                    >
                      {t.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start text-xs text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-end">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit Testimonial"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                        title="Delete Testimonial"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedTestimonials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                    {searchQuery ? "No testimonials match your search criteria." : "No customer reviews yet."}
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
        totalItems={filteredTestimonials.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* CREATE / EDIT TESTIMONIAL MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-lg p-6">
        <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
          {modalMode === "create" ? "Add Customer Testimonial" : "Edit Testimonial"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="custName">Customer Name *</Label>
            <Input
              id="custName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Amit Patel"
              required
            />
          </div>

          <div>
            <Label htmlFor="rating">Rating (1 to 5 Stars)</Label>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                >
                  <svg
                    className={`w-6 h-6 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="review">Customer Review *</Label>
            <textarea
              id="review"
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              placeholder="Write the customer feedback or testimonial text here..."
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="testActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <Label htmlFor="testActive" className="mb-0 text-xs font-semibold cursor-pointer">
              Active (Visible on public Testimonial slider / showcase)
            </Label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Add Testimonial" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
