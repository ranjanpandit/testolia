"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ImportStudents() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [mode, setMode] = useState("skip"); // skip | update
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // PARSE FILE (PREVIEW ONLY)
  // -----------------------------
  const parseFile = async () => {
    if (!file) {
      alert("Please select a CSV or Excel file");
      return;
    }

    setLoading(true);
    setPreview([]);
    setErrors([]);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/students/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setPreview(data.rows || []);
    setErrors(data.errors || []);
    setLoading(false);
  };

  // -----------------------------
  // FINAL IMPORT
  // -----------------------------
  const importNow = async () => {
    if (preview.length === 0) {
      alert("Nothing to import");
      return;
    }

    if (!confirm("This will save students to database. Continue?")) return;

    setLoading(true);

    const res = await fetch(
      `/api/students/import?commit=1&mode=${mode}`,
      { method: "POST" }
    );

    const out = await res.json();

    alert(
      `Import Completed\n\n` +
      `Inserted: ${out.inserted}\n` +
      `Updated: ${out.updated}\n` +
      `Skipped: ${out.skipped}`
    );

    setPreview([]);
    setErrors([]);
    setFile(null);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bulk Student Import</h1>

        
      </div>

      <Input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <Button onClick={parseFile} disabled={loading}>
        {loading ? "Processing..." : "📄 Parse File"}
      </Button>

      {/* DUPLICATE MODE */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === "skip"}
            onChange={() => setMode("skip")}
          />
          Skip existing students
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === "update"}
            onChange={() => setMode("update")}
          />
          Update existing students
        </label>
      </div>

      {/* ERRORS */}
      {errors.length > 0 && (
        <div className="border border-red-300 bg-red-50 p-4 rounded">
          <h3 className="font-semibold text-red-700">Errors</h3>
          {errors.map((e, i) => (
            <p key={i}>• {e}</p>
          ))}
        </div>
      )}

      {/* PREVIEW */}
      {preview.length > 0 && (
        <>
          <h3 className="font-semibold">
            Preview ({preview.length} rows)
          </h3>

          <div className="overflow-auto max-h-[300px] border rounded">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {Object.keys(preview[0]).map((k) => (
                    <th key={k} className="border p-2 text-left">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="border p-2">{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            className="mt-4 bg-green-600 hover:bg-green-700"
            onClick={importNow}
            disabled={loading}
          >
            ✅ Final Import
          </Button>
        </>
      )}
    </div>
  );
}
