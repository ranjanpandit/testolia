"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExamPatterns() {
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    fetch("/api/exam-patterns")
      .then(r => r.json())
      .then(setPatterns);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exam Patterns</h1>

        <Link href="/exam-patterns/add">
          <Button>➕ Create Pattern</Button>
        </Link>
      </div>

      {patterns.map(p => (
        <div key={p.id} className="border p-4 rounded mb-3">
          <div className="flex justify-between">
            <div>
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-sm opacity-70">
                Duration: {p.duration} mins | Status: {p.status}
              </p>
            </div>

            <Link href={`/exam-patterns/${p.id}`}>
              <Button variant="outline">Manage</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
