"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import EditUserModal from "./EditUserModal";
import CreateUserModal from "@/components/admin/CreateUserModal";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { usePermissionStore } from "@/lib/permissionStore";


export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [open, setOpen] = useState(false);

  const has = usePermissionStore((s) => s.has);

  useEffect(() => {
    if (has("user.manage")) {
      load();
    }
  }, [has]);

  async function load() {
    const res = await fetch("/api/admin/users");
    setUsers(await res.json());
  }

  return (
    <PermissionGuard permission="user.manage">
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Users</h1>
          <Button onClick={() => setOpen(true)}>+ Create User</Button>
        </div>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  <Button size="sm" onClick={() => setEditingUser(u)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSaved={load}
          />
        )}
        {open && (
          <CreateUserModal
            onClose={() => setOpen(false)}
            onCreated={() => {
              setOpen(false);
              load();
              toast.success("User created");
            }}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
