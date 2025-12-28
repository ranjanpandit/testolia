"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CreateAdminUser() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });

  useEffect(() => {
    fetch("/api/admin/roles")
      .then((r) => r.json())
      .then(setRoles);
  }, []);

  const submit = async () => {
    const res = await fetch("/api/admin/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) return toast.error("Failed");

    toast.success("Admin created");
    window.location.href = "/admin/users";
  };

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">Create Admin</h1>

      <Input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />

      <select
        className="border p-2 w-full mt-2"
        onChange={(e) => setForm({ ...form, role_id: e.target.value })}
      >
        <option value="">Select role</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      <Button className="mt-4 w-full" onClick={submit}>
        Create
      </Button>
    </div>
  );
}
