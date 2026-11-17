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
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { PencilIcon, TrashBinIcon } from "@/icons";

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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function TeamTable() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teams");
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch team members", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setName("");
    setRole("");
    setBio("");
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setName(member.name);
    setRole(member.role);
    setBio(member.bio || "");
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setName("");
    setRole("");
    setBio("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      alert("Name and role are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { name, role, bio: bio || null };
      if (modalMode === "create") {
        await api.post("/teams", payload);
      } else if (modalMode === "edit" && selectedMember) {
        await api.patch(`/teams/${selectedMember.id}`, payload);
      }
      await fetchMembers();
      closeModal();
    } catch (error) {
      console.error("Failed to save team member", error);
      alert("Failed to save team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;
    try {
      await api.delete(`/teams/${id}`);
      await fetchMembers();
    } catch (error) {
      console.error("Failed to delete team member", error);
      alert("Failed to delete team member");
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    const action = member.isActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this team member?`)) return;
    
    try {
      await api.patch(`/teams/${member.id}`, { isActive: !member.isActive });
      await fetchMembers();
    } catch (error) {
      console.error(`Failed to ${action} team member`, error);
      alert(`Failed to ${action} team member`);
    }
  };

  if (loading && members.length === 0) return <div className="p-5">Loading team members...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90"></h2>
        <Button onClick={openCreateModal}>
          + Add Team Member
        </Button>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Role</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Bio</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Joined</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {members.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {member.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="primary">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[200px] truncate">
                      {member.bio || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={member.isActive ? "success" : "error"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`${member.isActive ? "text-error-500 hover:text-error-600" : "text-success-500 hover:text-success-600"} font-medium`}
                          title={member.isActive ? "Deactivate" : "Activate"}
                        >
                          {member.isActive ? <BanIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-brand-500 hover:text-brand-600 font-medium"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-error-500 hover:text-error-600 font-medium"
                          title="Delete"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {members.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-5 py-4 text-center">
                      No team members found.
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
          {modalMode === "create" ? "Add Team Member" : "Edit Team Member"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Lead Technician"
              required
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short description..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
