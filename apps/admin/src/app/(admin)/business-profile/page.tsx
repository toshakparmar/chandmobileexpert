import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BusinessProfileForm from "@/components/tables/BusinessProfileForm";

export const metadata = {
  title: "Business Profile | Chand Mobile Expert Admin",
};

export default function BusinessProfilePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Business Profile" />
      <BusinessProfileForm />
    </div>
  );
}
