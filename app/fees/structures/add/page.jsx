"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddFeeStructure() {
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [classId, setClassId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    if (!classId) return;
    fetch(`/api/batches?classId=${classId}`)
      .then(r => r.json())
      .then(setBatches);
  }, [classId]);

  const save = async () => {
    await fetch("/api/fees/structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        batchId: batchId || null,
        totalAmount: amount,
      }),
    });

    alert("Fee structure created");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Fee Structure</h1>

      <select
        className="border p-2 w-full mb-3"
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
      >
        <option value="">Select Class</option>
        {classes.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        className="border p-2 w-full mb-3"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
      >
        <option value="">All Batches</option>
        {batches.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <Input
        placeholder="Total Fee Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <Button className="mt-4 w-full" onClick={save}>
        Save Fee Structure
      </Button>
    </div>
  );
}
