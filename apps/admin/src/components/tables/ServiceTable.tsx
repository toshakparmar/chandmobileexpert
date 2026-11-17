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

interface Service {
  id: string;
  name: string;
  basePrice: number;
  createdAt: string;
}

export default function ServiceTable() {
  const [services, setServices] = useState<Service[]>([]);
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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/services");
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Failed to fetch services", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setName("");
    setBasePrice("");
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setModalMode("edit");
    setName(service.name);
    setBasePrice(service.basePrice.toString());
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setBasePrice("");
    setSelectedService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !basePrice) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        basePrice: parseFloat(basePrice),
      };

      if (modalMode === "create") {
        await api.post("/services", payload);
      } else if (modalMode === "edit" && selectedService) {
        await api.patch(`/services/${selectedService.id}`, payload);
      }
      await fetchServices();
      closeModal();
    } catch (err: any) {
      console.error(`Failed to ${modalMode} service`, err);
      alert(err?.response?.data?.message || `Failed to ${modalMode} service`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this repair service?")) return;
    try {
      await api.delete(`/services/${id}`);
      await fetchServices();
    } catch (err: any) {
      console.error("Failed to delete service", err);
      alert(err?.response?.data?.message || "Failed to delete service");
    }
  };

  const filteredServices = useMemo(() => {
    const safeServices = Array.isArray(services) ? services : [];
    if (!searchQuery.trim()) return safeServices;
    const q = searchQuery.toLowerCase();
    return safeServices.filter((s) => s.name.toLowerCase().includes(q));
  }, [services, searchQuery]);

  const totalPages = Math.ceil(filteredServices.length / pageSize) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  if (loading && services.length === 0) {
    return <ComponentLoader text="Loading repair services..." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchServices} className="font-semibold text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search services (Screen replacement, Battery, etc.)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>
        <Button onClick={openCreateModal}>
          + Add Service
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Service Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Starting Price</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Created At</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedServices.map((service) => (
                  <TableRow key={service.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                    <TableCell className="px-5 py-3.5 text-start">
                      <span className="block font-semibold text-gray-900 text-theme-sm dark:text-white">
                        {service.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 font-bold text-gray-900 text-start text-theme-sm dark:text-white">
                      ₹{Number(service.basePrice || 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-400 text-start text-xs">
                      {new Date(service.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <ActionGroup>
                        <EditAction
                          onClick={() => openEditModal(service)}
                          title="Edit Service"
                        />
                        <DeleteAction
                          onClick={() => handleDelete(service.id)}
                          title="Delete Service"
                        />
                      </ActionGroup>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedServices.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 text-xs">
                      {searchQuery ? "No matching repair services found." : "No services found."}
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
            totalItems={filteredServices.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[450px] p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          {modalMode === "create" ? "Add Repair Service" : "Edit Service"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              type="text"
              placeholder="e.g. Glass & Display Replacement"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="basePrice">Starting Base Price (₹) *</Label>
            <Input
              id="basePrice"
              type="number"
              min={0}
              step="1"
              placeholder="e.g. 1499"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Service" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
