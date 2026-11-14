import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTable from "@/components/tables/UserTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Users Management | Admin",
  description: "Users Management page",
};

export default function UsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Users Management" />
      <div className="space-y-6">
        <ComponentCard title="All Users">
          <UserTable />
        </ComponentCard>
      </div>
    </div>
  );
}
