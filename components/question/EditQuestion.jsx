"use client";

import { useEffect, useState } from "react";
import QuestionEditor from "./QuestionEditor";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, CheckCircle, Info } from "lucide-react";

const MIN_OPTIONS = 4;

export default function EditQuestionOperator({ id }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [showExplanation, setShowExplanation] = useState(true);
  const [form, setForm] = useState(null);

  /* =========================
     LOAD SUBJECTS
  ========================== */
  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, []);

  /* =========================
     LOAD QUESTION
  ========================== */
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/questions/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load question");
        setLoading(false);
        return;
      }

      const q = data.question;

      let opts = (data.options || []).map((o) => ({
        option_text: o.option_text || "",
        option_image: o.option_image || "",
        is_correct: o.is_correct ? 1 : 0,
        advanced: false,
      }));

      while (opts.length < MIN_OPTIONS) {
        opts.push({
          option_text: "",
          option_image: "",
          is_correct: 0,
          advanced: false,
        });
      }

      setForm({
        subject: q.subject || "",
        topic: q.topic || "",
        question_type: q.question_type || "scq",
        difficulty: q.difficulty || "medium",
        marks: q.marks ?? 1,
        negative_marks: q.negative_marks ?? 0,

        question_text: q.question_text || "",
        question_image: q.question_image || "",

        explanation: q.explanation || "",
        explanation_image: q.explanation_image || "",

        options: opts,
      });

      setLoading(false);
    }

    load();
  }, [id]);

  /* =========================
     LOAD TOPICS
  ========================== */
  useEffect(() => {
    if (!form?.subject) {
      setTopics([]);
      return;
    }

    fetch(`/api/topics?subject=${encodeURIComponent(form.subject)}`)
      .then((r) => r.json())
      .then(setTopics)
      .catch(() => setTopics([]));
  }, [form?.subject]);

  /* =========================
     HELPERS
  ========================== */
  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setMsg("");
  }

  function updateOption(i, key, value) {
    const options = [...form.options];
    options[i][key] = value;

    if (form.question_type === "scq" && key === "is_correct" && value === 1) {
      options.forEach((o, idx) => {
        if (idx !== i) o.is_correct = 0;
      });
    }

    update("options", options);
  }

  function addOption() {
    update("options", [
      ...form.options,
      { option_text: "", option_image: "", is_correct: 0, advanced: false },
    ]);
  }

  function removeOption(index) {
    if (form.options.length <= MIN_OPTIONS) return;
    const options = [...form.options];
    options.splice(index, 1);
    update("options", options);
  }

  /* =========================
     IMAGE UPLOAD
  ========================== */
  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data.url;
  }

  async function uploadField(field, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    update(field, url);
  }

  async function uploadOptionImage(i, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    updateOption(i, "option_image", url);
  }

  /* =========================
     SAVE
  ========================== */
  async function save() {
    setSaving(true);
    setError("");
    setMsg("");

    if (!stripHtml(form.question_text)) {
      setSaving(false);
      setError("Question is required");
      return;
    }

    const filled = form.options.filter((o) => stripHtml(o.option_text)).length;

    if (filled < 2) {
      setSaving(false);
      setError("Minimum 2 options required");
      return;
    }

    const correctCount = form.options.filter((o) => o.is_correct === 1).length;
    if (form.question_type === "scq" && correctCount !== 1) {
      setSaving(false);
      setError("Select exactly 1 correct option");
      return;
    }
    if (form.question_type === "mcq" && correctCount < 1) {
      setSaving(false);
      setError("Select at least 1 correct option");
      return;
    }

    const payload = {
      subject: form.subject,
      topic: form.topic,
      question_type: form.question_type,
      difficulty: form.difficulty,
      marks: Number(form.marks),
      negative_marks: Number(form.negative_marks),

      question_text: form.question_text,
      question_image: form.question_image || null,

      explanation: form.explanation || null,
      explanation_image: form.explanation_image || null,

      options: form.options.map((o) => ({
        option_text: o.option_text,
        option_image: o.option_image || null,
        is_correct: o.is_correct,
      })),
    };

    const res = await fetch(`/api/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message || "Update failed");
      return;
    }

    setMsg("✅ Question updated successfully");
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (!form) return <div className="text-red-600">Unable to load question</div>;

  /* =========================
     UI
  ========================== */
  return (
    <div className="max-w-6xl space-y-6">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border rounded-xl px-4 py-3 flex justify-between">
        <Link href="/question-bank">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
          </Button>
        </Link>
        <div>
          <h2 className="text-sm font-semibold">Edit Question</h2>
          <p className="text-xs text-gray-500">ID: {id}</p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {saving ? "Saving..." : "Update"}
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {msg && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {msg}
        </div>
      )}

      {/* META */}
      <Section title="Question Metadata">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <Select
            label="Subject"
            value={form.subject}
            onChange={(v) => update("subject", v)}
            options={subjects}
          />
          <Select
            label="Topic"
            value={form.topic}
            onChange={(v) => update("topic", v)}
            options={topics}
          />
          <Select
            label="Type"
            value={form.question_type}
            onChange={(v) => update("question_type", v)}
            options={[
              { id: "scq", name: "SCQ" },
              { id: "mcq", name: "MCQ" },
            ]}
          />
          <Input
            label="Marks"
            value={form.marks}
            onChange={(v) => update("marks", v)}
          />
          <Input
            label="Negative"
            value={form.negative_marks}
            onChange={(v) => update("negative_marks", v)}
          />
        </div>
      </Section>

      {/* QUESTION */}
      <Section title="Question">
        <UploadButton onChange={(e) => uploadField("question_image", e)} />
        {form.question_image && (
          <img src={form.question_image} className="max-h-40 rounded border" />
        )}
        <QuestionEditor
          value={form.question_text}
          onChange={(html) => update("question_text", html)}
        />
      </Section>

      {/* OPTIONS */}
      <Section
        title="Options"
        action={
          <button
            onClick={addOption}
            className="bg-gray-900 text-white rounded-lg px-3 py-2 text-xs"
          >
            + Add Option
          </button>
        }
      >
        {form.options.map((opt, idx) => (
          <div key={idx} className="border rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-sm">Option {idx + 1}</div>
              <div className="flex gap-3 items-center text-xs">
                <input
                  type={form.question_type === "scq" ? "radio" : "checkbox"}
                  checked={opt.is_correct === 1}
                  onChange={(e) =>
                    updateOption(idx, "is_correct", e.target.checked ? 1 : 0)
                  }
                />
                <UploadButton
                  small
                  onChange={(e) => uploadOptionImage(idx, e)}
                />
                <button
                  onClick={() => updateOption(idx, "advanced", !opt.advanced)}
                  className="text-blue-600 font-semibold"
                >
                  {opt.advanced ? "Simple" : "Advanced"}
                </button>
                <button
                  onClick={() => removeOption(idx)}
                  disabled={form.options.length <= MIN_OPTIONS}
                  className="text-red-600 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>

            {opt.option_image && (
              <img src={opt.option_image} className="max-h-28 rounded border" />
            )}

            {!opt.advanced ? (
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={opt.option_text}
                onChange={(e) =>
                  updateOption(idx, "option_text", e.target.value)
                }
              />
            ) : (
              <QuestionEditor
                value={opt.option_text}
                onChange={(html) => updateOption(idx, "option_text", html)}
              />
            )}
          </div>
        ))}
      </Section>

      {/* EXPLANATION */}
      <Section
        title="Explanation / Solution"
        subtitle="Optional – shown in review & result"
        collapsible
        open={showExplanation}
        onToggle={() => setShowExplanation(!showExplanation)}
      >
        <UploadButton onChange={(e) => uploadField("explanation_image", e)} />
        {form.explanation_image && (
          <img
            src={form.explanation_image}
            className="max-h-40 rounded border"
          />
        )}
        <QuestionEditor
          value={form.explanation}
          onChange={(html) => update("explanation", html)}
        />
      </Section>
    </div>
  );
}

/* =========================
   SMALL UI HELPERS
========================== */
function Section({
  title,
  subtitle,
  action,
  children,
  collapsible,
  open,
  onToggle,
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div
        className="border-b px-4 py-3 flex justify-between items-center"
        onClick={collapsible ? onToggle : undefined}
      >
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
        {action ||
          (collapsible && (
            <span className="text-xs text-blue-600 font-semibold">
              {open ? "Hide" : "Show"}
            </span>
          ))}
      </div>
      {(!collapsible || open) && (
        <div className="p-4 space-y-3">{children}</div>
      )}
    </div>
  );
}

function UploadButton({ onChange, small }) {
  return (
    <label
      className={`cursor-pointer border rounded-lg px-3 py-2 text-xs ${small ? "" : "inline-block"}`}
    >
      Upload Image
      <input type="file" className="hidden" onChange={onChange} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="md:col-span-3">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <select
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div className="md:col-span-2">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        type="number"
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
