"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function CreateUserModal({ onClose, onCreated }) {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });

  useEffect(() => {
    fetch("/api/admin/roles")
      .then(r => r.json())
      .then(setRoles);
  }, []);

  const submit = async () => {
    await fetch("/api/admin/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="font-bold mb-4">Create User</h2>

        <input
          placeholder="Name"
          className="border p-2 w-full mb-2"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          className="border p-2 w-full mb-2"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-2"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-4"
          onChange={e => setForm({ ...form, role_id: e.target.value })}
        >
          <option value="">Select Role</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Create</Button>
        </div>
      </div>
    </div>
  );
}
