"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);

  const load = async () => {
    const res = await fetch("/api/classes");
    setClasses(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this class?")) return;
    await fetch(`/api/classes/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>

        <Link href="/classes/add">
          <Button>➕ Add Class</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {classes.map((c) => (
          <div
            key={c.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm opacity-70">Code: {c.code}</p>
              <p className="text-sm opacity-70">Duration: {c.duration}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={c.status === "active" ? "default" : "secondary"}>
                {c.status}
              </Badge>

              <Link href={`/classes/edit/${c.id}`}>
                <Button variant="outline">✏ Edit</Button>
              </Link>

              <Button
                variant="destructive"
                onClick={() => remove(c.id)}
              >
                🗑 Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
