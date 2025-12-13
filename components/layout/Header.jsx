"use client";

import { Search, Bell, Moon, Sun, User, LogOut, Menu } from "lucide-react";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const { darkMode, toggleTheme, logout, toggleMobileSidebar } = useStore();
  const [openProfile, setOpenProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const pathname = usePathname();

  const menuLinks = [
    { name: "Dashboard", href: "/" },

    {
      name: "Form Manager",
      children: [
        { name: "Forms Submission", href: "/form-responses" },
        { name: "Forms List", href: "/forms" },
        { name: "Create Form", href: "/form-builder" },
        
      ],
    },
    {
      name: "Students",
      children: [
        { name: "Student Management", href: "/students" },
        { name: "Class Management", href: "/classes" },
        { name: "Batch Management", href: "/batches" },
        
      ],
    },
    {
      name: "Fee Manager",
      children: [
        { name: "Fee Structures", href: "/fees/structures" },
        
      ],
    },
    { name: "Examination", href: "/exams" },
    { name: "Registration", href: "/registration" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b p-3 flex justify-between items-center shadow-sm transition">
      {/* MOBILE MENU */}
      <div className="md:hidden">
        <button
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu />
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-gray-800 shadow-lg rounded-md border p-2 z-30">
            {menuLinks.map((link, idx) => (
              <div key={idx}>
                {!link.children ? (
                  <Link
                    href={link.href}
                    className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <div>
                    <p className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-300">
                      {link.name}
                    </p>

                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block pl-6 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={toggleMobileSidebar} className="md:hidden px-2">
        <Menu />
      </button>

      {/* Navigation Menu */}
      <nav className="hidden md:flex gap-6 text-sm font-medium relative">
        {menuLinks.map((link, index) => {
          const isActive = pathname === link.href;

          // If menu has sub-items
          if (link.children) {
            return (
              <div key={index} className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === index ? null : index)}
                  className={`hover:text-blue-600 transition flex items-center gap-1 ${
                    link.children.some((c) => c.href === pathname)
                      ? "text-blue-600 font-semibold underline underline-offset-4"
                      : ""
                  }`}
                >
                  {link.name} ▾
                </button>

                {openMenu === index && (
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border p-2 z-20">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpenMenu(null)} // <-- AUTO CLOSE
                        className={`block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          pathname === child.href
                            ? "font-bold text-blue-600"
                            : ""
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Regular Menu Item
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-blue-600 transition ${
                isActive
                  ? "text-blue-600 font-semibold underline underline-offset-4"
                  : ""
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 px-3 rounded-lg w-80">
        <Search size={18} className="opacity-60" />
        <Input
          type="text"
          placeholder="Search..."
          className="border-0 shadow-none bg-transparent focus-visible:ring-0"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <button className="relative hover:text-blue-500 transition">
          <Bell size={20} />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="hover:text-blue-500 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User size={18} />
            </div>
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-3 w-40 bg-white dark:bg-gray-700 shadow-md rounded-lg border p-2">
              <Link
                href="/profile"
                className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
              >
                Settings
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
