"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  ChevronLeft,
  Loader2,
  BookOpen,
  CalendarDays,
  Timer,
  Monitor,
  Trophy,
  Settings,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddTest() {
  const router = useRouter();
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

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNumberChange = (key, value) => {
    if (value === "") {
      update(key, "");
      return;
    }
    const num = Number(value);
    if (!isNaN(num)) {
      update(key, num);
    }
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Test title is required");
      return;
    }
    if (!form.duration_minutes || form.duration_minutes <= 0) {
      toast.error("Duration must be greater than 0 minutes");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        duration_minutes: Number(form.duration_minutes) || 0,
        total_questions: Number(form.total_questions) || 0,
        total_marks: Number(form.total_marks) || 0,
      };

      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to create test");
      }

      toast.success("Test created successfully");
      router.push("/tests"); // or wherever your list is
    } catch (err) {
      toast.error(err.message || "Unable to create test");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      Object.values(form).some((v) => v !== "" && v !== "draft") &&
      !confirm("Discard this new test?")
    ) {
      return;
    }
    router.back();
  };

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
                  Create New Test
                </h1>
                <p className="text-sm text-muted-foreground">
                  Define exam details and scheduling
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                Create Test
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left – Main content */}
          <div className="lg:col-span-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Test Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title / Code *</Label>
                  <Input
                    id="title"
                    placeholder="JEE Advanced – Mock Test 01"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Instructions for Candidates
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Marking scheme • Negative marking • Calculator rules • Time management tips..."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="min-h-[160px] resize-y"
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
                    <Label htmlFor="start">Start Date & Time</Label>
                    <Input
                      id="start"
                      type="datetime-local"
                      value={form.start_time}
                      onChange={(e) => update("start_time", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Date & Time</Label>
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

          {/* Right – Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
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
                  icon={<Monitor className="h-4 w-4" />}
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
                    Deployment Status
                  </Label>
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="draft">
                      Draft (not visible to students)
                    </option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-amber-800">
                      Consistency Check
                    </h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      Make sure total marks match the sum of all question marks.
                      Mismatch may affect scoring and ranking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-emerald-800">
                      Security Defaults
                    </h3>
                    <p className="text-sm text-emerald-700">
                      Full-screen mode lock, auto-save, time-bound navigation,
                      and proctoring flags are enabled by default.
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

// Reusable numeric field
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
