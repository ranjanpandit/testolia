"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AddExamPattern() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    totalMarks: "",
    durationMinutes: "",
    negativeMarking: false
  });

  const save = async () => {
    const res = await fetch("/api/exam-patterns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!res.ok) return alert("Failed");

    router.push("/exam-patterns");
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Add Exam Pattern</h1>

      <Input
        placeholder="Pattern Name"
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <Input
        placeholder="Total Marks"
        type="number"
        onChange={e => setForm({ ...form, totalMarks: e.target.value })}
      />

      <Input
        placeholder="Duration (minutes)"
        type="number"
        onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          onChange={e =>
            setForm({ ...form, negativeMarking: e.target.checked })
          }
        />
        Enable Negative Marking
      </label>

      <Button className="w-full" onClick={save}>
        Save Pattern
      </Button>
    </div>
  );
}
