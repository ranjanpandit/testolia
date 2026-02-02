"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  ChevronLeft,
  Loader2,
  Settings,
  Monitor,
  Trophy,
  Timer,
  CalendarDays,
  History,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EditTest({ examId }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* ================= LOAD TEST ================= */
  useEffect(() => {
    async function loadTest() {
      try {
        const res = await fetch(`/api/tests/${examId}`);
        const data = await res.json();

        if (data.start_time)
          data.start_time = new Date(data.start_time)
            .toISOString()
            .slice(0, 16);
        if (data.end_time)
          data.end_time = new Date(data.end_time)
            .toISOString()
            .slice(0, 16);

        setForm(data);
      } catch {
        toast.error("Failed to load test configuration");
      } finally {
        setLoading(false);
      }
    }
    loadTest();
  }, [examId]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ================= SAVE ================= */
  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/tests/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      toast.success("Test configuration updated");
    } catch {
      toast.error("Unable to update test");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">
        Loading Examination Blueprint…
      </div>
    );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* ================= COMMAND BAR ================= */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-700">
        <div className="max-w-[1500px] mx-auto px-8 py-4 flex justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded border border-slate-700 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div>
              <h1 className="text-sm font-semibold uppercase tracking-widest">
                Edit Examination
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider">
                Test ID #{examId}
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </header>

      {/* ================= MAIN GRID ================= */}
      <main className="max-w-[1500px] mx-auto px-8 py-10 grid grid-cols-1 xl:grid-cols-12 gap-10">

        {/* LEFT */}
        <section className="xl:col-span-8 space-y-8">
          <Panel title="Test Identification" icon={<Settings className="w-4 h-4" />}>
            <Field label="Test Title">
              <Input
                className="h-12 font-semibold"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>

            <Field label="Candidate Instructions">
              <Textarea
                className="min-h-[160px]"
                value={form.description || ""}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
          </Panel>

          <Panel title="Availability Window" icon={<CalendarDays className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Start Time">
                <Input
                  type="datetime-local"
                  value={form.start_time || ""}
                  onChange={(e) => update("start_time", e.target.value)}
                />
              </Field>
              <Field label="End Time">
                <Input
                  type="datetime-local"
                  value={form.end_time || ""}
                  onChange={(e) => update("end_time", e.target.value)}
                />
              </Field>
            </div>
          </Panel>
        </section>

        {/* RIGHT */}
        <aside className="xl:col-span-4 space-y-8">
          <Panel dark title="Examination Parameters" icon={<Monitor className="w-4 h-4" />}>
            <Matrix
              icon={<Timer className="w-4 h-4" />}
              label="Duration"
              unit="Minutes"
              value={form.duration_minutes}
              onChange={(v) => update("duration_minutes", v)}
            />
            <Matrix
              icon={<History className="w-4 h-4" />}
              label="Questions"
              unit="Count"
              value={form.total_questions}
              onChange={(v) => update("total_questions", v)}
            />
            <Matrix
              icon={<Trophy className="w-4 h-4" />}
              label="Max Marks"
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
                <option value="draft">Draft</option>
                <option value="published">Live</option>
              </select>
            </div>
          </Panel>

          {/* WARNING */}
          <div className="border border-amber-300 bg-amber-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Impact Warning
              </h3>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Editing an active test may affect students currently attempting
              this exam. Verify live sessions before saving.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ================= UI HELPERS ================= */

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
        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-3 text-lg font-black focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}
