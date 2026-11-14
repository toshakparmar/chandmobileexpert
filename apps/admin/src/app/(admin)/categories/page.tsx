import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CategoryTable from "@/components/tables/CategoryTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Categories | Admin",
  description: "Manage Categories",
};

export default function CategoriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Categories Management" />
      <div className="space-y-6">
        <ComponentCard title="All Categories">
          <CategoryTable />
        </ComponentCard>
      </div>
    </div>
  );
}
