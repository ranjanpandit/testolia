"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SubjectsList() {
  const [subjects, setSubjects] = useState([]);

  const load = async () => {
    const res = await fetch("/api/subjects");
    setSubjects(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete subject?")) return;
    await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>

        <Link href="/subjects/add">
          <Button>➕ Add Subject</Button>
        </Link>
      </div>

      {subjects.length === 0 ? (
        <p>No subjects found.</p>
      ) : (
        <div className="space-y-3">
          {subjects.map(s => (
            <div
              key={s.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm opacity-60">
                  Code: {s.code || "—"} | Status: {s.status}
                </p>
              </div>

              <div className="flex gap-2">
                <Link href={`/subjects/${s.id}`}>
                  <Button variant="outline">✏ Edit</Button>
                </Link>

                <Button
                  variant="destructive"
                  onClick={() => remove(s.id)}
                >
                  🗑 Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
