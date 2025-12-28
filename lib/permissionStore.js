import { create } from "zustand";
import { useAuthStore } from "./authStore";

export const usePermissionStore = create((set, get) => ({
  permissions: [],
  loaded: false,

  loadPermissions: async () => {
    if (get().loaded) return;

    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const res = await fetch("/api/admin/me/permissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Permission fetch failed");

      const data = await res.json();
      set({
        permissions: data.permissions || [],
        loaded: true,
      });
    } catch (err) {
      console.error(err);
      set({ permissions: [], loaded: true });
    }
  },

  has: (key) => get().permissions.includes(key),
}));
