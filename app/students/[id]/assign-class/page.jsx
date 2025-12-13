"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AssignClass() {
  const { id } = useParams();
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");

  // default start date = today
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
  }, []);

  const assign = async () => {
    if (!classId) return alert("Select class");

    await fetch("/api/student-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: id,
        classId,
        startDate, // ✅ send start date
      }),
    });

    router.push(`/students/${id}`);
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Assign Class</h1>

      {/* CLASS SELECT */}
      <div>
        <label className="block text-sm font-medium mb-1">Class</label>
        <select
          className="border p-2 w-full rounded"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* START DATE */}
      <div>
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <Button className="w-full mt-4" onClick={assign}>
        Assign Class
      </Button>
    </div>
  );
}
