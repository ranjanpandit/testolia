"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/* ----------------------------- helpers ----------------------------- */
const safeHTML = (html) => ({
  __html: DOMPurify.sanitize(html || ""),
});

/* ----------------------------- skeleton ---------------------------- */
function PageSkeleton() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-10 w-1/3 bg-slate-200 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white rounded border" />
        <div className="h-80 bg-white rounded border" />
      </div>
    </div>
  );
}

/* ------------------------------ main ------------------------------- */
export default function QuestionView({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/questions/${id}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id]);

  if (loading) return <PageSkeleton />;

  if (error || !data?.question) {
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        Failed to load question
      </div>
    );
  }

  const q = data.question;
  const isObjective = ["mcq", "scq"].includes(q.question_type);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ---------------- header ---------------- */}
        <div className="flex items-center justify-between bg-white p-4 rounded border">
          <div className="flex items-center gap-3">
            <Link href="/question-bank">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">
              Question Details
            </h1>
            <span className="text-sm text-slate-400">#{id}</span>
          </div>

          <Link href={`/question-bank/${id}/edit`}>
            <Button size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </Link>
        </div>

        {/* ---------------- content ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* -------- left: question + options ------- */}
          <section className="lg:col-span-2 space-y-6">

            {/* question */}
            <div className="bg-white rounded border p-6">
              <h2 className="text-sm font-semibold mb-3 text-slate-600">
                Question
              </h2>

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={safeHTML(q.question_text)}
              />

              {q.question_image && (
                <img
                  src={q.question_image}
                  alt="Question"
                  className="mt-4 max-h-72 rounded border"
                />
              )}
            </div>

            {/* options */}
            {isObjective && (
              <div className="bg-white rounded border p-6">
                <h2 className="text-sm font-semibold mb-4 text-slate-600">
                  Options
                </h2>

                <div className="space-y-3">
                  {data.options.map((opt, index) => (
                    <div
                      key={opt.id}
                      className={`flex gap-4 p-4 rounded border ${
                        opt.is_correct
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="font-semibold text-slate-500">
                        {String.fromCharCode(65 + index)}
                      </div>

                      <div className="flex-1">
                        <div
                          dangerouslySetInnerHTML={safeHTML(opt.option_text)}
                        />
                        {opt.option_image && (
                          <img
                            src={opt.option_image}
                            className="mt-2 max-h-40 rounded border"
                            alt="Option"
                          />
                        )}
                      </div>

                      {opt.is_correct && (
                        <CheckCircle className="text-emerald-600 w-5 h-5 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* explanation */}
            {q.explanation && (
              <div className="bg-white rounded border p-6">
                <h2 className="text-sm font-semibold mb-3 text-slate-600 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Explanation
                </h2>

                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={safeHTML(q.explanation)}
                />
              </div>
            )}
          </section>

          {/* -------- right: metadata ------- */}
          <aside className="space-y-6">
            <div className="bg-white rounded border p-6">
              <h2 className="text-sm font-semibold mb-4 text-slate-600">
                Metadata
              </h2>

              <MetaRow label="Subject" value={q.subject || "-"} />
              <MetaRow label="Topic" value={q.topic || "-"} />
              <MetaRow label="Difficulty" value={q.difficulty} />
              <MetaRow
                label="Type"
                value={q.question_type?.toUpperCase()}
              />

              <div className="mt-4 pt-4 border-t grid grid-cols-2 text-sm">
                <div>
                  <p className="text-slate-500">Marks</p>
                  <p className="font-semibold text-emerald-600">
                    +{q.marks || 1}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Negative</p>
                  <p className="font-semibold text-red-600">
                    -{q.negative_marks || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-900">
              Used in <b>4 active exams</b>. Editing may impact results.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------ meta row ------------------------------ */
function MetaRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm mb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
