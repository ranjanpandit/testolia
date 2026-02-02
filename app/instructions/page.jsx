"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function InstructionList() {
  const [items, setItems] = useState([]);

  async function load() {
    const res = await fetch("/api/instructions");
    setItems(await res.json());
  }

  async function remove(id) {
    if (!confirm("Delete this instruction?")) return;
    await fetch(`/api/instructions/${id}`, { method: "DELETE" });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Exam Instructions</h1>
        <Link href="/instructions/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Instruction
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Title</th>
            <th className="text-right py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id} className="border-b">
              <td className="py-2">{i.title}</td>
              <td className="py-2 text-right space-x-3">
                <Link href={`/instructions/${i.id}/edit`} className="text-blue-600">
                  Edit
                </Link>
                <button onClick={() => remove(i.id)} className="text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
