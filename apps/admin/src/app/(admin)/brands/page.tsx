import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BrandTable from "@/components/tables/BrandTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Brands | Admin",
  description: "Manage Brands",
};

export default function BrandsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Brands Management" />
      <div className="space-y-6">
        <ComponentCard title="All Brands">
          <BrandTable />
        </ComponentCard>
      </div>
    </div>
  );
}
