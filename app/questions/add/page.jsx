"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QuestionEditor from "@/components/QuestionEditor";
import { toast } from "sonner";

export default function AddQuestion() {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");

  const [type, setType] = useState("single");
  const [difficulty, setDifficulty] = useState("medium");
  const [marks, setMarks] = useState(1);
  const [question, setQuestion] = useState("");

  const [options, setOptions] = useState([
    { text: "", correct: false },
    { text: "", correct: false },
  ]);

  useEffect(() => {
    fetch("/api/subjects").then(r => r.json()).then(setSubjects);
  }, []);

  useEffect(() => {
    if (subjectId) {
      fetch(`/api/topics?subjectId=${subjectId}`)
        .then(r => r.json())
        .then(setTopics);
    }
  }, [subjectId]);

  const addOption = () => {
    setOptions([...options, { text: "", correct: false }]);
  };

  const save = async () => {
    if (!question) return toast.error("Question required");

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId,
        topicId,
        type,
        difficulty,
        marks,
        question,
        options,
      }),
    });

    if (!res.ok) return toast.error("Save failed");

    toast.success("Question saved");
    setQuestion("");
    setOptions([{ text: "", correct: false }]);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add Question</h1>

      {/* SUBJECT */}
      <select
        className="border p-2"
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
      >
        <option value="">Select Subject</option>
        {subjects.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* TOPIC */}
      <select
        className="border p-2"
        value={topicId}
        onChange={(e) => setTopicId(e.target.value)}
      >
        <option value="">Select Topic</option>
        {topics.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {/* META */}
      <div className="flex gap-4">
        <select value={type} onChange={e => setType(e.target.value)} className="border p-2">
          <option value="single">Single Choice</option>
          <option value="multiple">Multiple Choice</option>
          <option value="fill">Fill in Blank</option>
        </select>

        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="border p-2">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <Input type="number" value={marks} onChange={e => setMarks(e.target.value)} />
      </div>

      {/* QUESTION */}
      <QuestionEditor value={question} onChange={setQuestion} />

      {/* OPTIONS */}
      {(type === "single" || type === "multiple") && (
        <div className="space-y-3">
          {options.map((o, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Input
                placeholder={`Option ${i + 1}`}
                value={o.text}
                onChange={(e) => {
                  const arr = [...options];
                  arr[i].text = e.target.value;
                  setOptions(arr);
                }}
              />
              <input
                type={type === "single" ? "radio" : "checkbox"}
                checked={o.correct}
                onChange={() => {
                  const arr = options.map((x, idx) => ({
                    ...x,
                    correct: type === "single" ? idx === i : idx === i ? !x.correct : x.correct
                  }));
                  setOptions(arr);
                }}
              />
            </div>
          ))}

          <Button variant="outline" onClick={addOption}>➕ Add Option</Button>
        </div>
      )}

      <Button onClick={save}>💾 Save Question</Button>
    </div>
  );
}
