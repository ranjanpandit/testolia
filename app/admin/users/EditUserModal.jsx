"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function EditUserModal({ user, onClose, onSaved }) {
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState(user.role_id);
  const [status, setStatus] = useState(user.status);

  useEffect(() => {
    async function loadRoles() {
      const res = await fetch("/api/admin/roles");
      setRoles(await res.json());
    }
    loadRoles();
  }, []);

  async function save() {

    await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role_id: roleId,
        status,
      }),
    });

    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="font-bold mb-4">Edit User</h2>

        <label className="block mb-2">Role</label>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <label className="block mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}
