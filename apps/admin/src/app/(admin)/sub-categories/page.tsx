import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SubCategoryTable from "@/components/tables/SubCategoryTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Sub-Categories | Admin",
  description: "Manage Sub-Categories",
};

export default function SubCategoriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Sub-Categories Management" />
      <div className="space-y-6">
        <ComponentCard title="All Sub-Categories">
          <SubCategoryTable />
        </ComponentCard>
      </div>
    </div>
  );
}
