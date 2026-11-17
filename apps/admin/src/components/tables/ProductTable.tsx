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
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Pagination from "./Pagination";
import ComponentLoader from "../common/ComponentLoader";
import { ActionGroup, EditAction, DeleteAction } from "../common/TableActions";

interface Product {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  salePrice: number | null;
  stockStatus: string;
  categoryId: string;
  subCategoryId: string | null;
  brandId: string | null;
  category?: { name: string };
  brand?: { name: string };
  createdAt: string;
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ value: string; label: string; categoryId: string }[]>([]);
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stockStatus, setStockStatus] = useState("IN_STOCK");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, catRes, subCatRes, brandRes] = await Promise.allSettled([
        api.get("/products"),
        api.get("/categories"),
        api.get("/sub-categories"),
        api.get("/brands"),
      ]);

      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value.data)) {
        setProducts(prodRes.value.data);
      } else if (prodRes.status === "rejected") {
        throw prodRes.reason;
      }

      if (catRes.status === "fulfilled" && Array.isArray(catRes.value.data)) {
        setCategories(catRes.value.data.map((c: any) => ({ value: c.id.toString(), label: c.name })));
      }
      if (subCatRes.status === "fulfilled" && Array.isArray(subCatRes.value.data)) {
        setSubCategories(
          subCatRes.value.data.map((sc: any) => ({
            value: sc.id.toString(),
            label: sc.name,
            categoryId: sc.categoryId.toString(),
          }))
        );
      }
      if (brandRes.status === "fulfilled" && Array.isArray(brandRes.value.data)) {
        setBrands(brandRes.value.data.map((b: any) => ({ value: b.id.toString(), label: b.name })));
      }
    } catch (err: any) {
      console.error("Failed to fetch product data", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setName("");
    setSku("");
    setBasePrice("");
    setSalePrice("");
    setStockStatus("IN_STOCK");
    setCategoryId(categories.length > 0 ? categories[0].value : "");
    setSubCategoryId("");
    setBrandId("");
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode("edit");
    setName(product.name);
    setSku(product.sku);
    setBasePrice(product.basePrice.toString());
    setSalePrice(product.salePrice ? product.salePrice.toString() : "");
    setStockStatus(product.stockStatus);
    setCategoryId(product.categoryId.toString());
    setSubCategoryId(product.subCategoryId ? product.subCategoryId.toString() : "");
    setBrandId(product.brandId ? product.brandId.toString() : "");
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !basePrice || !categoryId) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: any = {
        name,
        sku,
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stockStatus,
        categoryId,
        subCategoryId: subCategoryId || null,
        brandId: brandId || null,
      };

      if (modalMode === "create") {
        await api.post("/products", payload);
      } else if (modalMode === "edit" && selectedProduct) {
        await api.patch(`/products/${selectedProduct.id}`, payload);
      }
      await fetchData();
      closeModal();
    } catch (err: any) {
      console.error(`Failed to ${modalMode} product`, err);
      alert(err?.response?.data?.message || `Failed to ${modalMode} product`);
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
      await api.delete(`/products/${deleteId}`);
      await fetchData();
      setIsConfirmOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      console.error("Failed to delete product", err);
      alert(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSubCategories = subCategories.filter(
    (sc) => sc.categoryId === categoryId
  );

  const filteredProducts = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    if (!searchQuery.trim()) return safeProducts;
    const q = searchQuery.toLowerCase();
    return safeProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  if (loading && products.length === 0) {
    return <ComponentLoader text="Loading product inventory..." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchData} className="font-semibold text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search products by title, SKU, brand..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>
        <Button onClick={openCreateModal}>
          + Add Product
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[950px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Product</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">SKU</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Category</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Brand</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Price</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Stock</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                    <TableCell className="px-5 py-3.5 text-start">
                      <span className="block font-semibold text-gray-900 text-theme-sm dark:text-white">
                        {product.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-500 text-start text-xs font-mono dark:text-gray-400">
                      {product.sku}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {product.category?.name || "General"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                      {product.brand?.name || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 font-bold text-gray-900 text-start text-theme-sm dark:text-white">
                      ₹{Number(product.salePrice || product.basePrice || 0).toLocaleString("en-IN")}
                      {product.salePrice && product.salePrice < product.basePrice && (
                        <span className="ml-1.5 text-xs font-normal text-gray-400 line-through">
                          ₹{Number(product.basePrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-start text-theme-sm">
                      <Badge
                        size="sm"
                        color={
                          product.stockStatus === "IN_STOCK"
                            ? "success"
                            : product.stockStatus === "OUT_OF_STOCK"
                            ? "error"
                            : "warning"
                        }
                      >
                        {product.stockStatus === "IN_STOCK" ? "In Stock" : product.stockStatus === "LOW_STOCK" ? "Low Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <ActionGroup>
                        <EditAction
                          onClick={() => openEditModal(product)}
                          title="Edit Product"
                        />
                        <DeleteAction
                          onClick={() => handleDeleteClick(product.id)}
                          title="Delete Product"
                        />
                      </ActionGroup>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedProducts.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-400 text-xs">
                      {searchQuery ? "No matching products found." : "No products found."}
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
            totalItems={filteredProducts.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[650px] p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          {modalMode === "create" ? "Add Product" : "Edit Product"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. iPhone 13 (Refurbished - 128GB)"
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. IPH13-REF-128"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="basePrice">Base / MRP Price (₹) *</Label>
              <Input
                id="basePrice"
                type="number"
                min={0}
                step="1"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="e.g. 42000"
                required
              />
            </div>
            <div>
              <Label htmlFor="salePrice">Sale / Selling Price (₹)</Label>
              <Input
                id="salePrice"
                type="number"
                min={0}
                step="1"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Optional special offer price"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId("");
                }}
                required
                className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="" disabled>Select Category</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="subCategoryId">Sub-Category</Label>
              <select
                id="subCategoryId"
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">None</option>
                {filteredSubCategories.map((sc) => (
                  <option key={sc.value} value={sc.value}>{sc.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="brandId">Brand</Label>
              <select
                id="brandId"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">None</option>
                {brands.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="stockStatus">Stock Status</Label>
              <select
                id="stockStatus"
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
