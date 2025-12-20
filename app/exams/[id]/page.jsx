"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function EditExam() {
  const { id } = useParams();
  const router = useRouter();

  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    pattern_id: "",
    start_at: "",
    end_at: "",
    status: "draft",
  });

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    Promise.all([
      fetch(`/api/exams/${id}`).then(r => r.json()),
      fetch("/api/exam-patterns").then(r => r.json())
    ])
      .then(([exam, patterns]) => {
        setForm({
          name: exam.title,
          pattern_id: exam.pattern_id,
          start_at: exam.start_at?.slice(0, 16),
          end_at: exam.end_at?.slice(0, 16),
          status: exam.status || "draft",
        });
        setPatterns(patterns);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load exam");
        setLoading(false);
      });
  }, [id]);

  /* ---------------- SAVE ---------------- */
  const save = async () => {
    const res = await fetch(`/api/exams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      toast.error("Update failed");
      return;
    }

    toast.success("Exam updated");
    router.push("/exams");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Exam</h1>

        <div className="flex gap-3">
          <Link href="/exams">
            <Button variant="outline">⬅ Back</Button>
          </Link>

          <Link href={`/exams/${id}/questions`}>
            <Button variant="outline">🧩 Manage Questions</Button>
          </Link>

          <Link href={`/exams/${id}/preview`}>
            <Button variant="outline">👁 Preview</Button>
          </Link>
        </div>
      </div>

      {/* BASIC DETAILS */}
      <section className="border p-4 rounded bg-white shadow-sm space-y-4">
        <h2 className="font-semibold text-lg">Exam Details</h2>

        <Input
          placeholder="Exam Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="border p-2 rounded w-full"
          value={form.pattern_id}
          onChange={(e) =>
            setForm({ ...form, pattern_id: e.target.value })
          }
        >
          <option value="">Select Exam Pattern</option>
          {patterns.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.total_marks} marks / {p.duration_minutes} mins)
            </option>
          ))}
        </select>
      </section>

      {/* SCHEDULE */}
      <section className="border p-4 rounded bg-white shadow-sm space-y-4">
        <h2 className="font-semibold text-lg">Schedule</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Start Date & Time</label>
            <Input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) =>
                setForm({ ...form, start_at: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm">End Date & Time</label>
            <Input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) =>
                setForm({ ...form, end_at: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {/* STATUS */}
      <section className="border p-4 rounded bg-white shadow-sm space-y-3">
        <h2 className="font-semibold text-lg">Status</h2>

        <select
          className="border p-2 rounded w-full"
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>

        <p className="text-sm opacity-70">
          Only <b>Published</b> exams are visible to students.
        </p>
      </section>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>

        <Button onClick={save} className="bg-blue-600">
          💾 Save Changes
        </Button>
      </div>
    </div>
  );
}
