"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import RolePermissions from "@/components/admin/RolePermissions"

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    fetch("/api/admin/roles")
      .then(r => r.json())
      .then(setRoles);
  }, []);

  return (
    <div className="p-6 grid grid-cols-4 gap-6">
      {/* Roles List */}
      <div className="col-span-1 border rounded p-4">
        <h2 className="font-bold mb-3">Roles</h2>

        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role)}
            className={`block w-full text-left px-3 py-2 rounded mb-1
              ${activeRole?.id === role.id ? "bg-blue-600 text-white" : "hover:bg-gray-100"}
            `}
          >
            {role.name}
          </button>
        ))}
      </div>

      {/* Permissions */}
      <div className="col-span-3">
        {activeRole ? (
          <RolePermissions role={activeRole} />
        ) : (
          <p>Select a role to manage permissions</p>
        )}
      </div>
    </div>
  );
}
