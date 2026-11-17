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
import { ActionGroup, EditAction, DeleteAction } from "../common/TableActions";

interface Brand {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function BrandTable() {
  const [brands, setBrands] = useState<Brand[]>([]);
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
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/brands");
      setBrands(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Failed to fetch brands", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch brands");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setName("");
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setModalMode("edit");
    setName(brand.name);
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setSelectedBrand(null);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const slug = generateSlug(name);
      if (modalMode === "create") {
        await api.post("/brands", { name, slug });
      } else if (modalMode === "edit" && selectedBrand) {
        await api.patch(`/brands/${selectedBrand.id}`, { name, slug });
      }
      await fetchBrands();
      closeModal();
    } catch (err: any) {
      console.error(`Failed to ${modalMode} brand`, err);
      alert(err?.response?.data?.message || `Failed to ${modalMode} brand`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    try {
      await api.delete(`/brands/${id}`);
      await fetchBrands();
    } catch (err: any) {
      console.error("Failed to delete brand", err);
      alert(err?.response?.data?.message || "Failed to delete brand");
    }
  };

  const filteredBrands = useMemo(() => {
    const safeBrands = Array.isArray(brands) ? brands : [];
    if (!searchQuery.trim()) return safeBrands;
    const q = searchQuery.toLowerCase();
    return safeBrands.filter(
      (b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q)
    );
  }, [brands, searchQuery]);

  const totalPages = Math.ceil(filteredBrands.length / pageSize) || 1;
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBrands.slice(start, start + pageSize);
  }, [filteredBrands, currentPage, pageSize]);

  if (loading && brands.length === 0) {
    return <ComponentLoader text="Loading brand catalog..." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchBrands} className="font-semibold text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search brands (Apple, Samsung, etc.)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>
        <Button onClick={openCreateModal}>
          + Add Brand
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Brand Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Slug</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Created At</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedBrands.map((brand) => (
                  <TableRow key={brand.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                    <TableCell className="px-5 py-3.5 text-start">
                      <span className="block font-semibold text-gray-900 text-theme-sm dark:text-white">
                        {brand.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-500 text-start text-xs font-mono dark:text-gray-400">
                      {brand.slug}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-400 text-start text-xs">
                      {new Date(brand.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <ActionGroup>
                        <EditAction
                          onClick={() => openEditModal(brand)}
                          title="Edit Brand"
                        />
                        <DeleteAction
                          onClick={() => handleDelete(brand.id)}
                          title="Delete Brand"
                        />
                      </ActionGroup>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedBrands.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 text-xs">
                      {searchQuery ? "No matching brands found." : "No brands found."}
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
            totalItems={filteredBrands.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[450px] p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          {modalMode === "create" ? "Add New Brand" : "Edit Brand"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="brandName">Brand Name *</Label>
            <Input
              id="brandName"
              type="text"
              placeholder="e.g. Apple, Samsung, OnePlus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Brand" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
