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
  const [categories, setCategories] = useState<{value: string, label: string}[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [subCatRes, catRes] = await Promise.all([
        api.get("/sub-categories"),
        api.get("/categories")
      ]);
      setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data.map((c: any) => ({ value: c.id.toString(), label: c.name })) : []);
    } catch (error) {
      console.error("Failed to fetch data", error);
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
    setCategoryId("");
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
    setName("");
    setCategoryId("");
    setSelectedSubCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      alert("Name and Category are required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        await api.post("/sub-categories", { name, categoryId });
      } else if (modalMode === "edit" && selectedSubCategory) {
        await api.patch(`/sub-categories/${selectedSubCategory.id}`, { name, categoryId });
      }
      await fetchSubCategories();
      closeModal();
    } catch (error) {
      console.error(`Failed to ${modalMode} sub-category`, error);
      alert(`Failed to ${modalMode} sub-category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sub-category?")) return;
    try {
      await api.delete(`/sub-categories/${id}`);
      await fetchSubCategories();
    } catch (error) {
      console.error("Failed to delete sub-category", error);
      alert("Failed to delete sub-category");
    }
  };

  if (loading && subCategories.length === 0) return <div className="p-5">Loading sub-categories...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateModal}>
          + Add Sub-Category
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Category</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Created At</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {Array.isArray(subCategories) && subCategories.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {sub.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {sub.category?.name || `ID: ${sub.categoryId}`}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="text-brand-500 hover:text-brand-600 font-medium"
                         title="Edit"><PencilIcon className="w-5 h-5" /></button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="text-error-500 hover:text-error-600 font-medium"
                         title="Delete"><TrashBinIcon className="w-5 h-5" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {subCategories.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-4 text-center text-gray-500">
                      No sub-categories found.
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
          {modalMode === "create" ? "Add Sub-Category" : "Edit Sub-Category"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Sub-Category Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Screen Replacement"
              required
            />
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
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
