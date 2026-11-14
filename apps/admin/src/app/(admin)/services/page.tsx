import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ServiceTable from "@/components/tables/ServiceTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Services | Admin",
  description: "Manage Services",
};

export default function ServicesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Services Management" />
      <div className="space-y-6">
        <ComponentCard title="All Services">
          <ServiceTable />
        </ComponentCard>
      </div>
    </div>
  );
}
