"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ExamQuestions() {
  const { id } = useParams();
  const [bank, setBank] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch("/api/questions").then(r => r.json()).then(setBank);
  }, []);

  const toggle = (qid) => {
    setSelected((s) =>
      s.includes(qid) ? s.filter(x => x !== qid) : [...s, qid]
    );
  };

  const addToExam = async () => {
    await fetch(`/api/exams/${id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionIds: selected }),
    });

    alert("Questions added to exam");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Map Questions to Exam</h1>

      {bank.map(q => (
        <div key={q.id} className="border p-3 rounded mb-2 flex justify-between">
          <p>{q.question}</p>
          <input
            type="checkbox"
            checked={selected.includes(q.id)}
            onChange={() => toggle(q.id)}
          />
        </div>
      ))}

      <Button onClick={addToExam} className="mt-4">
        ➕ Add Selected Questions
      </Button>
    </div>
  );
}
