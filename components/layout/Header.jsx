"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Globe2,
  LogOut,
  Menu,
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  X,
} from "lucide-react";

import { useStore } from "@/lib/store";
import { usePermissionStore } from "@/lib/permissionStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();

  const { darkMode, toggleTheme, logout, user } = useStore();
  const { has, loaded } = usePermissionStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const profileRef = useRef(null);
  const mobileRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!loaded) return null;

  const menuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      permission: "dashboard.view",
    },
    {
      name: "Forms",
      icon: User,
      permission: "form.view",
      children: [
        { name: "All Forms", href: "/forms", permission: "form.view" },
        { name: "Add Form", href: "/form-builder", permission: "form.create" },
        
      ],
    },
    {
      name: "Students",
      icon: User,
      permission: "student.view",
      children: [
        { name: "All Students", href: "/students", permission: "student.manage" },
        { name: "Add Student", href: "/students/add", permission: "student.manage" },
        { name: "Classes", href: "/classes", permission: "class.manage" },
        { name: "Batches", href: "/batches", permission: "batch.manage" },
      ],
    },
    {
      name: "Exams",
      permission: "exam.manage",
      children: [
        { name: "Tests", href: "/tests", permission: "exam.manage" },
        { name: "Question Bank", href: "/question-bank", permission: "exam.manage" },
        { name: "Results", href: "/admin/results", permission: "exam.manage" },
      ],
    },
    {
      name: "Fees",
      permission: "fee.manage",
      children: [
        { name: "Structures", href: "/fees/structures", permission: "fee.manage" },
      ],
    },
    {
      name: "Website",
      icon: Globe2,
      permission: "user.manage",
      children: [
        { name: "Website Settings", href: "/website/settings", permission: "user.manage" },
        { name: "Sections", href: "/website/sections", permission: "user.manage" },
        { name: "Banners", href: "/website/banners", permission: "user.manage" },
        { name: "Notification Centre", href: "/website/notifications", permission: "user.manage" },
        { name: "Important Links", href: "/website/important-links", permission: "user.manage" },
      ],
    },
    {
      name: "Admin",
      permission: "user.manage",
      children: [
        { name: "Users", href: "/admin/users", permission: "user.manage" },
        { name: "Roles", href: "/admin/roles", permission: "role.manage" },
      ],
    },
  ];

  const visibleMenus = menuItems
    .filter((item) => !item.permission || has(item.permission))
    .map((item) => ({
      ...item,
      children: item.children?.filter(
        (child) => !child.permission || has(child.permission)
      ),
    }))
    .filter((item) => !item.children || item.children.length > 0);

  return (
    <>
      {/* Header – high z-index */}
      <header className="sticky top-0 z-[1000] border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left – Logo + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline">Testollia</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {visibleMenus.map((item, idx) => {
              const isOpen = activeDropdown === idx;

              if (item.children) {
                return (
                  <div key={idx} className="relative">
                    <Button
                      variant="ghost"
                      className={cn(isOpen && "bg-accent")}
                      onClick={() =>
                        setActiveDropdown(isOpen ? null : idx)
                      }
                    >
                      {item.name}
                      <ChevronDown
                        className={cn(
                          "ml-1 h-4 w-4 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </Button>

                    {isOpen && (
                      /* Dropdown – very high z-index, fixed positioning fallback */
                      <div className="fixed md:absolute left-0 md:left-auto top-[3.5rem] md:top-full z-[9999] mt-1 w-56 rounded-md border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setActiveDropdown(null)}
                            className={cn(
                              "block px-4 py-2 text-sm hover:bg-accent",
                              pathname === child.href && "bg-accent"
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-accent",
                    pathname === item.href && "bg-accent"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center rounded-full bg-muted px-3">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px]">
                3
              </Badge>
            </Button>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {darkMode ? <Sun /> : <Moon />}
            </Button>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </Button>

              {profileOpen && (
                <div className="fixed md:absolute right-4 md:right-0 top-[3.5rem] md:top-full z-[9999] mt-1 w-56 rounded-md border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95">
                  <div className="border-b px-4 py-2">
                    <p className="font-medium">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => setProfileOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu – full screen with high z-index */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            ref={mobileRef}
            className="fixed inset-y-0 left-0 w-72 bg-background shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 h-14">
              <span className="font-semibold">EduAdmin</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="py-4 px-2 overflow-y-auto h-[calc(100vh-4rem)]">
              {visibleMenus.map((item, idx) => (
                <div key={idx}>
                  {!item.children ? (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-accent text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <>
                      <p className="px-4 py-2 font-semibold">{item.name}</p>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block pl-8 py-2 rounded-lg hover:bg-accent text-sm"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
