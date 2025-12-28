import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  hydrated: false,

  login: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user, hydrated: true });
  },

  loadUser: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        hydrated: true,
      });
    } else {
      set({
        token: null,
        user: null,
        hydrated: true,
      });
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, token: null, hydrated: true });
    window.location.href = "/login";
  },
}));
