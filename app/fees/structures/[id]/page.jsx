"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditFeeStructure() {
  const { id } = useParams();
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [classId, setClassId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(true);

  /* -----------------------------------
     Load classes
  ----------------------------------- */
  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses);
  }, []);

  /* -----------------------------------
     Load existing fee structure (EDIT)
  ----------------------------------- */
  useEffect(() => {
    if (!id) return;

    const loadStructure = async () => {
      const res = await fetch(`/api/fees/structures/${id}`);
      const data = await res.json();
      console.log({data})
      setClassId(String(data.class_id));
      setBatchId(data.batch_id ? String(data.batch_id) : "");
      setAmount(String(data.total_amount));
      setLoading(false);
    };

    loadStructure();
  }, [id]);

  /* -----------------------------------
     Load batches when class changes
  ----------------------------------- */
  useEffect(() => {
    if (!classId) {
      setBatches([]);
      return;
    }

    fetch(`/api/batches?classId=${classId}`)
      .then((r) => r.json())
      .then(setBatches);
  }, [classId]);

  /* -----------------------------------
     Save updates
  ----------------------------------- */
  const save = async () => {
    if (!classId || !amount) {
      toast.error("Class and amount are required");
      return;
    }

    const res = await fetch(`/api/fees/structures/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        batchId: batchId || null,
        totalAmount: amount,
      }),
    });

    if (!res.ok) {
      toast.error("Update failed");
      return;
    }

    toast.success("Fee structure updated");
    router.push("/fees/structures");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Fee Structure</h1>

      {/* CLASS */}
      <select
        className="border p-2 w-full mb-3 rounded"
        value={classId}
        onChange={(e) => {
          setClassId(e.target.value);
          setBatchId(""); // reset batch on class change
        }}
      >
        <option value="">Select Class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* BATCH */}
      <select
        className="border p-2 w-full mb-3 rounded"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        disabled={!classId}
      >
        <option value="">All Batches</option>
        {batches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      {/* AMOUNT */}
      <Input
        placeholder="Total Fee Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <Button className="mt-4 w-full" onClick={save}>
        💾 Save Fee Structure
      </Button>
    </div>
  );
}
