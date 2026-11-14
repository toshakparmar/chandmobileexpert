import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductTable from "@/components/tables/ProductTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Products | Admin",
  description: "Manage Products",
};

export default function ProductsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Products Management" />
      <div className="space-y-6">
        <ComponentCard title="All Products">
          <ProductTable />
        </ComponentCard>
      </div>
    </div>
  );
}
