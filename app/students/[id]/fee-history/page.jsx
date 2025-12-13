"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeeHistory() {
  const { id } = useParams();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch(`/api/students/${id}/fee-payments`)
      .then((r) => r.json())
      .then(setPayments);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Fee Payments</h1>
        <Link href={`/students/${id}`}>
              <Button variant="outline">Back</Button>
            </Link>
        <Link href={`/students/${id}/pay-fee`}>
          <Button>➕ Add Payment</Button>
        </Link>
      </div>

      {payments.length === 0 ? (
        <p>No payments yet.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Mode</th>
              <th className="p-2 border">Reference</th>
              <th className="p-2 border">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="p-2 border">
                  {new Date(p.paid_on).toLocaleDateString()}
                </td>
                <td className="p-2 border">₹{p.amount}</td>
                <td className="p-2 border">{p.payment_mode}</td>
                <td className="p-2 border">{p.reference_no || "—"}</td>
                <td className="p-2 border">
                  <Link href={`/api/fees/receipt/${p.id}`} className="text-blue-600">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
