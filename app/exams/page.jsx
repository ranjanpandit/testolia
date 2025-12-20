"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Exams() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetch("/api/exams")
      .then(r => r.json())
      .then(setExams);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Exams</h1>

        <Link href="/exams/add">
          <Button>➕ Create Exam</Button>
        </Link>
      </div>

      {exams.map(e => (
        <div key={e.id} className="border p-4 rounded mb-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{e.title}</h2>
              <p className="text-sm opacity-70">
                Pattern: {e.pattern_name}
              </p>
              <p className="text-sm">
                {new Date(e.start_at).toLocaleString()} →{" "}
                {new Date(e.end_at).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Link href={`/exams/${e.id}`}>
                <Button variant="outline">Manage</Button>
              </Link>

              <span className="text-xs px-2 py-1 rounded bg-gray-200">
                {e.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
