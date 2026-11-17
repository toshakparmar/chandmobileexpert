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

interface Device {
  id: string;
  name: string;
  brandId: string;
  brand?: { name: string };
  createdAt: string;
}

export default function DeviceTable() {
  const [devices, setDevices] = useState<Device[]>([]);
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
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const [devicesRes, brandsRes] = await Promise.all([
        api.get("/devices"),
        api.get("/brands")
      ]);
      setDevices(Array.isArray(devicesRes.data) ? devicesRes.data : []);
      setBrands(
        Array.isArray(brandsRes.data)
          ? brandsRes.data.map((b: any) => ({ value: b.id.toString(), label: b.name }))
          : []
      );
    } catch (err: any) {
      console.error("Failed to fetch devices", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch devices");
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setName("");
    setBrandId(brands.length > 0 ? brands[0].value : "");
    setSelectedDevice(null);
    setIsModalOpen(true);
  };

  const openEditModal = (device: Device) => {
    setModalMode("edit");
    setName(device.name);
    setBrandId(device.brandId.toString());
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brandId) return;

    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        await api.post("/devices", { name, brandId });
      } else if (modalMode === "edit" && selectedDevice) {
        await api.patch(`/devices/${selectedDevice.id}`, { name, brandId });
      }
      await fetchDevices();
      closeModal();
    } catch (err: any) {
      console.error(`Failed to ${modalMode} device`, err);
      alert(err?.response?.data?.message || `Failed to ${modalMode} device`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    try {
      await api.delete(`/devices/${id}`);
      await fetchDevices();
    } catch (err: any) {
      console.error("Failed to delete device", err);
      alert(err?.response?.data?.message || "Failed to delete device");
    }
  };

  const filteredDevices = useMemo(() => {
    const safeDevices = Array.isArray(devices) ? devices : [];
    if (!searchQuery.trim()) return safeDevices;
    const q = searchQuery.toLowerCase();
    return safeDevices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.brand?.name && d.brand.name.toLowerCase().includes(q))
    );
  }, [devices, searchQuery]);

  const totalPages = Math.ceil(filteredDevices.length / pageSize) || 1;
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDevices.slice(start, start + pageSize);
  }, [filteredDevices, currentPage, pageSize]);

  if (loading && devices.length === 0) {
    return <ComponentLoader text="Loading supported devices..." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDevices} className="font-semibold text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search devices (iPhone 15, Galaxy S24, etc.)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>
        <Button onClick={openCreateModal}>
          + Add Device
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Device Model</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Brand</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Created At</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedDevices.map((device) => (
                  <TableRow key={device.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                    <TableCell className="px-5 py-3.5 text-start">
                      <span className="block font-semibold text-gray-900 text-theme-sm dark:text-white">
                        {device.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {device.brand?.name || `Brand #${device.brandId}`}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-gray-400 text-start text-xs">
                      {new Date(device.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <ActionGroup>
                        <EditAction
                          onClick={() => openEditModal(device)}
                          title="Edit Device"
                        />
                        <DeleteAction
                          onClick={() => handleDelete(device.id)}
                          title="Delete Device"
                        />
                      </ActionGroup>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedDevices.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 text-xs">
                      {searchQuery ? "No matching devices found." : "No devices found."}
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
            totalItems={filteredDevices.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[450px] p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          {modalMode === "create" ? "Add Supported Device" : "Edit Device"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="deviceName">Device Model Name *</Label>
            <Input
              id="deviceName"
              type="text"
              placeholder="e.g. iPhone 15 Pro Max, Galaxy S24 Ultra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="deviceBrand">Brand *</Label>
            <select
              id="deviceBrand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Device" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
