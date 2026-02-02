"use client";

import { useEffect, useState } from "react";

export default function TestSettings({ examId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    shuffle_questions: true,
    shuffle_options: true,
    allow_section_switch: true,
    allow_review: true,
    negative_marking: false,
    show_result_after_submit: false,
    instructions: "",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/tests/${examId}/settings`);
      const data = await res.json();

      if (data) setForm(data);
      setLoading(false);
    }
    load();
  }, [examId]);

  function toggle(k) {
    setForm({ ...form, [k]: !form[k] });
    setError("");
    setMsg("");
  }

  function update(k, v) {
    setForm({ ...form, [k]: v });
    setError("");
    setMsg("");
  }

  async function save() {
    setSaving(true);
    setError("");
    setMsg("");

    const res = await fetch(`/api/tests/${examId}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    setSaving(false);

    if (!res.ok) {
      setError(data.message || "Failed to save settings");
      return;
    }

    setMsg("✅ Test settings saved");
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {msg && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {msg}
        </div>
      )}

      {/* Toggles */}
      <Toggle
        label="Shuffle Questions"
        desc="Randomize question order for each student"
        checked={form.shuffle_questions}
        onChange={() => toggle("shuffle_questions")}
      />

      <Toggle
        label="Shuffle Options"
        desc="Randomize options order for MCQ/SCQ"
        checked={form.shuffle_options}
        onChange={() => toggle("shuffle_options")}
      />

      <Toggle
        label="Allow Section Switching"
        desc="Students can switch between sections"
        checked={form.allow_section_switch}
        onChange={() => toggle("allow_section_switch")}
      />

      <Toggle
        label="Allow Review"
        desc="Students can mark questions for review"
        checked={form.allow_review}
        onChange={() => toggle("allow_review")}
      />

      <Toggle
        label="Enable Negative Marking"
        desc="Apply negative marks for wrong answers"
        checked={form.negative_marking}
        onChange={() => toggle("negative_marking")}
      />

      <Toggle
        label="Show Result After Submit"
        desc="Immediately show result after submission"
        checked={form.show_result_after_submit}
        onChange={() => toggle("show_result_after_submit")}
      />

      {/* Instructions */}
      <div>
        <label className="text-xs font-semibold text-gray-600">
          Exam Instructions
        </label>
        <textarea
          rows={5}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Instructions shown before exam starts..."
          value={form.instructions || ""}
          onChange={(e) => update("instructions", e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3">
      <div>
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition
          ${checked ? "bg-blue-600" : "bg-gray-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition
            ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}
