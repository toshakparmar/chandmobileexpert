import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrderTable from "@/components/tables/OrderTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Orders | Admin",
  description: "Manage Orders",
};

export default function OrdersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Orders Management" />
      <div className="space-y-6">
        <ComponentCard title="All Orders">
          <OrderTable />
        </ComponentCard>
      </div>
    </div>
  );
}
