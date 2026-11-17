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
import Pagination from "./Pagination";
import ComponentLoader from "../common/ComponentLoader";
import { ActionGroup, EditAction, DeleteAction } from "../common/TableActions";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function FaqTable() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

  // Form states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/faqs");
      setFaqs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch FAQs", error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setQuestion("");
    setAnswer("");
    setCategory("");
    setIsActive(true);
    setSelectedFaq(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setModalMode("edit");
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || "");
    setIsActive(faq.isActive);
    setSelectedFaq(faq);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFaq(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      alert("Question and Answer are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { question, answer, category: category.trim() || null, isActive };

      if (modalMode === "create") {
        await api.post("/faqs", payload);
      } else if (modalMode === "edit" && selectedFaq) {
        await api.patch(`/faqs/${selectedFaq.id}`, payload);
      }
      await fetchFaqs();
      closeModal();
    } catch (error) {
      console.error(`Failed to ${modalMode} FAQ`, error);
      alert(`Failed to ${modalMode} FAQ`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await api.delete(`/faqs/${id}`);
      await fetchFaqs();
    } catch (error) {
      console.error("Failed to delete FAQ", error);
      alert("Failed to delete FAQ");
    }
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question?.toLowerCase().includes(q) ||
        f.answer?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  const totalPages = Math.ceil(filteredFaqs.length / pageSize) || 1;
  const paginatedFaqs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFaqs.slice(start, start + pageSize);
  }, [filteredFaqs, currentPage, pageSize]);

  if (loading && faqs.length === 0) {
    return <ComponentLoader text="Loading FAQs..." />;
  }

  return (
    <div className="space-y-4">
      {/* Top Search & Add Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search FAQs by question, category, answer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>

        <Button onClick={openCreateModal} className="shrink-0 self-end sm:self-auto">
          + Add FAQ
        </Button>
      </div>

      {/* FAQs Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Question
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Category
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-xs uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedFaqs.map((faq) => (
                <TableRow key={faq.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <TableCell className="px-5 py-4 text-start">
                    <div className="max-w-lg">
                      <span className="block font-semibold text-gray-900 text-xs dark:text-white">
                        {faq.question}
                      </span>
                      <p className="mt-0.5 text-[11px] text-gray-400 line-clamp-2">
                        {faq.answer}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {faq.category ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {faq.category}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">General</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={faq.isActive ? "success" : "error"}
                    >
                      {faq.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end">
                    <ActionGroup>
                      <EditAction
                        onClick={() => openEditModal(faq)}
                        title="Edit FAQ"
                      />
                      <DeleteAction
                        onClick={() => handleDelete(faq.id)}
                        title="Delete FAQ"
                      />
                    </ActionGroup>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedFaqs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-xs text-gray-400">
                    {searchQuery ? "No FAQs match your search criteria." : "No FAQs created yet."}
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
        totalItems={filteredFaqs.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* CREATE / EDIT FAQ MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-lg p-6">
        <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
          {modalMode === "create" ? "Add New FAQ" : "Edit FAQ"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How long does a screen replacement take?"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Repairs, Shipping, Warranty, Pricing"
            />
          </div>

          <div>
            <Label htmlFor="answer">Answer *</Label>
            <textarea
              id="answer"
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              placeholder="Provide a clear, detailed answer to the question..."
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="faqActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <Label htmlFor="faqActive" className="mb-0 text-xs font-semibold cursor-pointer">
              Active (Visible on public FAQs page)
            </Label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Create FAQ" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
