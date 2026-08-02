"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const fields = [
  { name: "schoolName", label: "School / Coaching Name", required: true },
  { name: "tagline", label: "Tagline" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", type: "email" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "about", label: "About Website", type: "textarea", rows: 5 },
  { name: "facebookUrl", label: "Facebook URL" },
  { name: "instagramUrl", label: "Instagram URL" },
  { name: "youtubeUrl", label: "YouTube URL" },
];

const emptySettings = fields.reduce((values, field) => {
  values[field.name] = "";
  return values;
}, {});

export default function WebsiteSettingsForm() {
  const [form, setForm] = useState(emptySettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/website/settings")
      .then((res) => res.json())
      .then((data) => setForm({ ...emptySettings, ...data }));
  }, []);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/website/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) toast.success("Website settings updated");
  }

  return (
    <PermissionGuard permission="user.manage">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Website Settings</h1>
          <p className="text-sm text-muted-foreground">
            Update public website identity, contact details, and social links.
          </p>
        </div>

        <form onSubmit={save} className="rounded-md border bg-background p-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"}
              >
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    rows={field.rows || 3}
                    value={form[field.name]}
                    required={field.required}
                    onChange={(e) => updateField(field.name, e.target.value)}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type || "text"}
                    value={form[field.name]}
                    required={field.required}
                    onChange={(e) => updateField(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </div>
    </PermissionGuard>
  );
}
