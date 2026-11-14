import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DeviceTable from "@/components/tables/DeviceTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Devices | Admin",
  description: "Manage Devices",
};

export default function DevicesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Devices Management" />
      <div className="space-y-6">
        <ComponentCard title="All Devices">
          <DeviceTable />
        </ComponentCard>
      </div>
    </div>
  );
}
