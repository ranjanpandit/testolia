"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

/* ----------------------------------------
   DEFAULT THEME (MATCH STUDENT FORM)
---------------------------------------- */
const DEFAULT_THEME = {
  background: "#0f172a",
  card: "#1e293b",
  primary: "#2563eb",
  button: "#2563eb",
  text: "#ffffff",
};

export default function GeneratedForm({ schema }) {
  const [activeTab, setActiveTab] = useState(0);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  if (!schema || !schema.tabs) {
    return <p className="p-6">⏳ Preparing preview...</p>;
  }

  /* ----------------------------------------
     THEME (FROM SCHEMA OR DEFAULT)
  ---------------------------------------- */
  const theme = {
    background: schema.theme?.background || DEFAULT_THEME.background,
    card: schema.theme?.card || DEFAULT_THEME.card,
    primary: schema.theme?.primary || DEFAULT_THEME.primary,
    button: schema.theme?.button || DEFAULT_THEME.button,
    text: schema.theme?.text || DEFAULT_THEME.text,
  };

  /* ----------------------------------------
     CHANGE HANDLER
  ---------------------------------------- */
  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ----------------------------------------
     VALIDATE TAB BY INDEX
  ---------------------------------------- */
  const validateTabByIndex = (index) => {
    const fields = schema.tabs[index]?.fields || [];
    const newErrors = {};

    fields.forEach((field) => {
      const value = values[field.name];

      if (field.required && !value) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.pattern && value) {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
          newErrors[field.name] =
            field.patternMessage || `${field.label} is invalid`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }

    return true;
  };

  /* ----------------------------------------
     TAB CLICK (NO SKIP AHEAD)
  ---------------------------------------- */
  const handleTabClick = (idx) => {
    if (idx <= activeTab) {
      setActiveTab(idx);
      return;
    }

    for (let i = 0; i < idx; i++) {
      if (!validateTabByIndex(i)) {
        toast.error("Please complete previous section first");
        return;
      }
    }

    setActiveTab(idx);
  };

  /* ----------------------------------------
     SUBMIT (PREVIEW ONLY)
  ---------------------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    for (let i = 0; i < schema.tabs.length; i++) {
      if (!validateTabByIndex(i)) {
        setActiveTab(i);
        toast.error("Form has validation errors");
        return;
      }
    }

    toast.success("Preview validation successful!");
    console.log("Preview values:", values);
  };

  /* ----------------------------------------
     FIELD RENDER
  ---------------------------------------- */
  const renderField = (field) => {
    const value = values[field.name] || "";
    const error = errors[field.name];

    return (
      <div key={field.name} className="mb-5">
        <Label className="text-sm font-medium text-[var(--text)]">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        <div
          className="
            mt-2 flex items-center gap-3
            rounded-xl px-4 py-3
            bg-white/5 border border-white/20
            focus-within:border-[var(--primary)]
            focus-within:ring-1 focus-within:ring-[var(--primary)]
          "
        >
          {field.type === "textarea" ? (
            <Textarea
              rows={3}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-[var(--text)] resize-none"
            />
          ) : field.type === "select" ? (
            <select
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="bg-transparent text-sm text-[var(--text)] w-full outline-none"
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt} className="text-black">
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === "file" ? (
            <input
              type="file"
              accept={field.accept || "*"}
              onChange={(e) =>
                handleChange(field.name, e.target.files?.[0])
              }
              className="text-sm text-[var(--text)]"
            />
          ) : (
            <Input
              type={field.type}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-[var(--text)]"
            />
          )}
        </div>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  };

  /* ----------------------------------------
     UI
  ---------------------------------------- */
  return (
    <main
      style={{
        "--bg": theme.background,
        "--card": theme.card,
        "--primary": theme.primary,
        "--button": theme.button,
        "--text": theme.text,
      }}
      className="min-h-screen p-6 bg-[var(--bg)] text-[var(--text)]"
    >
      <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-[var(--card)] shadow-xl">

        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {schema.tabs.map((tab, idx) => (
            <Button
              key={idx}
              type="button"
              onClick={() => handleTabClick(idx)}
              className={`flex items-center gap-2 transition
                ${
                  idx === activeTab
                    ? "bg-[var(--primary)] text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
            >
              {tab.icon && <Icon icon={tab.icon} />}
              {tab.title}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {schema.tabs[activeTab].fields.map(renderField)}

          <Button
            type="submit"
            className="mt-8 w-full bg-[var(--button)] hover:brightness-110"
          >
            Validate Preview
          </Button>
        </form>
      </div>
    </main>
  );
}
