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
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Pagination from "./Pagination";
import ComponentLoader from "../common/ComponentLoader";
import { TrashBinIcon, PencilIcon, EyeIcon } from "@/icons";

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/users");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Failed to fetch users", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setSelectedUser(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("USER");
    setIsActive(true);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setPassword("");
    setRole(user.role);
    setIsActive(user.isActive);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        await api.post("/users", {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          password: password.trim() || undefined,
          role,
          isActive,
        });
      } else if (modalMode === "edit" && selectedUser) {
        const payload: any = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          isActive,
        };
        if (password.trim()) {
          payload.password = password.trim();
        }
        await api.patch(`/users/${selectedUser.id}`, payload);
      }
      await fetchUsers();
      closeModal();
    } catch (err: any) {
      console.error(`Failed to ${modalMode} user`, err);
      alert(err?.response?.data?.message || `Failed to ${modalMode} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      await fetchUsers();
    } catch (err: any) {
      console.error("Failed to delete user", err);
      alert(err?.response?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleActive = async (user: User) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      await fetchUsers();
    } catch (err: any) {
      console.error(`Failed to ${action} user`, err);
      alert(`Failed to ${action} user`);
    }
  };

  // Filter out SUPER_ADMIN role users and apply search query
  const filteredUsers = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    return safeUsers
      .filter((u) => u.role !== "SUPER_ADMIN")
      .filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
        return (
          fullName.includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q)) ||
          u.role.toLowerCase().includes(q)
        );
      });
  }, [users, searchQuery]);

  // Paginated slice
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  if (loading && users.length === 0) {
    return <ComponentLoader text="Loading user directory..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header Bar with Search & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search users by name, email, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>
        <Button onClick={openCreateModal}>
          + Add User
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchUsers} className="font-semibold text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">#</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">User</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Phone</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Role</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Verified</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs">Joined</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedUsers.map((user, index) => {
                  const displayName = user.firstName
                    ? `${user.firstName} ${user.lastName || ""}`.trim()
                    : "Registered Customer";
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                      <TableCell className="px-5 py-3.5 text-start text-theme-xs text-gray-400">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-start text-theme-sm">
                        <span className="block font-semibold text-gray-900 dark:text-white">
                          {displayName}
                        </span>
                        <span className="block text-xs text-gray-400">
                          {user.email || "No email"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                        {user.phone || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-start text-theme-sm">
                        <Badge
                          size="sm"
                          color={
                            user.role === "ADMIN"
                              ? "primary"
                              : "light"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-start text-theme-sm">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          className="cursor-pointer"
                          title="Click to toggle status"
                        >
                          <Badge
                            size="sm"
                            color={user.isActive ? "success" : "error"}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-gray-500 text-theme-sm">
                        <div className="flex gap-1.5">
                          {user.isEmailVerified && (
                            <Badge size="sm" color="success">Email ✓</Badge>
                          )}
                          {user.isPhoneVerified && (
                            <Badge size="sm" color="success">Phone ✓</Badge>
                          )}
                          {!user.isEmailVerified && !user.isPhoneVerified && (
                            <span className="text-xs text-gray-400">Unverified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-gray-400 text-xs text-start">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-end text-theme-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openViewModal(user)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                            title="Edit User"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-error-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                            title="Delete User"
                          >
                            <TrashBinIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedUsers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-400 text-xs">
                      {searchQuery ? "No matching users found." : "No users registered yet."}
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
            totalItems={filteredUsers.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Add / Edit / View Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[500px] p-6">
        {modalMode === "create" || modalMode === "edit" ? (
          <>
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              {modalMode === "create" ? "Add New User" : "Edit User Profile"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="e.g. Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="e.g. Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="password">
                  {modalMode === "create" ? "Password" : "New Password (leave empty to keep current)"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={modalMode === "create"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="USER">Customer (User)</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                    <option value="TECHNICIAN">Technician / Staff</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="isActive">Account Status</Label>
                  <select
                    id="isActive"
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="h-11 w-full rounded-xl border border-gray-300 px-3.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                <Button variant="outline" onClick={closeModal} type="button">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : modalMode === "create" ? "Create User" : "Save Changes"}
                </Button>
              </div>
            </form>
          </>
        ) : selectedUser ? (
          <>
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              User Details
            </h3>
            <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">User ID</span>
                <span className="font-mono text-gray-900 dark:text-white">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Full Name</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedUser.firstName
                    ? `${selectedUser.firstName} ${selectedUser.lastName || ""}`
                    : "Not provided"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Email</span>
                <span className="text-gray-900 dark:text-white">{selectedUser.email || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Phone</span>
                <span className="text-gray-900 dark:text-white">{selectedUser.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Role</span>
                <Badge size="sm" color={selectedUser.role === "ADMIN" ? "primary" : "light"}>
                  {selectedUser.role}
                </Badge>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Status</span>
                <Badge size="sm" color={selectedUser.isActive ? "success" : "error"}>
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold text-gray-500">Member Since</span>
                <span>
                  {new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-6">
              <Button onClick={closeModal} type="button">
                Close
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
