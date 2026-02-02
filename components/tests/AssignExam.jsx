"use client";

import { useEffect, useState } from "react";

export default function AssignExam({ examId }) {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selected, setSelected] = useState({
    classes: [],
    batches: [],
  });

  useEffect(() => {
    fetch(`/api/tests/${examId}/eligibility`)
      .then((r) => r.json())
      .then((data) => {
        setClasses(data.classes);
        setBatches(data.batches);
        setSelected(data.assigned);
        setLoading(false);
      });
  }, []);

  function toggle(type, id) {
    setSelected((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((x) => x !== id)
        : [...prev[type], id],
    }));
  }

  async function save() {
    await fetch(`/api/tests/${examId}/eligibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_ids: selected.classes,
        batch_ids: selected.batches,
      }),
    });

    alert("Eligibility updated");
  }

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Classes */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Assign Classes</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {classes.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selected.classes.includes(c.id)}
                onChange={() => toggle("classes", c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {/* Batches */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Assign Batches</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {batches.map((b) => (
            <label
              key={b.id}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selected.batches.includes(b.id)}
                onChange={() => toggle("batches", b.id)}
              />
              {b.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          Save Eligibility
        </button>
      </div>
    </div>
  );
}
