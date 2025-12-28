import { create } from "zustand";

export const useStore = create((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
    window.location.href = "/login";
  },
}));
