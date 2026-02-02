"use client";

import { useEffect, useState } from "react";
import {
  Filter,
  CheckCircle2,
  PlusCircle,
  Layers,
  Loader2,
  ChevronLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SectionQuestionMapper({ sectionId }) {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [added, setAdded] = useState([]);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const router = useRouter();

  const [filters, setFilters] = useState({
    subject: "",
    topic: "",
    difficulty: "",
  });

  /* ================= LOAD DATA ================= */
  async function loadSection() {
    const res = await fetch(`/api/sections/${sectionId}`);
    const data = await res.json();
    setSection(data);
  }

  async function loadQuestionBank() {
    setLoading(true);
    const params = new URLSearchParams(filters);
    const res = await fetch(`/api/questions?${params.toString()}`);
    const data = await res.json();
    setQuestions(Array.isArray(data.data || data) ? (data.data || data) : []);
    setLoading(false);
  }

  async function loadAdded() {
    const res = await fetch(`/api/sections/${sectionId}/questions`);
    const data = await res.json();
    setAdded(data.map((q) => q.id));
  }

  useEffect(() => {
    loadSection();
    loadQuestionBank();
    loadAdded();
  }, [filters]);

  /* ================= ACTIONS ================= */
  function toggle(id) {
    if (!section) return;

    const alreadySelected = selected.includes(id);
    const limitReached = added.length + selected.length >= section.total_questions;

    if (!alreadySelected && limitReached) {
      toast.warning(`Section capacity (${section.total_questions}) reached`);
      return;
    }

    setSelected((prev) =>
      alreadySelected ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function addSelected() {
    if (!selected.length) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/sections/${sectionId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_ids: selected }),
      });

      if (!res.ok) throw new Error("Limit or validation failure");

      toast.success(`${selected.length} questions assigned`);
      setSelected([]);
      loadAdded();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function removeQuestion(qid) {
    if (!confirm("Remove this question from the section?")) return;

    try {
      const res = await fetch(`/api/sections/${sectionId}/questions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: qid }),
      });
      if (!res.ok) throw new Error("Removal failed");
      toast.success("Question removed");
      loadAdded();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const limitReached = section && added.length >= section.total_questions;
  const remaining = section ? section.total_questions - added.length : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 space-y-6">

      {/* ===== COMMAND HEADER ===== */}
      <header className="flex items-center justify-between bg-white border rounded-2xl px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-xl border bg-slate-50 hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight">
              Section Question Mapping
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Section ID · {sectionId}
            </p>
          </div>
        </div>

        <Button
          onClick={addSelected}
          disabled={!selected.length || limitReached || processing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-black uppercase text-[10px] tracking-widest shadow-lg"
        >
          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Selected ({selected.length})
            </>
          )}
        </Button>
      </header>

      {/* ===== CAPACITY STATUS ===== */}
      <section className={`rounded-2xl border p-6 flex items-center justify-between ${
        limitReached ? "bg-amber-50 border-amber-200" : "bg-indigo-50/50 border-indigo-100"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            limitReached ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
          }`}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Section Capacity
            </p>
            <p className="text-sm font-black">
              {added.length} / {section?.total_questions || 0} Assigned
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Remaining Slots
          </p>
          <p className={`text-sm font-black ${
            limitReached ? "text-amber-600" : "text-indigo-600"
          }`}>
            {limitReached ? "Full" : remaining - selected.length}
          </p>
        </div>
      </section>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* FILTERS */}
        <aside className="xl:col-span-3 bg-white border rounded-2xl p-6 shadow-sm space-y-5 h-fit sticky top-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Filters
            </h3>
          </div>

          <FilterInput label="Subject" onChange={(v) => setFilters({ ...filters, subject: v })} />
          <FilterInput label="Topic" onChange={(v) => setFilters({ ...filters, topic: v })} />

          <select
            className="w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-bold"
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </aside>

        {/* TABLE */}
        <section className="xl:col-span-9 bg-white border rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-5 w-20"></th>
                <th className="p-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Question
                </th>
                <th className="p-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Metadata
                </th>
                <th className="p-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-slate-400">
                    No questions found
                  </td>
                </tr>
              ) : (
                questions.map((q) => {
                  const already = added.includes(q.id);
                  const isSelected = selected.includes(q.id);

                  return (
                    <tr key={q.id} className={isSelected ? "bg-indigo-50/40" : "hover:bg-slate-50"}>
                      <td className="p-5 text-center">
                        <input
                          type="checkbox"
                          disabled={already || limitReached}
                          checked={isSelected}
                          onChange={() => toggle(q.id)}
                          className="w-5 h-5 text-indigo-600 rounded"
                        />
                      </td>

                      <td className="p-5 max-w-2xl">
                        <div
                          className="line-clamp-2 text-sm font-medium"
                          dangerouslySetInnerHTML={{ __html: q.question_text }}
                        />
                      </td>

                      <td className="p-5 text-[10px] uppercase font-bold text-slate-500">
                        {q.question_type} · {q.subject || "General"}
                      </td>

                      <td className="p-5 text-right">
                        {already ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">
                              <CheckCircle2 className="w-3 h-3 inline mr-1" />
                              Added
                            </span>
                            <button
                              onClick={() => removeQuestion(q.id)}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 uppercase italic">
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

/* ===== SUB COMPONENT ===== */
function FilterInput({ label, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <input
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
