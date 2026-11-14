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
import { ConfirmModal } from "../ui/modal/ConfirmModal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { PencilIcon, TrashBinIcon } from "@/icons";

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setName("");
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setModalMode("edit");
    setName(category.name);
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setSelectedCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        await api.post("/categories", { name });
      } else if (modalMode === "edit" && selectedCategory) {
        await api.patch(`/categories/${selectedCategory.id}`, { name });
      }
      await fetchCategories();
      closeModal();
    } catch (error) {
      console.error(`Failed to ${modalMode} category`, error);
      alert(`Failed to ${modalMode} category`);
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
      await api.delete(`/categories/${deleteId}`);
      await fetchCategories();
      setIsConfirmOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete category", error);
      alert("Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && categories.length === 0) return <div className="p-5">Loading categories...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateModal}>
          + Add Category
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Slug</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Created At</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {category.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {category.slug}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-brand-500 hover:text-brand-600 font-medium"
                         title="Edit"><PencilIcon className="w-5 h-5" /></button>
                        <button
                          onClick={() => handleDeleteClick(category.id)}
                          className="text-error-500 hover:text-error-600 font-medium"
                         title="Delete"><TrashBinIcon className="w-5 h-5" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-4 text-center text-gray-500">
                      No categories found.
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
          {modalMode === "create" ? "Add Category" : "Edit Category"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Screen Repair"
              required
            />
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

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
