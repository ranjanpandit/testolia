"use client";

import { useEffect, useState } from "react";
import QuestionEditor from "./QuestionEditor";

const MIN_OPTIONS = 4;

export default function AddQuestionOperator() {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [duplicateId, setDuplicateId] = useState(null);

  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");

  const [showExplanation, setShowExplanation] = useState(true);

  const [form, setForm] = useState({
    subject: "",
    topic: "",
    question_type: "scq",
    difficulty: "medium",
    marks: 1,
    negative_marks: 0,

    question_text: "",
    question_image: "",
    explanation: "",
    explanation_image: "",

    options: Array.from({ length: MIN_OPTIONS }, () => ({
      option_text: "",
      option_image: "",
      is_correct: 0,
      advanced: false, // ✅ IMPORTANT: rich text toggle
    })),
  });

  /* =========================
     LOAD SUBJECTS / TOPICS
  ========================== */
  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    if (!form.subject) {
      setTopics([]);
      return;
    }
    fetch(`/api/topics?subject=${encodeURIComponent(form.subject)}`)
      .then((r) => r.json())
      .then(setTopics)
      .catch(() => setTopics([]));
  }, [form.subject]);

  /* =========================
     HELPERS
  ========================== */
  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setMsg("");
    setDuplicateId(null);
  }

  function updateOption(i, key, value) {
    const options = [...form.options];
    options[i][key] = value;

    // SCQ → only one correct
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
     BULK PASTE
  ========================== */
  function parseBulkPaste() {
    setBulkError("");
    try {
      const rows = bulkText
        .trim()
        .split("\n")
        .map((r) => r.split("\t").map((c) => c.trim()))
        .filter((r) => r.length >= 4);

      if (!rows.length) throw new Error("No valid rows");

      const row = rows[0];
      const questionText = row[0];
      const correctText = row[row.length - 1];
      const optionTexts = row.slice(1, row.length - 1);

      const options = optionTexts.map((t) => ({
        option_text: t,
        option_image: "",
        is_correct: t === correctText ? 1 : 0,
        advanced: false,
      }));

      if (!options.some((o) => o.is_correct === 1)) {
        throw new Error("Correct option mismatch");
      }

      setForm((prev) => ({
        ...prev,
        question_text: questionText,
        options:
          options.length >= MIN_OPTIONS
            ? options
            : [
                ...options,
                ...Array.from(
                  { length: MIN_OPTIONS - options.length },
                  () => ({
                    option_text: "",
                    option_image: "",
                    is_correct: 0,
                    advanced: false,
                  }),
                ),
              ],
      }));

      setShowBulk(false);
      setBulkText("");
    } catch (e) {
      setBulkError(e.message);
    }
  }

  /* =========================
     VALIDATION
  ========================== */
  function validate() {
    if (!stripHtml(form.question_text)) return "Question is required";

    const filled = form.options.filter((o) =>
      stripHtml(o.option_text),
    ).length;
    if (filled < 2) return "Minimum 2 options required";

    const correct = form.options.filter((o) => o.is_correct === 1).length;
    if (form.question_type === "scq" && correct !== 1)
      return "Select exactly 1 correct option";
    if (form.question_type === "mcq" && correct < 1)
      return "Select at least 1 correct option";

    return null;
  }

  /* =========================
     SAVE
  ========================== */
  async function save() {
    setSaving(true);
    setError("");
    setMsg("");
    setDuplicateId(null);

    const v = validate();
    if (v) {
      setError(v);
      setSaving(false);
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

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.status === 409) {
      setError(data.message || "Duplicate detected");
      setDuplicateId(data.duplicate_id || null);
      setSaving(false);
      return;
    }

    if (!res.ok) {
      setError(data.message || "Failed to save");
      setSaving(false);
      return;
    }

    setMsg("✅ Question saved successfully");
    setSaving(false);

    setForm((prev) => ({
      ...prev,
      question_text: "",
      question_image: "",
      explanation: "",
      explanation_image: "",
      options: Array.from({ length: MIN_OPTIONS }, () => ({
        option_text: "",
        option_image: "",
        is_correct: 0,
        advanced: false,
      })),
    }));
  }

  /* =========================
     UI
  ========================== */
  return (
    <div className="max-w-6xl space-y-6">
      {/* HEADER */}
      <Header onBulk={() => setShowBulk(true)} onSave={save} saving={saving} />

      {/* ALERTS */}
      {error && (
        <Alert type="error">
          {error}
          {duplicateId && (
            <a
              href={`/question-bank/${duplicateId}/view`}
              className="ml-3 underline font-semibold"
            >
              View Duplicate
            </a>
          )}
        </Alert>
      )}
      {msg && <Alert type="success">{msg}</Alert>}

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
          <img
            src={form.question_image}
            className="max-h-40 rounded border"
          />
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
                  onClick={() =>
                    updateOption(idx, "advanced", !opt.advanced)
                  }
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
              <img
                src={opt.option_image}
                className="max-h-28 rounded border"
              />
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
                onChange={(html) =>
                  updateOption(idx, "option_text", html)
                }
              />
            )}
          </div>
        ))}
      </Section>

      {/* EXPLANATION */}
      <Section
        title="Explanation / Solution"
        subtitle="Optional – shown after submission"
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

      {/* BULK MODAL */}
      {showBulk && (
        <Modal onClose={() => setShowBulk(false)}>
          <h3 className="font-semibold mb-2">Bulk Paste (Excel)</h3>
          <textarea
            rows={8}
            className="w-full border rounded-lg p-3 text-sm font-mono"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          {bulkError && (
            <div className="text-red-600 text-sm mt-2">{bulkError}</div>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowBulk(false)}
              className="border rounded-lg px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={parseBulkPaste}
              className="bg-blue-600 text-white rounded-lg px-4 py-2"
            >
              Import
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================
   SMALL UI HELPERS
========================== */
function Header({ onBulk, onSave, saving }) {
  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border rounded-xl px-4 py-3 flex justify-between">
      <div>
        <h2 className="text-sm font-semibold">Add Question</h2>
        <p className="text-xs text-gray-500">Operator fast entry</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onBulk}
          className="border rounded-lg px-4 py-2 text-sm font-semibold"
        >
          📋 Bulk Paste
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-blue-600 rounded-lg px-4 py-2 text-sm font-semibold text-white"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function Alert({ type, children }) {
  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-green-200 bg-green-50 text-green-700";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

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
          {subtitle && (
            <div className="text-xs text-gray-500">{subtitle}</div>
          )}
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
      className={`cursor-pointer border rounded-lg px-3 py-2 text-xs ${
        small ? "" : "inline-block"
      }`}
    >
      Upload Image
      <input type="file" className="hidden" onChange={onChange} />
    </label>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
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
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
