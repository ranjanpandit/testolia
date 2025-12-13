"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExamsList() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetch("/api/exams")
      .then(r => r.json())
      .then(setExams);
  }, []);
  const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Exams</h1>
        <Link href="/exams/add">
          <Button>➕ Create Exam</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {exams.map(e => (
          <div key={e.id} className="border p-4 rounded">
            <p className="font-semibold">{e.name}</p>
            <p className="text-sm">Classes: {e.classes || "—"}</p>
            <p className="text-sm">Dates:   {formatDate(e.start_date)} → {formatDate(e.end_date)}</p>
            <p className="text-sm">Status: {e.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
