"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AssignFee() {
  const { id: studentId } = useParams();
  const router = useRouter();

  const [feeStructures, setFeeStructures] = useState([]);
  const [feeId, setFeeId] = useState("");

  useEffect(() => {
    fetch("/api/fee-structures")
      .then(res => res.json())
      .then(setFeeStructures);
  }, []);

  const assign = async () => {
    if (!feeId) return alert("Select a fee structure");

    await fetch("/api/student-fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        feeStructureId: feeId,
      }),
    });

    router.push(`/students/${studentId}`);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Assign Fee Structure</h1>

      <select
        className="border p-2 w-full rounded"
        value={feeId}
        onChange={(e) => setFeeId(e.target.value)}
      >
        <option value="">Select Fee Structure</option>
        {feeStructures.map((f) => (
          <option key={f.id} value={f.id}>
            {f.class_name} {f.batch_name ? `(${f.batch_name})` : ""} – ₹{f.total_amount}
          </option>
        ))}
      </select>

      <Button className="mt-4 w-full" onClick={assign}>
        Assign Fees
      </Button>
    </div>
  );
}
