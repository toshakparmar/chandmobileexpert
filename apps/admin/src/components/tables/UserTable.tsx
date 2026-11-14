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
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { TrashBinIcon, PencilIcon, EyeIcon } from "@/icons";

// Assuming we need some icons for activate/deactivate, we can use SVG here or another standard icon.
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BanIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "view">("edit");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setRole(user.role);
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
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await api.patch(`/users/${selectedUser.id}`, { role });
      await fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Failed to update user role", error);
      alert("Failed to update user role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    }
  };

  const handleToggleActive = async (user: User) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      await fetchUsers();
    } catch (error) {
      console.error(`Failed to ${action} user`, error);
      alert(`Failed to ${action} user`);
    }
  };

  if (loading && users.length === 0) return <div className="p-5">Loading users...</div>;

  // Filter out SUPER_ADMIN role users
  const filteredUsers = users.filter((u) => u.role !== "SUPER_ADMIN");

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Phone</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Role</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Verified</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Joined</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.phone || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          user.role === "SUPER_ADMIN"
                            ? "error"
                            : user.role === "ADMIN"
                            ? "warning"
                            : "success"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={user.isActive ? "success" : "error"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        {user.isEmailVerified && (
                          <Badge size="sm" color="success">Email ✓</Badge>
                        )}
                        {user.isPhoneVerified && (
                          <Badge size="sm" color="success">Phone ✓</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openViewModal(user)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                          title="View Details"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`${user.isActive ? "text-error-500 hover:text-error-600" : "text-success-500 hover:text-success-600"} font-medium`}
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          {user.isActive ? <BanIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-brand-500 hover:text-brand-600 font-medium"
                          title="Update Role"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-error-500 hover:text-error-600 font-medium"
                          title="Delete"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="px-5 py-4 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[400px] p-6">
        {modalMode === "edit" ? (
          <>
            <h3 className="mb-5 text-lg font-bold text-gray-800 dark:text-white/90">
              Update User Role
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={closeModal} type="button">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : "Update"}
                </Button>
              </div>
            </form>
          </>
        ) : selectedUser ? (
          <>
            <h3 className="mb-5 text-lg font-bold text-gray-800 dark:text-white/90">
              User Details
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold">ID</span>
                <span className="font-mono text-xs">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold">Email</span>
                <span>{selectedUser.email || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold">Phone</span>
                <span>{selectedUser.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold">Role</span>
                <span>{selectedUser.role}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold">Status</span>
                <span>{selectedUser.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <span className="font-semibold">Joined</span>
                <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
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
