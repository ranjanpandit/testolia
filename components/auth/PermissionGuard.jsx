"use client";

import { usePermissionStore } from "@/lib/permissionStore";
import { useAuthStore } from "@/lib/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}) {
  const router = useRouter();

  const has = usePermissionStore((s) => s.has);
  const loaded = usePermissionStore((s) => s.loaded);
  const token = useAuthStore((s) => s.token);

  /* ----------------------------------------
     REDIRECT IF NO PERMISSION
  ---------------------------------------- */
  useEffect(() => {
    if (!loaded) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (permission && !has(permission)) {
      router.replace("/403");
    }
  }, [loaded, token, permission]);

  /* ----------------------------------------
     WAIT FOR PERMISSIONS
  ---------------------------------------- */
  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        Checking permissions...
      </div>
    );
  }

  /* ----------------------------------------
     BLOCK RENDER
  ---------------------------------------- */
  if (permission && !has(permission)) {
    return fallback;
  }

  return <>{children}</>;
}
