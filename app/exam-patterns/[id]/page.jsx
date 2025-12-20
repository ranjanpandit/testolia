"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export default function PatternDetails() {
  const { id } = useParams();
  const [pattern, setPattern] = useState(null);
  const [sections, setSections] = useState([]);

  const [section, setSection] = useState({
    title: "",
    totalQuestions: "",
    marksPerQuestion: "",
    negativeMarks: "",
    sectionDuration: ""
  });

  useEffect(() => {
    fetch(`/api/exam-patterns/${id}`)
      .then(r => r.json())
      .then(data => {
        setPattern(data.pattern);
        setSections(data.sections);
      });
  }, [id]);

  const addSection = async () => {
    await fetch("/api/exam-patterns/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patternId: id,
        ...section
      }),
    });

    location.reload();
  };

  if (!pattern) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{pattern.name}</h1>

      {/* SECTIONS */}
      <div>
        <h2 className="font-semibold mb-2">Sections</h2>

        {sections.map(s => (
          <div key={s.id} className="border p-3 rounded mb-2">
            <b>{s.title}</b> — {s.total_questions} Qs × {s.marks_per_question} marks  
            <br />
            Negative: {s.negative_marks}
          </div>
        ))}
      </div>

      {/* ADD SECTION */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold mb-3">Add Section</h3>

        <Input placeholder="Section Title"
          onChange={e => setSection({ ...section, title: e.target.value })} />

        <Input placeholder="Total Questions" className="mt-2"
          onChange={e => setSection({ ...section, totalQuestions: e.target.value })} />

        <Input placeholder="Marks per Question" className="mt-2"
          onChange={e => setSection({ ...section, marksPerQuestion: e.target.value })} />

        <Input placeholder="Negative Marks" className="mt-2"
          onChange={e => setSection({ ...section, negativeMarks: e.target.value })} />

        <Input placeholder="Section Duration (optional)" className="mt-2"
          onChange={e => setSection({ ...section, sectionDuration: e.target.value })} />

        <Button className="mt-3" onClick={addSection}>
          ➕ Add Section
        </Button>
      </div>
    </div>
  );
}
