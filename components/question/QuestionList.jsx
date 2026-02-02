"use client";

import { useEffect, useState } from "react";

export default function QuestionList() {
  const [filters, setFilters] = useState({
    question_type: "",
    difficulty: "",
    subject: "",
    topic: "",
  });

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  function updateFilter(k, v) {
    setFilters({ ...filters, [k]: v });
    setPage(1); // ✅ reset page on filter change
  }

  async function loadQuestions() {
    setLoading(true);

    const params = new URLSearchParams();
    Object.keys(filters).forEach((k) => {
      if (filters[k]) params.set(k, filters[k]);
    });

    params.set("page", page);
    params.set("limit", limit);

    const res = await fetch(`/api/questions?${params.toString()}`);
    const data = await res.json();

    setQuestions(Array.isArray(data.data) ? data.data : []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => {
    loadQuestions();
  }, [filters, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Filters */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={filters.question_type}
            onChange={(e) => updateFilter("question_type", e.target.value)}
          >
            <option value="">All Types</option>
            <option value="scq">SCQ</option>
            <option value="mcq">MCQ</option>
            <option value="fill_blank">Fill Blank</option>
            <option value="integer">Integer</option>
            <option value="subjective">Subjective</option>
          </select>

          <select
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={filters.difficulty}
            onChange={(e) => updateFilter("difficulty", e.target.value)}
          >
            <option value="">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Search subject..."
            value={filters.subject}
            onChange={(e) => updateFilter("subject", e.target.value)}
          />

          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Search topic..."
            value={filters.topic}
            onChange={(e) => updateFilter("topic", e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">Question</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Subject</th>
              <th className="px-4 py-3 text-left font-semibold">Topic</th>
              <th className="px-4 py-3 text-left font-semibold">Difficulty</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No questions found
                </td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{q.id}</td>

                  <td className="px-4 py-3">
                    <div
                      className="max-w-[520px] line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: q.question_text }}
                    />
                  </td>

                  <td className="px-4 py-3 uppercase">{q.question_type}</td>
                  <td className="px-4 py-3">{q.subject || "-"}</td>
                  <td className="px-4 py-3">{q.topic || "-"}</td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                      {q.difficulty || "medium"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <a
                      href={`/question-bank/${q.id}/view`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                    <span className="mx-2 text-gray-300">|</span>
                    <a
                      href={`/question-bank/${q.id}/edit`}
                      className="text-gray-700 hover:underline"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
        <div className="text-gray-600">
          Page <b>{page}</b> of <b>{totalPages || 1}</b> — Total {total}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
