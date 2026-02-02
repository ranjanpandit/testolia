export const ADMIN_MENU = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: "mdi:view-dashboard",
  },
  {
    label: "Forms",
    icon: "mdi:form-select",
    permission: "form.view",
    children: [
      { label: "All Forms", path: "/admin/forms", permission: "form.view" },
      { label: "Create Form", path: "/admin/forms/create", permission: "form.create" },
    ],
  },
  {
    label: "Admin Management",
    icon: "mdi:shield-account",
    permission: "admin.view",
    children: [
      { label: "Admins", path: "/admin/users", permission: "admin.view" },
      { label: "Roles & Permissions", path: "/admin/roles", permission: "admin.manage" },
    ],
  },
];
