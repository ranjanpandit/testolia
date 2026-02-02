"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export default function SectionManager({ examId }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    section_name: "",
    total_questions: "",
    marks_per_question: 1,
    negative_marks: 0,
    duration_minutes: "",
    randomize: true,
  };

  const [form, setForm] = useState(emptyForm);

  function update(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  /* ================= LOAD ================= */
  async function loadSections() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tests/${examId}/sections`);
      const data = await res.json();
      setSections(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load sections");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSections();
  }, []);

  /* ================= CREATE ================= */
  async function addSection() {
    if (!form.section_name || !form.total_questions) {
      toast.error("Section name & total questions are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/tests/${examId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total_questions: Number(form.total_questions),
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Section created");
      setForm(emptyForm);
      loadSections();
    } catch {
      toast.error("Failed to add section");
    } finally {
      setSaving(false);
    }
  }

  /* ================= UPDATE ================= */
  function startEdit(section) {
    setEditingId(section.id);
    setForm({
      section_name: section.section_name,
      total_questions: section.total_questions,
      marks_per_question: section.marks_per_question,
      negative_marks: section.negative_marks,
      duration_minutes: section.duration_minutes || "",
      randomize: !!section.randomize,
    });
  }

  async function updateSection() {
    if (!form.section_name || !form.total_questions) {
      toast.error("Section name & total questions are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/sections/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total_questions: Number(form.total_questions),
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Section updated");
      cancelEdit();
      loadSections();
    } catch {
      toast.error("Failed to update section");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  /* ================= DELETE ================= */
  async function deleteSection(id) {
    if (!confirm("Delete this section? Questions must be removed first.")) return;

    try {
      const res = await fetch(`/api/sections/${id}`, { method: "DELETE" });

      if (res.status === 409) {
        toast.error("Remove assigned questions before deleting");
        return;
      }

      if (!res.ok) throw new Error();
      toast.success("Section deleted");
      loadSections();
    } catch {
      toast.error("Failed to delete section");
    }
  }

  return (
    <div className="space-y-8">

      {/* ================= ADD / EDIT FORM ================= */}
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
            {editingId ? "Edit Section" : "Create Section"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Input label="Section Name" value={form.section_name} onChange={(v) => update("section_name", v)} />
          <Input type="number" label="Questions" value={form.total_questions} onChange={(v) => update("total_questions", v)} />
          <Input type="number" label="Marks/Q" value={form.marks_per_question} onChange={(v) => update("marks_per_question", v)} />
          <Input type="number" label="Negative" value={form.negative_marks} onChange={(v) => update("negative_marks", v)} />
          <Input type="number" label="Duration (min)" value={form.duration_minutes} onChange={(v) => update("duration_minutes", v)} />
        </div>

        <div className="flex items-center justify-between mt-5">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.randomize}
              onChange={(e) => update("randomize", e.target.checked)}
            />
            Randomize questions
          </label>

          <div className="flex gap-3">
            {editingId && (
              <button onClick={cancelEdit} className="px-4 py-2 border rounded-lg text-sm font-semibold">
                <X className="w-4 h-4 inline mr-1" /> Cancel
              </button>
            )}
            <button
              onClick={editingId ? updateSection : addSection}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
            >
              {saving ? "Saving..." : editingId ? <><Save className="w-4 h-4 inline mr-1" /> Update</> : <><Plus className="w-4 h-4 inline mr-1" /> Add</>}
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECTION LIST ================= */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left">Section</th>
              <th className="px-5 py-4 text-center">Questions</th>
              <th className="px-5 py-4 text-center">Marks</th>
              <th className="px-5 py-4 text-center">Negative</th>
              <th className="px-5 py-4 text-center">Duration</th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading…</td></tr>
            ) : sections.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400">No sections created</td></tr>
            ) : (
              sections.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-4 font-semibold">{s.section_name}</td>
                  <td className="px-5 py-4 text-center">{s.total_questions}</td>
                  <td className="px-5 py-4 text-center">{s.marks_per_question}</td>
                  <td className="px-5 py-4 text-center">{s.negative_marks}</td>
                  <td className="px-5 py-4 text-center">{s.duration_minutes || "-"}</td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => startEdit(s)} className="text-indigo-600 hover:underline">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSection(s.id)} className="text-red-600 hover:underline">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <a
                        href={`/tests/${examId}/sections/${s.id}/questions`}
                        className="text-blue-600 hover:underline text-xs font-semibold"
                      >
                        Map Questions
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= SMALL INPUT ================= */
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}
