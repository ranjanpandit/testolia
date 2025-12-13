"use client";

import "./globals.css";
import { useStore } from "@/lib/store";
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  User,
  LayoutDashboard,
  FileText,
} from "lucide-react";
import { Toaster } from "sonner";
import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const {
    token,
    sidebarOpen,
    mobileSidebarOpen,
    toggleSidebar,
    toggleMobileSidebar,
    logout,
    darkMode,
    toggleTheme,
  } = useStore();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, []);

  const menuItems = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Forms", href: "/forms", icon: <FileText size={18} /> },
  ];
 const pathname = usePathname();
  return (
    <html lang="en" className={darkMode ? "dark" : ""}>
      <body className="flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition">
        <Toaster />

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={toggleMobileSidebar}
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
          ></div>
        )}

        {/* Sidebar */}
        {token && window.location.pathname !== "/login" && (
          <aside
            className={`${
              sidebarOpen ? "w-64" : "w-20"
            } fixed md:static z-30 bg-white dark:bg-gray-800 shadow h-screen p-4 transition-all`}
          >
            {/* Toggle buttons */}
            <button onClick={toggleSidebar} className="mb-6 hidden md:block">
              <Menu />
            </button>

            <button onClick={toggleMobileSidebar} className="mb-6 md:hidden">
              <Menu />
            </button>

            {/* Menu Items */}
            <nav className="space-y-3">
              {menuItems.map((item) => {
                const active = window.location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
                      active ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""
                    }`}
                  >
                    {item.icon}
                    {sidebarOpen && item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 ml-20 md:ml-0">
          {pathname !== "/login" && <Header />}
          {/* Page content */}
          {children}
        </main>
      </body>
    </html>
  );
}
