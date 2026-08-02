"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ELEMENTS } from "@/lib/formElements";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/builder/SortableItem";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FieldSettings from "@/components/builder/FieldSettings";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import PermissionGuard from "@/components/auth/PermissionGuard";

const ICONS = [
  "mdi:account",
  "mdi:school",
  "mdi:phone",
  "mdi:account-group",
  "mdi:folder-upload",
  "mdi:form-textbox",
  "mdi:email",
  "mdi:calendar",
];

const DEFAULT_THEME = {
  background: "#0f172a",
  card: "#1e293b",
  primary: "#2563eb",
  button: "#2563eb",
  text: "#ffffff",
};

function createClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toKey(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function buildFinalTabs(tabs, fields) {
  const tabIdCounts = new Map();

  return tabs.map((tab, index) => {
    const baseTabId = toKey(tab.title, `tab_${index + 1}`);
    const currentCount = tabIdCounts.get(baseTabId) || 0;
    tabIdCounts.set(baseTabId, currentCount + 1);
    const uniqueTabId =
      currentCount === 0 ? baseTabId : `${baseTabId}_${currentCount + 1}`;

    const fieldNameCounts = new Map();
    const tabFields = fields.filter((f) => f.tab === index);

    return {
      id: uniqueTabId,
      title: tab.title || `Tab ${index + 1}`,
      icon: tab.icon || "mdi:form-textbox",
      fields: tabFields.map((f, fieldIndex) => {
        const baseFieldName = toKey(f.label, `${f.type}_${fieldIndex + 1}`);
        const fieldCount = fieldNameCounts.get(baseFieldName) || 0;
        fieldNameCounts.set(baseFieldName, fieldCount + 1);
        const uniqueFieldName =
          fieldCount === 0
            ? baseFieldName
            : `${baseFieldName}_${fieldCount + 1}`;

        return {
          name: uniqueFieldName,
          label: f.label || "Untitled Field",
          type: f.type,
          required: Boolean(f.config?.required),
          placeholder: f.config?.placeholder || "",
          options: f.config?.options || null,
          accept: f.config?.accept || null,
          min: f.config?.min || null,
          max: f.config?.max || null,
          pattern: f.config?.pattern || null,
          patternMessage: f.config?.patternMessage || null,
        };
      }),
    };
  });
}

export default function FormBuilderClient() {
  const [tabs, setTabs] = useState([
    { title: "Untitled Tab", icon: "mdi:form-textbox" },
  ]);

  const [activeTab, setActiveTab] = useState(0);
  const [editingTab, setEditingTab] = useState(null);
  const [editingIcon, setEditingIcon] = useState(null);

  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [formName, setFormName] = useState("Untitled Form");
  const [formId, setFormId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const router = useRouter();

  const [theme, setTheme] = useState(DEFAULT_THEME);
  const lastSavedFingerprintRef = useRef("");

  const draftFingerprint = useMemo(
    () =>
      JSON.stringify({
        name: formName.trim(),
        theme,
        tabs: buildFinalTabs(tabs, fields),
      }),
    [formName, theme, tabs, fields]
  );

  const isDirty =
    lastSavedFingerprintRef.current !== "" &&
    draftFingerprint !== lastSavedFingerprintRef.current;

  useEffect(() => {
    if (!editId) return;

    let isMounted = true;
    setIsLoadingForm(true);

    const loadForm = async () => {
      try {
        const res = await fetch(`/api/forms/${editId}`);
        if (!res.ok) throw new Error("Could not load form for editing.");

        const existing = await res.json();
        if (!isMounted) return;

        if (!existing || !Array.isArray(existing.tabs)) {
          throw new Error("Form data is incomplete.");
        }

        const normalizedTheme =
          existing.theme && typeof existing.theme === "object"
            ? {
                background: existing.theme.background ?? DEFAULT_THEME.background,
                card: existing.theme.card ?? DEFAULT_THEME.card,
                primary: existing.theme.primary ?? DEFAULT_THEME.primary,
                button: existing.theme.button ?? DEFAULT_THEME.button,
                text: existing.theme.text ?? DEFAULT_THEME.text,
              }
            : DEFAULT_THEME;

        setFormName(existing.name || "Untitled Form");
        setFormId(existing.id ?? null);
        setTheme(normalizedTheme);

        const safeTabs =
          existing.tabs.length > 0
            ? existing.tabs.map((t, idx) => ({
                title: t?.title || `Tab ${idx + 1}`,
                icon: t?.icon || "mdi:form-textbox",
              }))
            : [{ title: "Untitled Tab", icon: "mdi:form-textbox" }];

        setTabs(safeTabs);
        setActiveTab(0);

        const rebuilt = existing.tabs.flatMap((tab, tabIndex) =>
          (tab?.fields || []).map((field) => ({
            id: createClientId(),
            type: field?.type || "text",
            label: field?.label || "Untitled Field",
            tab: tabIndex,
            config: {
              required: Boolean(field?.required),
              placeholder: field?.placeholder || "",
              options: field?.options || null,
              accept: field?.accept || null,
              min: field?.min || null,
              max: field?.max || null,
              pattern: field?.pattern || null,
              patternMessage: field?.patternMessage || null,
            },
          }))
        );

        setFields(rebuilt);
        setSelectedField(null);
        lastSavedFingerprintRef.current = JSON.stringify({
          name: (existing.name || "Untitled Form").trim(),
          theme: normalizedTheme,
          tabs: buildFinalTabs(safeTabs, rebuilt),
        });
        toast.success("Editing existing form");
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load form.");
      } finally {
        if (isMounted) setIsLoadingForm(false);
      }
    };

    loadForm();

    return () => {
      isMounted = false;
    };
  }, [editId]);

  useEffect(() => {
    if (!editId && lastSavedFingerprintRef.current === "") {
      lastSavedFingerprintRef.current = draftFingerprint;
    }
  }, [draftFingerprint, editId]);

  useEffect(() => {
    if (!isDirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!selectedField) return;
    const latest = fields.find((f) => f.id === selectedField.id);
    if (!latest) {
      setSelectedField(null);
      return;
    }
    if (latest !== selectedField) {
      setSelectedField(latest);
    }
  }, [fields, selectedField]);

  useEffect(() => {
    if (activeTab < tabs.length) return;
    setActiveTab(Math.max(0, tabs.length - 1));
  }, [tabs, activeTab]);

  const renameTab = (index, newName) => {
    setTabs((prev) => {
      const updated = [...prev];
      if (!updated[index]) return prev;
      updated[index] = {
        ...updated[index],
        title: newName?.trim() || "Untitled Tab",
      };
      return updated;
    });
  };

  const handleTabKey = (e) => {
    if (e.key === "Enter") e.target.blur();
  };

  const removeTab = (tabIndex) => {
    if (tabs.length === 1) {
      toast.error("At least one tab is required.");
      return;
    }

    const tabFieldsCount = fields.filter((f) => f.tab === tabIndex).length;
    if (
      tabFieldsCount > 0 &&
      !window.confirm(
        `This tab has ${tabFieldsCount} field(s). Delete tab and its fields?`
      )
    ) {
      return;
    }

    setTabs((prev) => prev.filter((_, i) => i !== tabIndex));
    setFields((prev) =>
      prev
        .filter((f) => f.tab !== tabIndex)
        .map((f) => (f.tab > tabIndex ? { ...f, tab: f.tab - 1 } : f))
    );
    setSelectedField((prev) => {
      if (!prev) return null;
      if (prev.tab === tabIndex) return null;
      return prev.tab > tabIndex ? { ...prev, tab: prev.tab - 1 } : prev;
    });
    setActiveTab((prev) => {
      if (prev < tabIndex) return prev;
      return Math.max(0, prev - 1);
    });
    setEditingTab(null);
    setEditingIcon(null);
  };

  const addField = (type) => {
    const el = ELEMENTS.find((item) => item.type === type);
    if (!el) {
      toast.error("Unknown field type.");
      return;
    }

    const nextField = {
      id: createClientId(),
      type,
      label: el.default || "Untitled Field",
      tab: activeTab,
      config: structuredClone(el.config),
    };

    setFields((prev) => [...prev, nextField]);
    setSelectedField(nextField);
  };

  const updateField = (id, changes) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...changes } : f))
    );
  };

  const deleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedField((prev) => (prev?.id === id ? null : prev));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFields((prev) => {
      const activeTabFields = prev.filter((f) => f.tab === activeTab);
      const oldIndex = activeTabFields.findIndex((f) => f.id === active.id);
      const newIndex = activeTabFields.findIndex((f) => f.id === over.id);

      if (oldIndex < 0 || newIndex < 0) return prev;

      const reorderedTab = arrayMove(activeTabFields, oldIndex, newIndex);
      let tabPointer = 0;

      return prev.map((f) => {
        if (f.tab !== activeTab) return f;
        const replacement = reorderedTab[tabPointer];
        tabPointer += 1;
        return replacement;
      });
    });
  };

  const saveFormData = async () => {
    if (isSaving) return;

    const cleanName = formName.trim();
    if (!cleanName) {
      toast.error("Form name is required.");
      return;
    }

    if (fields.length === 0) {
      toast.error("Add at least one field before saving.");
      return;
    }

    const invalidPatternField = fields.find((f) => {
      if (!["text", "email", "number"].includes(f.type)) return false;
      if (!f.config?.pattern) return false;
      try {
        new RegExp(f.config.pattern);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidPatternField) {
      toast.error(`Invalid regex pattern in "${invalidPatternField.label}".`);
      return;
    }

    const invalidRangeField = fields.find((f) => {
      if (!["number", "date"].includes(f.type)) return false;
      const min = f.config?.min;
      const max = f.config?.max;
      if (min === null || min === "" || max === null || max === "") return false;
      return String(min) > String(max);
    });

    if (invalidRangeField) {
      toast.error(
        `Minimum cannot be greater than maximum in "${invalidRangeField.label}".`
      );
      return;
    }

    const emptyTabIndex = tabs.findIndex(
      (_, idx) => !fields.some((f) => f.tab === idx)
    );
    if (
      emptyTabIndex >= 0 &&
      !window.confirm(
        `"${tabs[emptyTabIndex].title || `Tab ${emptyTabIndex + 1}`}" has no fields. Save anyway?`
      )
    ) {
      return;
    }

    const finalTabs = buildFinalTabs(tabs, fields);

    const form = {
      id: formId,
      name: cleanName,
      theme,
      tabs: finalTabs,
    };

    const url = formId ? `/api/forms/${formId}` : "/api/forms";
    const method = formId ? "PUT" : "POST";

    try {
      setIsSaving(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Save failed. Please try again.");
      }

      const data = await res.json();
      setFormId(data.id);
      lastSavedFingerprintRef.current = JSON.stringify({
        name: cleanName,
        theme,
        tabs: finalTabs,
      });

      toast.success("Form saved!");
      router.push("/forms");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Unable to save form.");
    } finally {
      setIsSaving(false);
    }
  };

  const fieldsInTab = useMemo(
    () => fields.filter((f) => f.tab === activeTab),
    [fields, activeTab]
  );

  const handlePreviewClick = (event) => {
    if (!isDirty) return;
    const shouldContinue = window.confirm(
      "You have unsaved changes. Preview will show the last saved version. Continue?"
    );
    if (!shouldContinue) {
      event.preventDefault();
    }
  };

  return (
    <PermissionGuard permission="form.edit">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="h-fit p-4">
          <CardHeader>
            <CardTitle>Form Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ELEMENTS.map((el) => (
              <Button
                key={el.type}
                variant="outline"
                className="w-full"
                onClick={() => addField(el.type)}
                type="button"
              >
                + {el.label}
              </Button>
            ))}
          </CardContent>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Custom Theme</h3>
              <button
                type="button"
                onClick={() => setTheme(DEFAULT_THEME)}
                className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-900 hover:bg-gray-300"
              >
                Reset
              </button>
            </div>

            {Object.entries(theme).map(([key, value]) => (
              <div key={key} className="mb-2 flex items-center justify-between">
                <label className="text-sm capitalize">{key}</label>

                <input
                  type="color"
                  value={value}
                  onChange={(e) =>
                    setTheme((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="h-8 w-10 rounded border"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <CardHeader>
            <CardTitle>Form Layout</CardTitle>
          </CardHeader>

          <input
            className="mb-4 w-full rounded border p-2 text-xl font-semibold"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Form name"
          />

          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((tab, i) => (
              <div key={i} className="flex items-center gap-1">
                {editingTab === i ? (
                  <input
                    autoFocus
                    className="rounded border px-2 py-1"
                    defaultValue={tab.title}
                    onBlur={(e) => {
                      renameTab(i, e.target.value);
                      setEditingTab(null);
                    }}
                    onKeyDown={handleTabKey}
                  />
                ) : (
                  <Button
                    variant={i === activeTab ? "default" : "outline"}
                    onClick={() => setActiveTab(i)}
                    onDoubleClick={() => setEditingTab(i)}
                    className="flex items-center gap-2"
                    type="button"
                  >
                    <Icon icon={tab.icon} width={18} />
                    {tab.title}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingIcon(i)}
                  type="button"
                >
                  Icon
                </Button>

                <button
                  type="button"
                  onClick={() => removeTab(i)}
                  className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  title="Delete tab"
                >
                  Del
                </button>
              </div>
            ))}

            <Button
              variant="secondary"
              onClick={() =>
                setTabs((prev) => [
                  ...prev,
                  { title: `Tab ${prev.length + 1}`, icon: "mdi:form-textbox" },
                ])
              }
              type="button"
            >
              + Tab
            </Button>

            <div className="ml-auto flex gap-2">
              {isDirty && (
                <p className="self-center text-xs text-amber-600">Unsaved changes</p>
              )}
              <Button
                variant="outline"
                onClick={saveFormData}
                disabled={isSaving || isLoadingForm}
                type="button"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              {formId && (
                <Link href={`/form-preview/${formId}`} onClick={handlePreviewClick}>
                  <Button type="button">Preview</Button>
                </Link>
              )}
            </div>
          </div>

          {editingIcon !== null && (
            <div className="mb-4 space-y-2 rounded border bg-white p-3 shadow">
              <h3 className="font-semibold">Choose Icon</h3>

              <div className="grid grid-cols-4 gap-3">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    className="flex justify-center rounded border p-2 hover:bg-gray-100"
                    type="button"
                    onClick={() => {
                      if (!tabs[editingIcon]) return;
                      setTabs((prev) => {
                        const updated = [...prev];
                        updated[editingIcon] = {
                          ...updated[editingIcon],
                          icon,
                        };
                        return updated;
                      });
                      setEditingIcon(null);
                    }}
                  >
                    <Icon icon={icon} width={24} />
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEditingIcon(null)}
                type="button"
              >
                Close
              </Button>
            </div>
          )}

          <CardContent>
            {fieldsInTab.length === 0 ? (
              <p className="rounded border p-10 text-center opacity-50">
                Add fields to this tab
              </p>
            ) : (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fieldsInTab.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {fieldsInTab.map((field) => (
                      <div key={field.id} onClick={() => setSelectedField(field)}>
                        <SortableItem
                          field={field}
                          onDelete={deleteField}
                          onRename={(value) => updateField(field.id, { label: value })}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        <Card className="p-4">
          <FieldSettings
            field={selectedField}
            updateField={updateField}
            deleteField={deleteField}
          />
        </Card>
      </div>
    </PermissionGuard>
  );
}