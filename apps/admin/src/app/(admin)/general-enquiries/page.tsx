import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import GeneralEnquiryTable from "@/components/tables/GeneralEnquiryTable";

export const metadata = {
  title: "General Enquiries | Chand Mobile Expert Admin",
};

export default function GeneralEnquiriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="General Enquiries" />
      <GeneralEnquiryTable />
    </div>
  );
}
