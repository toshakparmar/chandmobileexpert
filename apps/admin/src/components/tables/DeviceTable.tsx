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
import Select from "../form/Select";
import { PencilIcon, TrashBinIcon } from "@/icons";

interface Device {
  id: string;
  name: string;
  brandId: string;
  brand?: { name: string };
  createdAt: string;
}

export default function DeviceTable() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [brands, setBrands] = useState<{value: string, label: string}[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [devicesRes, brandsRes] = await Promise.all([
        api.get("/devices"),
        api.get("/brands")
      ]);
      setDevices(Array.isArray(devicesRes.data) ? devicesRes.data : []);
      setBrands(Array.isArray(brandsRes.data) ? brandsRes.data.map((b: any) => ({ value: b.id.toString(), label: b.name })) : []);
    } catch (error) {
      console.error("Failed to fetch data", error);
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
    setBrandId("");
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
    setName("");
    setBrandId("");
    setSelectedDevice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brandId) {
      alert("Name and Brand are required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        await api.post("/devices", { name, brandId });
      } else if (modalMode === "edit" && selectedDevice) {
        await api.patch(`/devices/${selectedDevice.id}`, { name, brandId });
      }
      await fetchDevices();
      closeModal();
    } catch (error) {
      console.error(`Failed to ${modalMode} device`, error);
      alert(`Failed to ${modalMode} device`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    try {
      await api.delete(`/devices/${id}`);
      await fetchDevices();
    } catch (error) {
      console.error("Failed to delete device", error);
      alert("Failed to delete device");
    }
  };

  if (loading && devices.length === 0) return <div className="p-5">Loading devices...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateModal}>
          + Add Device
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Brand</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Created At</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {Array.isArray(devices) && devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {device.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {device.brand?.name || `ID: ${device.brandId}`}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(device.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(device)}
                          className="text-brand-500 hover:text-brand-600 font-medium"
                         title="Edit"><PencilIcon className="w-5 h-5" /></button>
                        <button
                          onClick={() => handleDelete(device.id)}
                          className="text-error-500 hover:text-error-600 font-medium"
                         title="Delete"><TrashBinIcon className="w-5 h-5" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {devices.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-4 text-center text-gray-500">
                      No devices found.
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
          {modalMode === "create" ? "Add Device" : "Edit Device"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. iPhone 15 Pro"
              required
            />
          </div>
          <div>
            <Label htmlFor="brandId">Brand</Label>
            {/* The Select component doesn't update if defaultValue changes dynamically unless keyed, so we use a key or just pass standard select if it's simpler, wait `Select` handles internal state differently.
                Wait! Select component has a bug where it doesn't sync with props if we change `defaultValue`.
                I will use a standard HTML select to avoid issues with the custom Select component's internal state. */}
            <select
              id="brandId"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
              className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="" disabled>Select a brand</option>
              {brands.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
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
