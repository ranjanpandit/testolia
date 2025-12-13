"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddExam() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [examType, setExamType] = useState("offline");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/classes")
      .then(r => r.json())
      .then(setClasses);
  }, []);

  const toggleClass = (id) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const save = async () => {
    if (!name || !startDate || !endDate || !selectedClasses.length) {
      toast.error("Fill all required fields");
      return;
    }

    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        examType,
        startDate,
        endDate,
        classIds: selectedClasses,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to create exam");
      return;
    }

    toast.success("Exam created successfully");
    router.push("/exams");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Exam</h1>

      <Input placeholder="Exam Name" value={name} onChange={e => setName(e.target.value)} />

      <select
        className="border p-2 w-full mt-3"
        value={examType}
        onChange={e => setExamType(e.target.value)}
      >
        <option value="offline">Offline</option>
        <option value="online">Online</option>
      </select>

      <div className="grid grid-cols-2 gap-4 mt-3">
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Assign Classes</h3>
        {classes.map(c => (
          <label key={c.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedClasses.includes(c.id)}
              onChange={() => toggleClass(c.id)}
            />
            {c.name}
          </label>
        ))}
      </div>

      <Button className="mt-6 w-full" onClick={save}>
        Save Exam
      </Button>
    </div>
  );
}
