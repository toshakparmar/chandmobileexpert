import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TeamTable from "@/components/tables/TeamTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Team Management | Admin",
  description: "Team Management page",
};

export default function TeamPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Team Management" />
      <div className="space-y-6">
        <ComponentCard title="Team Members">
          <TeamTable />
        </ComponentCard>
      </div>
    </div>
  );
}
