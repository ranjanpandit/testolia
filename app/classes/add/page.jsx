"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function AddClass() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    code: "",
    duration: "",
    description: "",
    status: "active",
  });

  const submit = async () => {
    await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    router.push("/classes");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Class</h1>

      <Input placeholder="Class Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Input className="mt-3" placeholder="Code"
        value={form.code}
        onChange={(e) => setForm({ ...form, code: e.target.value })}
      />

      <Input className="mt-3" placeholder="Duration"
        value={form.duration}
        onChange={(e) => setForm({ ...form, duration: e.target.value })}
      />

      <Textarea className="mt-3" placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Button className="mt-4" onClick={submit}>
        Save Class
      </Button>
    </div>
  );
}
