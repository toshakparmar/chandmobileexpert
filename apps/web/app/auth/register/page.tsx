"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login?mode=signup");
  }, [router]);

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
