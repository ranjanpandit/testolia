"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PayFee() {
  const { id } = useParams();
  const router = useRouter();

  const [fee, setFee] = useState(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [ref, setRef] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetch(`/api/students/${id}/fees`)
      .then(res => res.json())
      .then(data => setFee(data.fee));
  }, []);

  const submit = async () => {
    if (!amount) return toast.error("Enter amount");

    await fetch(`/api/students/${id}/fees/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fee_id: fee.id,
        amount,
        payment_mode: mode,
        reference_no: ref,
        remarks,
        paid_on: new Date().toISOString().slice(0, 10),
      }),
    });

    toast.success("Payment added");
    router.push(`/students/${id}`);
  };

  if (!fee) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Add Fee Payment</h1>

      <p>Total: ₹{fee.total_amount}</p>
      <p>Paid: ₹{fee.paid_amount}</p>
      <p>Due: ₹{fee.total_amount - fee.paid_amount}</p>

      <Input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select
        className="border p-2 rounded w-full"
        value={mode}
        onChange={(e) => setMode(e.target.value)}
      >
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
        <option value="card">Card</option>
        <option value="bank">Bank</option>
      </select>

      <Input
        placeholder="Reference No (optional)"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
      />

      <Input
        placeholder="Remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />

      <Button className="w-full" onClick={submit}>
        💰 Submit Payment
      </Button>
    </div>
  );
}
