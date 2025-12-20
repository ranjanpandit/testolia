"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AddExam() {
  const router = useRouter();

  const [patterns, setPatterns] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    patternId: "",
    startAt: "",
    endAt: ""
  });

  useEffect(() => {
    fetch("/api/exam-patterns")
      .then(r => r.json())
      .then(setPatterns);
  }, []);

  const save = async () => {
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!res.ok) return alert("Failed");

    router.push("/exams");
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Create Exam</h1>

      <Input placeholder="Exam Title"
        onChange={e => setForm({ ...form, title: e.target.value })} />

      <textarea
        className="border p-2 rounded w-full"
        placeholder="Description"
        onChange={e => setForm({ ...form, description: e.target.value })}
      />

      <select
        className="border p-2 rounded w-full"
        onChange={e => setForm({ ...form, patternId: e.target.value })}
      >
        <option value="">Select Pattern</option>
        {patterns.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <Input type="datetime-local"
        onChange={e => setForm({ ...form, startAt: e.target.value })} />

      <Input type="datetime-local"
        onChange={e => setForm({ ...form, endAt: e.target.value })} />

      <Button className="w-full" onClick={save}>
        Save Exam
      </Button>
    </div>
  );
}
