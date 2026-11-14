import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RepairQueryTable from "@/components/tables/RepairQueryTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Repair Queries | Admin",
  description: "Manage Repair Queries",
};

export default function RepairQueriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Repair Queries Management" />
      <div className="space-y-6">
        <ComponentCard title="All Repair Queries">
          <RepairQueryTable />
        </ComponentCard>
      </div>
    </div>
  );
}
