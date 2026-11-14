import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FaqTable from "@/components/tables/FaqTable";

export const metadata = {
  title: "FAQs | Chand Mobile Expert Admin",
};

export default function FaqsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="FAQs" />
      <FaqTable />
    </div>
  );
}
