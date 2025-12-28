"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/lib/authStore";
import { usePermissionStore } from "@/lib/permissionStore";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const loadUser = useAuthStore((s) => s.loadUser);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  /* ----------------------------------------
     LOAD USER ONCE (CLIENT ONLY)
  ---------------------------------------- */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* ----------------------------------------
     AUTH GUARD (AFTER HYDRATION)
  ---------------------------------------- */
  useEffect(() => {
    if (!hydrated) return;

    if (!token && pathname !== "/login") {
      router.replace("/login");
    }
  }, [hydrated, token, pathname, router]);

  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Toaster />

        {/* Wait for auth hydration */}
        {!hydrated ? (
          <div className="flex items-center justify-center h-screen text-lg">
            Loading...
          </div>
        ) : (
          <>
            <PermissionLoader />
            {pathname !== "/login" && <Header />}
            <main className="p-6">{children}</main>
          </>
        )}
      </body>
    </html>
  );
}

/* ----------------------------------------
   LOAD PERMISSIONS AFTER AUTH READY
---------------------------------------- */
function PermissionLoader() {
  const loadPermissions = usePermissionStore((s) => s.loadPermissions);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && token) {
      loadPermissions();
    }
  }, [hydrated, token, loadPermissions]);

  return null;
}
