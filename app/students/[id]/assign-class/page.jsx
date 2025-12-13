"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AssignClassBatch() {
  const { id } = useParams();
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [classId, setClassId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // ------------------------
  // Load classes
  // ------------------------
  useEffect(() => {
      fetch("/api/classes")
        .then(res => res.json())
        .then(setClasses);
    }, []);

  // ------------------------
  // Load batches when class changes
  // ------------------------
  useEffect(() => {
    if (!classId) {
      setBatches([]);
      setBatchId("");
      return;
    }

    fetch(`/api/batches?classId=${classId}`)
      .then((res) => res.json())
      .then(setBatches);
  }, [classId]);

  // ------------------------
  // Assign
  // ------------------------
  const assign = async () => {
    if (!classId || !batchId) {
      alert("Please select class and batch");
      return;
    }
    await fetch("/api/student-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: id,
        classId,
        batchId,
        startDate, // ✅ send start date
      }),
    });
    router.push(`/students/${id}`);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">
        Assign Class & Batch
      </h1>

      {/* Class */}
      <div className="mb-4">
        <Label>Class *</Label>
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

      {/* Batch */}
      <div className="mb-4">
        <Label>Batch *</Label>
        <select
          className="border p-2 w-full rounded"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          disabled={!classId}
        >
          <option value="">Select Batch</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Start Date */}
      <div className="mb-6">
        <Label>Start Date</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <Button className="w-full" onClick={assign}>
        Assign
      </Button>
    </div>
  );
}
