"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function ImportQuestionsPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ---------------- actions ---------------- */

  const validate = async () => {
    if (!file) return;
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/question-import/validate", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setPreview(data);

      data.errors?.length
        ? toast.warning("Validation completed with issues")
        : toast.success("All questions validated successfully");
    } catch {
      toast.error("Validation service unavailable");
    } finally {
      setLoading(false);
    }
  };

  const commit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/question-import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: preview.data }),
      });
      const result = await res.json();
      toast.success(`${result.inserted} questions imported successfully`);
      setPreview(null);
      setFile(null);
    } catch {
      toast.error("Database commit failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadErrors = async () => {
    const res = await fetch("/api/question-import/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errors: preview.errors }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `question_import_errors.csv`;
    a.click();
  };

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between bg-white border rounded-xl p-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg border hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <h1 className="text-lg font-semibold">
                Import Questions
              </h1>
              <p className="text-sm text-slate-500">
                Bulk upload questions into the question bank
              </p>
            </div>
          </div>

          <Link href="/api/question-import/sample">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Sample CSV
            </Button>
          </Link>
        </header>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Step 1 */}
          <section className="bg-white border rounded-xl p-6 space-y-6">
            <StepTitle step="1" title="Upload File" />

            <label className="group block cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition
                ${
                  file
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 group-hover:border-slate-300"
                }`}
              >
                <UploadCloud
                  className={`mx-auto mb-3 ${
                    file ? "text-indigo-600" : "text-slate-400"
                  }`}
                />
                <p className="text-sm font-medium">
                  {file ? file.name : "Choose CSV file"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Only .csv files are supported
                </p>
              </div>
            </label>

            <Button
              onClick={validate}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Validate File"
              )}
            </Button>
          </section>

          {/* Step 2 + 3 */}
          <section className="lg:col-span-2">
            {!preview ? (
              <div className="h-full min-h-[360px] border border-dashed rounded-xl flex items-center justify-center text-slate-400 bg-white">
                Upload a file to see validation results
              </div>
            ) : (
              <div className="bg-white border rounded-xl overflow-hidden">

                {/* Summary */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="text-emerald-600 w-5 h-5" />
                    Validation Summary
                  </div>
                  <div className="text-sm text-slate-600">
                    {preview.valid} / {preview.total} valid
                  </div>
                </div>

                {/* Errors */}
                {preview.errors.length > 0 && (
                  <div className="p-6 bg-red-50 border-b">
                    <div className="flex justify-between mb-3">
                      <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {preview.errors.length} issues found
                      </p>
                      <button
                        onClick={downloadErrors}
                        className="text-sm text-red-700 underline"
                      >
                        Download error CSV
                      </button>
                    </div>

                    <ul className="text-sm text-slate-700 space-y-1 max-h-32 overflow-auto">
                      {preview.errors.map((e, i) => (
                        <li key={i}>
                          <b>Row {e.row}:</b> {e.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Commit */}
                <div className="p-6 text-center space-y-4">
                  {preview.valid > 0 ? (
                    <>
                      <p className="text-sm text-slate-600">
                        {preview.valid} questions are ready to be imported
                      </p>
                      <Button
                        onClick={commit}
                        disabled={loading}
                        className="px-10"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Import Questions"
                        )}
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-red-600">
                      No valid records to import
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* ---------------- components ---------------- */

function StepTitle({ step, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
        {step}
      </div>
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  );
}
