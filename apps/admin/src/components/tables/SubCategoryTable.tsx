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
import Pagination from "./Pagination";
import ComponentLoader from "../common/ComponentLoader";
import { PencilIcon, TrashBinIcon } from "@/icons";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: { name: string };
  createdAt: string;
}

export default function SubCategoryTable() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subCatRes, catRes] = await Promise.all([
        api.get("/sub-categories"),
        api.get("/categories")
      ]);
      setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : []);
      setCategories(
        Array.isArray(catRes.data)
          ? catRes.data.map((c: any) => ({ value: c.id.toString(), label: c.name }))
          : []
      );
    } catch (err: any) {
      console.error("Failed to fetch sub-categories", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch sub-categories");
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setName("");
    setCategoryId(categories.length > 0 ? categories[0].value : "");
    setSelectedSubCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (subCat: SubCategory) => {
    setModalMode("edit");
    setName(subCat.name);
    setCategoryId(subCat.categoryId.toString());
    setSelectedSubCategory(subCat);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubCategory(null);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    try {
      setIsSubmitting(true);
      const slug = generateSlug(name);
      if (modalMode === "create") {
        await api.post("/sub-categories", { name, slug, categoryId });
      } else if (modalMode === "edit" && selectedSubCategory) {
        await api.patch(`/sub-categories/${selectedSubCategory.id}`, { name, slug, categoryId });
      }
      await fetchSubCategories();
      closeModal();
    } catch (err: any) {
      console.error(`Failed to ${modalMode} sub-category`, err);
      alert(err?.response?.data?.message || `Failed to ${modalMode} sub-category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sub-category?")) return;
    try {
      await api.delete(`/sub-categories/${id}`);
      await fetchSubCategories();
    } catch (err: any) {
      console.error("Failed to delete sub-category", err);
      alert(err?.response?.data?.message || "Failed to delete sub-category");
    }
  };

  const filteredSubCategories = useMemo(() => {
    const safeSubCategories = Array.isArray(subCategories) ? subCategories : [];
    if (!searchQuery.trim()) return safeSubCategories;
    const q = searchQuery.toLowerCase();
    return safeSubCategories.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.category?.name && s.category.name.toLowerCase().includes(q)) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [subCategories, searchQuery]);

  const totalPages = Math.ceil(filteredSubCategories.length / pageSize) || 1;
  const paginatedSubCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubCategories.slice(start, start + pageSize);
  }, [filteredSubCategories, currentPage, pageSize]);

  if (loading && subCategories.length === 0) {
    return <ComponentLoader text="Loading sub-categories catalog..." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchSubCategories} className="font-semibold text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search sub-categories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>
        <Button onClick={openCreateModal}>
          + Add Sub-Category
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[750px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Sub-Category</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Parent Category</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Slug</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Created At</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedSubCategories.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                    <TableCell className="px-5 py-3.5 text-start">
                      <span className="block font-semibold text-gray-900 text-theme-sm dark:text-white">
                        {sub.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {sub.category?.name || `Category #${sub.categoryId}`}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-500 text-start text-xs font-mono dark:text-gray-400">
                      {sub.slug}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-400 text-start text-xs">
                      {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-error-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                          title="Delete"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedSubCategories.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 text-xs">
                      {searchQuery ? "No matching sub-categories found." : "No sub-categories found."}
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
            totalItems={filteredSubCategories.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[450px] p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          {modalMode === "create" ? "Add Sub-Category" : "Edit Sub-Category"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subCategoryName">Name *</Label>
            <Input
              id="subCategoryName"
              type="text"
              placeholder="e.g. AMOLED Screens"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="parentCategory">Parent Category *</Label>
            <select
              id="parentCategory"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {name && (
            <p className="text-xs text-gray-400">
              Generated Slug: <span className="font-mono text-gray-600 dark:text-gray-300">{generateSlug(name)}</span>
            </p>
          )}

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Sub-Category" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
