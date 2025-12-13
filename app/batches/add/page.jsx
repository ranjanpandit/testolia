"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddBatchPage() {
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0] // default today
  );
  const [loading, setLoading] = useState(false);

  // --------------------------------
  // Load Classes
  // --------------------------------
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
  }, []);

  // --------------------------------
  // Save Batch
  // --------------------------------
  const save = async () => {
    if (!classId || !name) {
      alert("Class and Batch name are required");
      return;
    }

    setLoading(true);

    await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        name,
        capacity: capacity || null,
        startDate,
      }),
    });

    setLoading(false);
    router.push("/batches");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">➕ Add Batch</h1>

      <div className="space-y-4">
        {/* Class */}
        <div>
          <Label>Class *</Label>
          <select
            className="border rounded p-2 w-full"
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

        {/* Batch Name */}
        <div>
          <Label>Batch Name *</Label>
          <Input
            placeholder="e.g. Batch A / Morning Batch"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Capacity */}
        <div>
          <Label>Capacity (optional)</Label>
          <Input
            type="number"
            placeholder="Leave blank for unlimited"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        {/* Start Date */}
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={save} disabled={loading}>
            💾 Save Batch
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/batches")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
