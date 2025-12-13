"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetch("/api/batches")
      .then(res => res.json())
      .then(setBatches);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Batches</h1>
        <Link href="/batches/add">
          <Button>➕ Add Batch</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {batches.map(b => (
          <div key={b.id} className="border p-4 rounded flex justify-between">
            <div>
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm opacity-70">
                Capacity: {b.capacity || "Unlimited"}
              </p>
            </div>

            <Link href={`/batches/${b.id}`}>
              <Button variant="outline">View</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
