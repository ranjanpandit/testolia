"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

export default function FieldSettings({ field, updateField, deleteField }) {
  if (!field) return <p className="opacity-50 p-4">Select a field to edit settings</p>;

  const updateConfig = (newConfig) => {
    updateField(field.id, { config: { ...field.config, ...newConfig } });
  };

  return (
    <div className="space-y-4 p-4 border-l bg-white dark:bg-gray-900">
      <h2 className="font-semibold text-lg">Field Settings</h2>

      {/* Label */}
      <div>
        <Label>Label</Label>
        <Input
          value={field.label}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
        />
      </div>

      {/* Placeholder (if allowed) */}
      {field.config.placeholder !== undefined && (
        <div>
          <Label>Placeholder</Label>
          <Input
            value={field.config.placeholder}
            onChange={(e) => updateConfig({ placeholder: e.target.value })}
          />
        </div>
      )}

      {/* Required Toggle */}
      <div className="flex items-center justify-between border p-2 rounded">
        <Label>Required</Label>
        <Switch
          checked={field.config.required}
          onCheckedChange={(val) => updateConfig({ required: val })}
        />
      </div>

      {/* Pattern */}
      {field.type === "text" || field.type === "email" || field.type === "number" ? (
        <>
          <div>
            <Label>Validation Pattern (RegEx)</Label>
            <Input
              placeholder="Enter regex pattern e.g. ^[0-9]{10}$"
              value={field.config.pattern || ""}
              onChange={(e) => updateConfig({ pattern: e.target.value })}
            />
          </div>

          <div>
            <Label>Pattern Message</Label>
            <Input
              placeholder="Message shown when pattern fails"
              value={field.config.patternMessage || ""}
              onChange={(e) => updateConfig({ patternMessage: e.target.value })}
            />
          </div>
        </>
      ) : null}

      {/* Min / Max (for number or date) */}
      {(field.type === "number" || field.type === "date") && (
        <>
          <div>
            <Label>Minimum Value</Label>
            <Input
              type={field.type}
              value={field.config.min || ""}
              onChange={(e) => updateConfig({ min: e.target.value })}
            />
          </div>

          <div>
            <Label>Maximum Value</Label>
            <Input
              type={field.type}
              value={field.config.max || ""}
              onChange={(e) => updateConfig({ max: e.target.value })}
            />
          </div>
        </>
      )}

      {/* Accept (for file inputs) */}
      {field.type === "file" && (
        <div>
          <Label>Accept File Types</Label>
          <Input
            placeholder="e.g. .pdf, image/*"
            value={field.config.accept || ""}
            onChange={(e) => updateConfig({ accept: e.target.value })}
          />
        </div>
      )}

      {/* Options (select / radio) */}
      {Array.isArray(field.config.options) && (
        <div className="space-y-2">
          <Label>Options</Label>
          {field.config.options.map((opt, i) => (
            <Input
              key={i}
              value={opt}
              onChange={(e) => {
                const updated = [...field.config.options];
                updated[i] = e.target.value;
                updateConfig({ options: updated });
              }}
            />
          ))}

          <Button
            variant="outline"
            onClick={() =>
              updateConfig({ options: [...field.config.options, "New Option"] })
            }
          >
            + Add Option
          </Button>
        </div>
      )}

      {/* Delete Field */}
      <Button
        variant="destructive"
        className="flex gap-2 w-full mt-4"
        onClick={() => deleteField(field.id)}
      >
        <Trash size={16} /> Delete Field
      </Button>
    </div>
  );
}
