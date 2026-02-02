"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  Timer,
  Trophy,
  CalendarDays,
  ChevronLeft,
  Save,
  Loader2,
  Settings,
  BookOpen,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AddTest() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration_minutes: "",
    total_questions: "",
    total_marks: "",
    start_time: "",
    end_time: "",
    status: "draft",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!form.title || !form.duration_minutes) {
      toast.error("Title and duration are mandatory.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration_minutes: Number(form.duration_minutes),
        }),
      });

      if (!res.ok) throw new Error("Sync failure");

      toast.success("Test configuration saved.");
      setForm({
        title: "",
        description: "",
        duration_minutes: "",
        total_questions: "",
        total_marks: "",
        start_time: "",
        end_time: "",
        status: "draft",
      });
    } catch {
      toast.error("Unable to save test.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* ================= TOP COMMAND BAR ================= */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-700">
        <div className="max-w-[1500px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tests">
              <button className="p-2 rounded border border-slate-700 hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </Link>

            <div>
              <h1 className="text-sm font-semibold uppercase tracking-widest">
                Examination Console
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider">
                Test Creation & Deployment
              </p>
            </div>
          </div>

          <Button
            onClick={save}
            disabled={saving}
            className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold uppercase tracking-widest border-b-4 border-indigo-900"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Test
              </>
            )}
          </Button>
        </div>
      </header>

      {/* ================= MAIN GRID ================= */}
      <main className="max-w-[1500px] mx-auto px-8 py-10 grid grid-cols-1 xl:grid-cols-12 gap-10">

        {/* ================= LEFT COLUMN ================= */}
        <section className="xl:col-span-8 space-y-8">

          {/* TEST IDENTITY */}
          <Panel title="Test Identification" icon={<BookOpen className="w-4 h-4" />}>
            <Field label="Test Name / Code">
              <Input
                className="h-12 text-base font-semibold"
                placeholder="JEE ADVANCED – MOCK TEST 01"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>

            <Field label="Instructions for Candidates">
              <Textarea
                className="min-h-[160px] text-sm leading-relaxed"
                placeholder="Marking scheme, navigation rules, calculator usage, negative marking..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
          </Panel>

          {/* SCHEDULING */}
          <Panel title="Test Availability Window" icon={<CalendarDays className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Start Date & Time">
                <Input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => update("start_time", e.target.value)}
                />
              </Field>
              <Field label="End Date & Time">
                <Input
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => update("end_time", e.target.value)}
                />
              </Field>
            </div>
          </Panel>
        </section>

        {/* ================= RIGHT COLUMN ================= */}
        <aside className="xl:col-span-4 space-y-8">

          {/* EXAM PARAMETERS */}
          <Panel
            dark
            title="Examination Parameters"
            icon={<Settings className="w-4 h-4" />}
          >
            <Matrix
              icon={<Timer className="w-4 h-4" />}
              label="Duration"
              unit="Minutes"
              value={form.duration_minutes}
              onChange={(v) => update("duration_minutes", v)}
            />

            <Matrix
              icon={<Monitor className="w-4 h-4" />}
              label="Total Questions"
              unit="Count"
              value={form.total_questions}
              onChange={(v) => update("total_questions", v)}
            />

            <Matrix
              icon={<Trophy className="w-4 h-4" />}
              label="Maximum Marks"
              unit="Marks"
              value={form.total_marks}
              onChange={(v) => update("total_marks", v)}
            />

            <div className="pt-4 border-t border-slate-700">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Deployment Mode
              </label>
              <select
                className="mt-2 w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-xs uppercase tracking-widest"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="draft">Draft (Internal)</option>
                <option value="published">Live (Student Facing)</option>
              </select>
            </div>
          </Panel>

          {/* INTEGRITY NOTICE */}
          <div className="border border-amber-300 bg-amber-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Integrity Advisory
              </h3>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Ensure that maximum marks match the sum of question marks across all
              sections. Any mismatch may affect ranking normalization.
            </p>
          </div>

          {/* SECURITY */}
          <div className="border border-emerald-300 bg-emerald-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                Security Ready
              </h3>
            </div>
            <p className="text-[11px] text-emerald-700">
              Proctoring, time-lock, and response autosave are enabled by default.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ================== UI HELPERS ================== */

function Panel({ title, icon, children, dark }) {
  return (
    <section
      className={`rounded-lg border shadow-sm ${
        dark ? "bg-slate-900 text-white border-slate-700" : "bg-white"
      }`}
    >
      <div
        className={`px-6 py-4 border-b flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
          dark ? "border-slate-700 text-slate-300" : "border-slate-200"
        }`}
      >
        {icon} {title}
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function Matrix({ icon, label, unit, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          {icon} {label}
        </p>
        <span className="text-[9px] text-indigo-400">{unit}</span>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-3 text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}
