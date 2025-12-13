"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SubjectForm() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    code: "",
    status: "active",
  });

  const isEdit = id !== "add";

  useEffect(() => {
    if (!isEdit) return;

    fetch(`/api/subjects`)
      .then(r => r.json())
      .then(data => {
        const s = data.find(x => x.id == id);
        if (s) setForm(s);
      });
  }, [id]);

  const save = async () => {
    if (!form.name) {
      toast.error("Subject name required");
      return;
    }

    const res = await fetch(
      isEdit ? `/api/subjects/${id}` : "/api/subjects",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    if (!res.ok) {
      toast.error("Save failed");
      return;
    }

    toast.success("Subject saved");
    router.push("/subjects");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">
        {isEdit ? "Edit Subject" : "Add Subject"}
      </h1>

      <Input
        placeholder="Subject Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        className="mb-3"
      />

      <Input
        placeholder="Subject Code (optional)"
        value={form.code || ""}
        onChange={e => setForm({ ...form, code: e.target.value })}
        className="mb-3"
      />

      {isEdit && (
        <select
          className="border p-2 w-full mb-3"
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      )}

      <Button className="w-full" onClick={save}>
        💾 Save
      </Button>
    </div>
  );
}
