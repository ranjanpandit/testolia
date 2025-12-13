"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

export default function GeneratedForm({ schema }) {
  const [activeTab, setActiveTab] = useState(0);
  const [values, setValues] = useState({});

  if (!schema || !schema.tabs) {
    return <p className="p-6">⏳ Preparing preview...</p>;
  }

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------------ VALIDATION ------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    let missing = [];
    let invalid = [];

    schema.tabs.forEach((tab) => {
      tab.fields.forEach((field) => {
        const value = values[field.name];

        if (field.required && !value) {
          missing.push(field.label);
        }

        if (field.pattern && value) {
          const regex = new RegExp(field.pattern);
          if (!regex.test(value)) {
            invalid.push(field.label);
          }
        }
      });
    });

    if (missing.length > 0) {
      toast.error(`Required fields missing: ${missing.join(", ")}`);
      return;
    }

    if (invalid.length > 0) {
      toast.error(`Invalid values: ${invalid.join(", ")}`);
      return;
    }

    console.log("Submitted:", values);
    toast.success("Form submitted successfully!");
  };

  // ------------------------ FIELD RENDER ------------------------
  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      required: field.required || false,
      value: values[field.name] || "",
      onChange: (e) => handleChange(field.name, e.target.value),
    };

    switch (field.type) {
      case "textarea":
        return <Textarea {...commonProps} rows="3" />;

      case "select":
        return (
          <select {...commonProps} className="border rounded p-2 w-full dark:bg-gray-800">
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-1">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.name}
                  value={opt}
                  checked={values[field.name] === opt}
                  onChange={() => handleChange(field.name, opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        );

      case "file":
        return (
          <input
            type="file"
            accept={field.accept || "*"}
            onChange={(e) => handleChange(field.name, e.target.files[0])}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            pattern={field.pattern || undefined}
            title={field.patternMessage || ""}
            min={field.min}
            max={field.max}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {schema.tabs.map((tab, idx) => (
          <Button
            key={tab.id}
            type="button"
            variant={idx === activeTab ? "default" : "outline"}
            onClick={() => setActiveTab(idx)}
            className="flex items-center gap-2"
          >
            {tab.icon && <Icon icon={tab.icon} width={18} />}
            {tab.title}
          </Button>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {schema.tabs[activeTab].fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <Label>
              {field.label}{" "}
              {field.required && <span className="text-red-600">*</span>}
            </Label>

            {renderField(field)}

            {field.patternMessage && (
              <p className="text-xs text-gray-500">{field.patternMessage}</p>
            )}
          </div>
        ))}
      </div>

      <Button type="submit" className="mt-6 w-full">
        Submit
      </Button>
    </form>
  );
}
