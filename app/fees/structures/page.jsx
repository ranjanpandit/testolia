"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FeeStructureList() {
  const [fees, setFees] = useState([]);

  const load = async () => {
    const res = await fetch("/api/fee-structures");
    const data = await res.json();
    setFees(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fee Structures</h1>

        <div className="flex gap-3">
          <Link href="/fees/structures/add">
            <Button>➕ Add Fee Structure</Button>
          </Link>

          <Button variant="outline" onClick={() => window.location.reload()}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* LISTING */}
      {fees.length === 0 ? (
        <p className="opacity-60">No fee structures found.</p>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Batch</th>
                <th className="p-3 text-left">Total Fee</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {fees.map((f) => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{f.class_name}</td>

                  <td className="p-3">{f.batch_name || "—"}</td>

                  <td className="p-3">
                    ₹{Number(f.total_amount).toLocaleString()}
                  </td>

                  <td className="p-3">
                    <Badge className="bg-green-600">Active</Badge>
                  </td>

                  <td className="p-3 text-right space-x-2">
                    <Link href={`/fees/structures/${f.id}`}>
                      <Button size="sm" variant="outline">
                        ✏ Edit
                      </Button>
                    </Link>

                    {/* <Link href={`/fees/structures/${f.id}/assign`}>
                      <Button size="sm">👤 Assign</Button>
                    </Link> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
