"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AssignFeeToStudents() {
  const { id } = useParams();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch("/api/students")
      .then(res => res.json())
      .then(setStudents);
  }, []);

  const toggle = (sid) => {
    setSelected((prev) =>
      prev.includes(sid)
        ? prev.filter(x => x !== sid)
        : [...prev, sid]
    );
  };

  const assign = async () => {
    await fetch("/api/student-fees/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feeStructureId: id,
        studentIds: selected,
      }),
    });

    router.push("/fee-structures");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        Assign Fee Structure
      </h1>

      <div className="space-y-2 max-h-[400px] overflow-auto border rounded p-3">
        {students.map(s => (
          <label key={s.id} className="flex gap-3 items-center">
            <input
              type="checkbox"
              checked={selected.includes(s.id)}
              onChange={() => toggle(s.id)}
            />
            <span>{s.first_name} {s.last_name}</span>
          </label>
        ))}
      </div>

      <Button
        className="mt-4 w-full"
        disabled={!selected.length}
        onClick={assign}
      >
        Assign to {selected.length} Student(s)
      </Button>
    </div>
  );
}
