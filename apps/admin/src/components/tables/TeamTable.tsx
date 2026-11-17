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
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { PencilIcon, TrashBinIcon } from "@/icons";
import Pagination from "./Pagination";
import ComponentLoader from "../common/ComponentLoader";

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

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [image, setImage] = useState("");
  const [bio, setBio] = useState("");
  const [isActive, setIsActive] = useState(true);
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
    setImage("");
    setBio("");
    setIsActive(true);
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setName(member.name);
    setRole(member.role);
    setImage(member.image || "");
    setBio(member.bio || "");
    setIsActive(member.isActive);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setName("");
    setRole("");
    setImage("");
    setBio("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert("Name and role are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        role: role.trim(),
        image: image.trim() || null,
        bio: bio.trim() || null,
        isActive,
      };

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
    try {
      await api.patch(`/teams/${member.id}`, { isActive: !member.isActive });
      await fetchMembers();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  if (loading && members.length === 0) {
    return <ComponentLoader text="Loading team members..." />;
  }

  return (
    <div className="space-y-4">
      {/* Top Search & Add Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search by name, role, specialization..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>

        <Button onClick={openCreateModal} className="shrink-0 self-end sm:self-auto">
          + Add Team Member
        </Button>
      </div>

      {/* Team Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Member
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Role & Specialization
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Bio
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider">
                  Joined
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-end text-xs uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="block font-semibold text-gray-900 text-xs dark:text-white">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          #{member.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                      {member.role}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <p className="text-xs text-gray-500 max-w-xs truncate" title={member.bio || ""}>
                      {member.bio || "—"}
                    </p>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={member.isActive ? "success" : "error"}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start text-xs text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-end">
                    <div className="flex justify-end items-center gap-1.5">
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          member.isActive
                            ? "text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                            : "text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        }`}
                        title={member.isActive ? "Deactivate" : "Activate"}
                      >
                        {member.isActive ? <BanIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit Member"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                        title="Delete Member"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                    {searchQuery ? "No team members match your search criteria." : "No team members registered yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredMembers.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* CREATE / EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-lg p-6">
        <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
          {modalMode === "create" ? "Add Team Member" : "Edit Team Member"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="memberName">Full Name *</Label>
            <Input
              id="memberName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div>
            <Label htmlFor="memberRole">Role / Title *</Label>
            <Input
              id="memberRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Hardware & Chipset Technician"
              required
            />
          </div>

          <div>
            <Label htmlFor="memberImage">Avatar Image URL (optional)</Label>
            <Input
              id="memberImage"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="memberBio">Bio / Specialization</Label>
            <textarea
              id="memberBio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              placeholder="Specialist in micro-soldering, Apple motherboard diagnostics..."
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="teamActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <Label htmlFor="teamActive" className="mb-0 text-xs font-semibold cursor-pointer">
              Active (Visible on public About/Team sections)
            </Label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : modalMode === "create" ? "Add Member" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
