import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TestimonialTable from "@/components/tables/TestimonialTable";

export const metadata = {
  title: "Testimonials | Chand Mobile Expert Admin",
};

export default function TestimonialsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Testimonials" />
      <TestimonialTable />
    </div>
  );
}
