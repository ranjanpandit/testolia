"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditClass() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetch(`/api/classes/${id}`)
      .then((r) => r.json())
      .then(setForm);
  }, [id]);

  if (!form) return <p>Loading...</p>;

  const submit = async () => {
    await fetch(`/api/classes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/classes");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Class</h1>

      <Input value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Input className="mt-3" value={form.code}
        onChange={(e) => setForm({ ...form, code: e.target.value })}
      />

      <Input className="mt-3" value={form.duration}
        onChange={(e) => setForm({ ...form, duration: e.target.value })}
      />

      <Textarea className="mt-3" value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Button className="mt-4" onClick={submit}>
        Update Class
      </Button>
    </div>
  );
}
