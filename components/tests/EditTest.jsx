"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditTest({ examId }) {
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load data
  useEffect(() => {
    async function loadTest() {
      try {
        const res = await fetch(`/api/tests/${examId}`);
        if (!res.ok) throw new Error("Failed to load test");

        const data = await res.json();

        const normalized = {
          title: data.title || "",
          description: data.description || "",
          start_time: data.start_time
            ? new Date(data.start_time).toISOString().slice(0, 16)
            : "",
          end_time: data.end_time
            ? new Date(data.end_time).toISOString().slice(0, 16)
            : "",
          duration_minutes: Number(data.duration_minutes) || "",
          total_questions: Number(data.total_questions) || "",
          total_marks: Number(data.total_marks) || "",
          status: data.status || "draft",
        };

        setForm(normalized);
        setOriginalForm(normalized);
      } catch (err) {
        toast.error("Could not load test configuration");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTest();
  }, [examId]);

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  const update = useCallback((key, value) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : null));
  }, []);

  const handleNumberChange = (key, value) => {
    const num = value === "" ? "" : Number(value);
    if (value !== "" && isNaN(num)) return;
    update(key, num);
  };

  const save = async () => {
    if (!form) return;

    // Basic client-side validation
    if (!form.title.trim()) {
      toast.error("Test title is required");
      return;
    }
    if (!form.start_time || !form.end_time) {
      toast.error("Start and end time are required");
      return;
    }
    if (form.duration_minutes === "" || form.duration_minutes <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        duration_minutes: form.duration_minutes || 0,
        total_questions: form.total_questions || 0,
        total_marks: form.total_marks || 0,
      };

      const res = await fetch(`/api/tests/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Test updated successfully");
      setOriginalForm(form);
    } catch (err) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && !confirm("Discard all changes?")) return;
    router.back();
  };

  if (loading || !form) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-lg font-medium">Loading test configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Edit Test
                </h1>
                <p className="text-sm text-muted-foreground">
                  ID: {examId} • {form.status === "published" ? "Live" : "Draft"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={save}
                disabled={saving || !hasChanges}
                className="gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left column – Main content */}
          <div className="lg:col-span-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Test Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g. Mid-Term Mathematics Assessment"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Candidate Instructions</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Enter instructions, rules, or important notes for candidates..."
                    className="min-h-[140px] resize-y"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Availability Window
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Time *</Label>
                    <Input
                      id="start"
                      type="datetime-local"
                      value={form.start_time}
                      onChange={(e) => update("start_time", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Time *</Label>
                    <Input
                      id="end"
                      type="datetime-local"
                      value={form.end_time}
                      onChange={(e) => update("end_time", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column – Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Exam Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <NumericField
                  icon={<Timer className="h-4 w-4" />}
                  label="Duration"
                  unit="minutes"
                  value={form.duration_minutes}
                  onChange={(v) => handleNumberChange("duration_minutes", v)}
                />

                <NumericField
                  icon={<History className="h-4 w-4" />}
                  label="Total Questions"
                  unit="questions"
                  value={form.total_questions}
                  onChange={(v) => handleNumberChange("total_questions", v)}
                />

                <NumericField
                  icon={<Trophy className="h-4 w-4" />}
                  label="Maximum Marks"
                  unit="marks"
                  value={form.total_marks}
                  onChange={(v) => handleNumberChange("total_marks", v)}
                />

                <div className="pt-4 border-t">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                    Status
                  </Label>
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="draft">Draft (not visible to students)</option>
                    <option value="published">Published (live)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/60">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-amber-800">
                      Important Notice
                    </h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      Changing settings of a live exam may interrupt students
                      currently taking the test. Consider pausing live sessions
                      first if necessary.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable number input component
function NumericField({ icon, label, unit, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 text-lg font-medium"
      />
    </div>
  );
}