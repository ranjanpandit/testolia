"use client";

import { Search, Bell, Moon, Sun, User, LogOut, Menu } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePermissionStore } from "@/lib/permissionStore";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const { darkMode, toggleTheme, logout } = useStore();
  const { has, loaded } = usePermissionStore();

  const [openProfile, setOpenProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const pathname = usePathname();

  /* ----------------------------------------
     CLOSE ALL MENUS
  ---------------------------------------- */
  const closeMenus = () => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
    setOpenProfile(false);
  };

  /* ----------------------------------------
     CLOSE MENUS ON ROUTE CHANGE
  ---------------------------------------- */
  useEffect(() => {
    closeMenus();
  }, [pathname]);

  if (!loaded) return null; // ⛔ wait till permissions loaded

  /* ----------------------------------------
     MENU CONFIG
  ---------------------------------------- */
  const menuLinks = [
    { name: "Dashboard", href: "/", permission: "dashboard.view" },

    {
      name: "Form Manager",
      permission: "form.view",
      children: [
        { name: "Forms", href: "/forms", permission: "form.view" },
        { name: "Forms Responses", href: "/form-responses", permission: "form.view" },
      ],
    },

    {
      name: "Students",
      permission: "student.view",
      children: [
        { name: "Student Management", href: "/students", permission: "student.manage" },
        { name: "Class Management", href: "/classes", permission: "class.manage" },
        { name: "Batch Management", href: "/batches", permission: "batch.manage" },
      ],
    },

    {
      name: "Fee Manager",
      permission: "fee.manage",
      children: [
        { name: "Fee Structures", href: "/fees/structures", permission: "fee.manage" },
      ],
    },

    {
      name: "Examination",
      permission: "exam.manage",
      children: [
        { name: "Exam", href: "/exams", permission: "exam.manage" },
        { name: "Subject", href: "/subjects", permission: "subject.manage" },
        { name: "Exam Patterns", href: "/exam-patterns", permission: "exam.manage" },
      ],
    },

    {
      name: "Admin",
      permission: "user.manage",
      children: [
        { name: "Users", href: "/admin/users", permission: "user.manage" },
        { name: "Roles & Permissions", href: "/admin/roles", permission: "role.manage" },
      ],
    },
  ];

  /* ----------------------------------------
     FILTER BY PERMISSIONS
  ---------------------------------------- */
  const visibleMenus = menuLinks
    .filter(menu => !menu.permission || has(menu.permission))
    .map(menu => ({
      ...menu,
      children: menu.children
        ? menu.children.filter(
            child => !child.permission || has(child.permission)
          )
        : undefined,
    }))
    .filter(menu => !menu.children || menu.children.length > 0);

  /* ----------------------------------------
     UI
  ---------------------------------------- */
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b p-3 flex justify-between items-center shadow-sm">
      {/* MOBILE MENU */}
      <div className="md:hidden">
        <button
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu />
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 shadow-lg rounded-md border p-2 z-30">
            {visibleMenus.map((link, idx) => (
              <div key={idx}>
                {!link.children ? (
                  <Link
                    href={link.href}
                    onClick={closeMenus}
                    className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <>
                    <p className="px-3 py-2 font-semibold">{link.name}</p>
                    {link.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMenus}
                        className="block pl-6 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP MENU */}
      <nav className="hidden md:flex gap-6 text-sm font-medium">
        {visibleMenus.map((link, index) =>
          link.children ? (
            <div key={index} className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === index ? null : index)}
                className="hover:text-blue-600"
              >
                {link.name} ▾
              </button>

              {openMenu === index && (
                <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-gray-800 shadow rounded border p-2">
                  {link.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={closeMenus}
                      className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenus}
              className="hover:text-blue-600"
            >
              {link.name}
            </Link>
          )
        )}
      </nav>

      {/* SEARCH */}
      <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 px-3 rounded-lg w-80">
        <Search size={18} className="opacity-60" />
        <Input
          type="text"
          placeholder="Search..."
          className="border-0 shadow-none bg-transparent focus-visible:ring-0"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-5">
        <button className="relative hover:text-blue-500 transition">
          <Bell size={20} />
        </button>

        <button onClick={toggleTheme} className="hover:text-blue-500 transition">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

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
                onClick={closeMenus}
                className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={closeMenus}
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
