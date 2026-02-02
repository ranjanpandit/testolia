"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RichEditor from "@/components/editor/RichEditor";

export default function InstructionForm() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/api/instructions/${id}`)
      .then(r => r.json())
      .then(d => {
        setTitle(d.title);
        setContent(d.content);
      });
  }, [id]);

  async function save() {
    await fetch(`/api/instructions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    router.push("/instructions");
  }

  return (
    <div className="bg-white p-6 rounded-xl max-w-3xl">
      <h1 className="text-xl font-bold mb-4">
        {"Edit Instruction"}
      </h1>

      <input
        className="border p-2 w-full rounded mb-4"
        placeholder="Instruction title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <RichEditor value={content} onChange={setContent} />

      <button onClick={save} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded">
        Save
      </button>
    </div>
  );
}
