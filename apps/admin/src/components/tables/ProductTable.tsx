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
import { ConfirmModal } from "../ui/modal/ConfirmModal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { PencilIcon, TrashBinIcon } from "@/icons";

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
  const [categories, setCategories] = useState<{value: string, label: string}[]>([]);
  const [subCategories, setSubCategories] = useState<{value: string, label: string, categoryId: string}[]>([]);
  const [brands, setBrands] = useState<{value: string, label: string}[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [prodRes, catRes, subCatRes, brandRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
        api.get("/sub-categories"),
        api.get("/brands"),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data.map((c: any) => ({ value: c.id.toString(), label: c.name })));
      setSubCategories(subCatRes.data.map((sc: any) => ({ value: sc.id.toString(), label: sc.name, categoryId: sc.categoryId.toString() })));
      setBrands(brandRes.data.map((b: any) => ({ value: b.id.toString(), label: b.name })));
    } catch (error) {
      console.error("Failed to fetch data", error);
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
    setCategoryId("");
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
    if (!name.trim() || !sku.trim() || !basePrice || !categoryId) return;

    try {
      setIsSubmitting(true);
      const payload = { 
        name, 
        sku, 
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stockStatus,
        categoryId: parseInt(categoryId),
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
        brandId: brandId ? parseInt(brandId) : null,
      };
      
      if (modalMode === "create") {
        await api.post("/products", payload);
      } else if (modalMode === "edit" && selectedProduct) {
        await api.patch(`/products/${selectedProduct.id}`, payload);
      }
      await fetchData();
      closeModal();
    } catch (error: any) {
      console.error(`Failed to ${modalMode} product`, error);
      alert(`Error: ${error?.response?.data?.message || `Failed to ${modalMode} product`}`);
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
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter sub-categories based on selected category
  const filteredSubCategories = subCategories.filter(sc => sc.categoryId === categoryId);

  if (loading && products.length === 0) return <div className="p-5">Loading products...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateModal}>
          + Add Product
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">SKU</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Category</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Brand</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Price</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Stock</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {product.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {product.sku}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {product.category?.name || `ID: ${product.categoryId}`}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {product.brand?.name || (product.brandId ? `ID: ${product.brandId}` : "None")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      ₹{product.salePrice || product.basePrice}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                        {product.stockStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-brand-500 hover:text-brand-600 font-medium"
                         title="Edit"><PencilIcon className="w-5 h-5" /></button>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="text-error-500 hover:text-error-600 font-medium"
                         title="Delete"><TrashBinIcon className="w-5 h-5" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-5 py-4 text-center text-gray-500">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[700px] p-6">
        <h3 className="mb-5 text-lg font-bold text-gray-800 dark:text-white/90">
          {modalMode === "create" ? "Add Product" : "Edit Product"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. iPhone 13 Screen"
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
                placeholder="e.g. IPH13-SCR-01"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price (₹) *</Label>
              <Input
                id="basePrice"
                type="number"
                min={0}
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="e.g. 1999"
                required
              />
            </div>
            <div>
              <Label htmlFor="salePrice">Sale Price (₹)</Label>
              <Input
                id="salePrice"
                type="number"
                min={0}
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Optional discounted price"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId(""); // Reset sub-category when category changes
                }}
                required
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="" disabled>Select Category</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="subCategoryId">Sub Category</Label>
              <select
                id="subCategoryId"
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">None</option>
                {filteredSubCategories.map((sc) => (
                  <option key={sc.value} value={sc.value}>{sc.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brandId">Brand</Label>
              <select
                id="brandId"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="IN_STOCK">In Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
              </select>
            </div>
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
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
