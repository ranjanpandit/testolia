"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  ChevronLeft,
  Settings2,
  ListChecks,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function TestSettings({ examId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instructionsList, setInstructionsList] = useState([]);
  const [selectedInstructionId, setSelectedInstructionId] = useState("none");

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
    async function loadData() {
      setLoading(true);
      try {
        const settingsRes = await fetch(`/api/tests/${examId}/settings`);
        if (!settingsRes.ok) throw new Error("Failed to load settings");
        const settingsData = await settingsRes.json();

        if (settingsData) {
          setForm(settingsData);
        }

        const instrRes = await fetch("/api/instructions");
        if (!instrRes.ok) throw new Error("Failed to load instructions");
        const instrData = await instrRes.json();

        setInstructionsList(instrData || []);

        if (settingsData?.instructions) {
          const matching = instrData.find(
            (i) => i.content === settingsData.instructions
          );
          setSelectedInstructionId(matching ? matching.id.toString() : "none");
        } else {
          setSelectedInstructionId("none");
        }
      } catch (err) {
        toast.error(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [examId]);

  const toggle = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInstructionChange = (value) => {
    setSelectedInstructionId(value);
    if (value === "none") {
      setForm((prev) => ({ ...prev, instructions: "" }));
      return;
    }
    const selected = instructionsList.find((i) => i.id.toString() === value);
    if (selected) {
      setForm((prev) => ({ ...prev, instructions: selected.content }));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tests/${examId}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Save failed");
      }

      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-lg font-medium">Loading test settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Test Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configure rules and behavior • Exam ID: {examId}
                </p>
              </div>
            </div>

            <Button
              onClick={save}
              disabled={saving}
              className="min-w-[140px] gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
              Exam Behavior & Rules
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-10">
              {/* Toggles Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Settings2 className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Assessment Settings</h3>
                </div>

                <div className="space-y-5 rounded-lg border bg-muted/20 p-6">
                  <SettingItem
                    label="Shuffle Questions"
                    description="Randomize question order for each candidate"
                    checked={form.shuffle_questions}
                    onCheckedChange={() => toggle("shuffle_questions")}
                  />
                  <Separator />

                  <SettingItem
                    label="Shuffle Options"
                    description="Randomize answer choices (MCQ/SCQ)"
                    checked={form.shuffle_options}
                    onCheckedChange={() => toggle("shuffle_options")}
                  />
                  <Separator />

                  <SettingItem
                    label="Allow Section Switching"
                    description="Candidates can move freely between sections"
                    checked={form.allow_section_switch}
                    onCheckedChange={() => toggle("allow_section_switch")}
                  />
                  <Separator />

                  <SettingItem
                    label="Allow Review / Marking"
                    description="Candidates can flag questions for later review"
                    checked={form.allow_review}
                    onCheckedChange={() => toggle("allow_review")}
                  />
                  <Separator />

                  <SettingItem
                    label="Enable Negative Marking"
                    description="Deduct marks for incorrect answers"
                    checked={form.negative_marking}
                    onCheckedChange={() => toggle("negative_marking")}
                  />
                  <Separator />

                  <SettingItem
                    label="Show Result Immediately"
                    description="Display score & answers right after submission"
                    checked={form.show_result_after_submit}
                    onCheckedChange={() => toggle("show_result_after_submit")}
                  />
                </div>
              </div>

              {/* Instructions Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <ListChecks className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Exam Instructions</h3>
                </div>

                <div className="space-y-6">
                  <Select
                    value={selectedInstructionId}
                    onValueChange={handleInstructionChange}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose instruction template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        — No predefined instructions —
                      </SelectItem>
                      {instructionsList.map((instr) => (
                        <SelectItem key={instr.id} value={instr.id.toString()}>
                          {instr.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Instruction Preview */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      Preview (how candidates will see it)
                    </Label>

                    {form.instructions ? (
                      <div
                        className="min-h-[300px] max-h-[500px] overflow-auto rounded-lg border bg-white p-6 text-sm leading-relaxed prose prose-sm sm:prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: form.instructions }}
                      />
                    ) : (
                      <div className="min-h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-muted/30 p-8 text-center text-muted-foreground">
                        <p className="text-sm">
                          Select an instruction template to see preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button (extra in content for mobile users) */}
            <div className="flex justify-end pt-10 border-t mt-10">
              <Button
                onClick={save}
                disabled={saving}
                className="min-w-[160px] gap-2"
                size="lg"
              >
                {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function SettingItem({ label, description, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="space-y-0.5 pr-4">
        <div className="text-sm font-medium leading-none">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}