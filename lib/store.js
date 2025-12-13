import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

export const useStore = create((set) => ({
  token: null,
  user: null,
  sidebarOpen: true,
  mobileSidebarOpen: false,
  darkMode: false,

  login: (token) => {
  let decoded = {};

  try {
    decoded = jwtDecode(token);
  } catch {
    decoded = { email: "admin@test.com", role: "admin" }; // fallback
  }

  set({ token, user: decoded });
  localStorage.setItem("token", token);
},


  logout: () => {
    set({ token: null, user: null });
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  toggleTheme: () =>
    set((state) => ({ darkMode: !state.darkMode }))
}));
