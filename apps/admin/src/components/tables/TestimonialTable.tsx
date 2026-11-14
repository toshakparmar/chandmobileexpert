"use client";
import React, { useEffect, useState } from "react";
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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState("5");
  const [review, setReview] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get("/testimonials");
      setTestimonials(response.data);
    } catch (error) {
      console.error("Failed to fetch testimonials", error);
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
    setRating("5");
    setReview("");
    setIsActive(true);
    setSelectedTestimonial(null);
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setModalMode("edit");
    setCustomerName(testimonial.customerName);
    setRating(testimonial.rating.toString());
    setReview(testimonial.review);
    setIsActive(testimonial.isActive);
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !review.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = { customerName, rating: parseInt(rating), review, isActive };
      
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

  if (loading && testimonials.length === 0) return <div className="p-5">Loading testimonials...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateModal}>
          + Add Testimonial
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Customer Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Rating</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {testimonials.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {t.customerName}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {t.rating} / 5
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={t.isActive ? "success" : "error"}
                      >
                        {t.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="text-brand-500 hover:text-brand-600 font-medium"
                         title="Edit"><PencilIcon className="w-5 h-5" /></button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-error-500 hover:text-error-600 font-medium"
                         title="Delete"><TrashBinIcon className="w-5 h-5" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {testimonials.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-4 text-center text-gray-500">
                      No testimonials found.
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
          {modalMode === "create" ? "Add Testimonial" : "Edit Testimonial"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="review">Review</Label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="Customer's review..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <Label htmlFor="isActive" className="mb-0">Is Active</Label>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Create" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
