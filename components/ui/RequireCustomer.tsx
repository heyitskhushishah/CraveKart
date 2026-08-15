"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAdminUser } from "@/lib/auth";

export function RequireCustomer({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (isAdminUser()) router.replace("/admin");
  }, [router]);

  return <>{children}</>;
}
