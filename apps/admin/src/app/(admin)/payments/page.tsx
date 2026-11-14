import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentTable from "@/components/tables/PaymentTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "UPI Payments | Admin Panel",
  description: "Verify and manage direct UPI QR customer payments",
};

export default function PaymentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="UPI Payments & Verification Queue" />
      <div className="space-y-6">
        <ComponentCard title="Direct UPI Transactions">
          <PaymentTable />
        </ComponentCard>
      </div>
    </div>
  );
}

