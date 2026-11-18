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
import Button from "../ui/button/Button";
import Pagination from "./Pagination";
import ComponentLoader from "../common/ComponentLoader";

// Inline icons for self-contained robustness
const CheckCircle = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const XCircle = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const RefreshCw = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);
const Copy = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);
const Check = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const ShieldCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  status: "AWAITING_PAYMENT" | "AWAITING_VERIFICATION" | "PAID" | "REJECTED" | "EXPIRED" | "REFUNDED";
  payeeVpa: string;
  utr?: string | null;
  screenshotUrl?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    totalAmount: number;
    status: string;
    userName?: string;
    userPhone?: string;
    userEmail?: string;
    user?: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    };
  };
}

export default function PaymentTable() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Verify modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "ALL" ? "/payments" : `/payments?status=${statusFilter}`;
      const response = await api.get(url);
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch payments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openVerifyModal = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setVerifyNotes("Matched with bank account statement");
    setIsVerifyModalOpen(true);
  };

  const confirmVerify = async () => {
    if (!selectedPayment) return;
    try {
      setIsVerifying(true);
      await api.post(`/payments/${selectedPayment.id}/verify`, { notes: verifyNotes });
      await fetchPayments();
      setIsVerifyModalOpen(false);
      setSelectedPayment(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to verify payment");
    } finally {
      setIsVerifying(false);
    }
  };

  const openRejectModal = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setRejectReason("UTR not found on bank statement. Please verify and resubmit.");
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedPayment) return;
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    try {
      setIsRejecting(true);
      await api.post(`/payments/${selectedPayment.id}/reject`, { reason: rejectReason });
      await fetchPayments();
      setIsRejectModalOpen(false);
      setSelectedPayment(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to reject payment");
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadge = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "PAID":
        return <Badge color="success">PAID</Badge>;
      case "AWAITING_VERIFICATION":
        return <Badge color="warning">AWAITING VERIFICATION</Badge>;
      case "REJECTED":
        return <Badge color="error">REJECTED</Badge>;
      case "AWAITING_PAYMENT":
        return <Badge color="info">AWAITING PAYMENT</Badge>;
      case "REFUNDED":
        return <Badge color="dark">REFUNDED</Badge>;
      default:
        return <Badge color="dark">{status}</Badge>;
    }
  };

  const pendingCount = payments.filter((p) => p.status === "AWAITING_VERIFICATION").length;

  const filteredPayments = useMemo(() => {
    const safePayments = Array.isArray(payments) ? payments : [];
    if (!searchQuery.trim()) return safePayments;
    const q = searchQuery.toLowerCase();
    return safePayments.filter((p) => {
      const customerName = (
        p.order?.userName ||
        [p.order?.user?.firstName, p.order?.user?.lastName].filter(Boolean).join(" ") ||
        ""
      ).toLowerCase();
      const phone = (p.order?.userPhone || p.order?.user?.phone || "").toLowerCase();
      const utr = (p.utr || "").toLowerCase();
      const id = p.id.toLowerCase();
      const orderId = p.orderId.toLowerCase();
      return (
        customerName.includes(q) ||
        phone.includes(q) ||
        utr.includes(q) ||
        id.includes(q) ||
        orderId.includes(q)
      );
    });
  }, [payments, searchQuery]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  if (loading && payments.length === 0) {
    return <ComponentLoader text="Loading UPI payment records..." />;
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search by 12-digit UTR, Order ID, Customer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={() => fetchPayments()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {(["ALL", "AWAITING_VERIFICATION", "PAID", "REJECTED", "AWAITING_PAYMENT"] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => {
              setStatusFilter(st);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === st
                ? "bg-brand-500 text-white shadow-sm font-bold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <span>{st.replace(/_/g, " ")}</span>
            {st === "AWAITING_VERIFICATION" && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Verification Notice */}
      <div className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/40 flex items-center gap-2.5 text-xs text-gray-900 dark:text-gray-200">
        <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
        <span>
          <strong>Zero Payment Gateway Fee:</strong> Customer payments go directly to the shop UPI VPA. Cross-verify the customer&apos;s 12-digit UTR with your mobile banking app / SMS before clicking <strong>Verify</strong>.
        </span>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Payment / Order ID
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Customer
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Submitted 12-Digit UTR
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400 text-xs">
                  Loading UPI payment records...
                </TableCell>
              </TableRow>
            ) : paginatedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400 text-xs">
                  {searchQuery ? "No payment records match your search criteria." : "No payment records found matching filter."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedPayments.map((p) => {
                const customerName =
                  p.order?.userName ||
                  [p.order?.user?.firstName, p.order?.user?.lastName].filter(Boolean).join(" ") ||
                  "Guest Customer";
                const customerPhone = p.order?.userPhone || p.order?.user?.phone || "N/A";

                return (
                  <TableRow key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <TableCell className="px-4 py-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-gray-100 block">
                          #{p.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Order: #{p.orderId.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block">
                          {customerName}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono block">
                          {customerPhone}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <span className="text-xs font-bold font-mono text-gray-900 dark:text-gray-100">
                        ₹{Number(p.amount).toLocaleString("en-IN")}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      {p.utr ? (
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                            {p.utr}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.utr!, p.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="Copy UTR"
                          >
                            {copiedId === p.id ? (
                              <Check className="w-3.5 h-3.5 text-brand-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not submitted yet</span>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      {getStatusBadge(p.status)}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right">
                      {p.status === "AWAITING_VERIFICATION" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openVerifyModal(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectModal(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : p.status === "PAID" ? (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          ✓ Verified
                        </span>
                      ) : p.status === "REJECTED" ? (
                        <span className="text-[11px] font-semibold text-rose-500" title={p.rejectionReason || "Rejected"}>
                          ✗ Rejected
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPayments.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* VERIFY MODAL */}
      <Modal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} className="max-w-md p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Confirm Payment Verification</h3>
              <p className="text-xs text-gray-500">Order #{selectedPayment?.orderId?.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Received:</span>
              <span className="font-bold font-mono text-gray-900 dark:text-gray-100">
                ₹{Number(selectedPayment?.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer UTR:</span>
              <span className="font-bold font-mono text-gray-900 dark:text-gray-100">
                {selectedPayment?.utr}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payee VPA:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {selectedPayment?.payeeVpa}
              </span>
            </div>
          </div>

          <div>
            <Label>Internal Verification Notes (Optional)</Label>
            <input
              type="text"
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              placeholder="e.g. Verified on HDFC bank app"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200 dark:border-gray-800">
            <Button size="sm" variant="outline" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={confirmVerify} disabled={isVerifying} className="bg-emerald-600 text-white hover:bg-emerald-700">
              {isVerifying ? "Verifying..." : "Confirm & Mark as Paid"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* REJECT MODAL */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} className="max-w-md p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Reject Payment Submission</h3>
              <p className="text-xs text-gray-500">Order #{selectedPayment?.orderId?.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div>
            <Label>Rejection Reason for Customer <span className="text-rose-500">*</span></Label>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why payment could not be verified so customer can re-enter valid UTR"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-rose-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200 dark:border-gray-800">
            <Button size="sm" variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={confirmReject} disabled={isRejecting} className="bg-rose-600 text-white hover:bg-rose-700">
              {isRejecting ? "Rejecting..." : "Reject Payment"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
