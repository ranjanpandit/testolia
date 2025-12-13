"use client";

import { useState, useEffect } from "react";
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
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

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

export default function FormBuilder() {
  const [tabs, setTabs] = useState([
    { title: "Untitled Tab", icon: "mdi:form-textbox" }
  ]);

  const [activeTab, setActiveTab] = useState(0);
  const [editingTab, setEditingTab] = useState(null);
  const [editingIcon, setEditingIcon] = useState(null);

  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [formName, setFormName] = useState("Untitled Form");
  const [formId, setFormId] = useState(null);

  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  // -----------------------------------------------------
  // LOAD EXISTING FORM FOR EDIT
  // -----------------------------------------------------
  useEffect(() => {
    if (!editId) return;

    const loadForm = async () => {
      const res = await fetch(`/api/forms/${editId}`);
      const existing = await res.json();

      if (!existing || !existing.tabs) return;

      setFormName(existing.name);
      setFormId(existing.id);

      setTabs(existing.tabs.map((t) => ({
        title: t.title,
        icon: t.icon || "mdi:form-textbox"
      })));

      const rebuilt = existing.tabs.flatMap((tab, tabIndex) =>
        tab.fields.map((field) => ({
          id: Date.now() + Math.random(),
          type: field.type,
          label: field.label,
          tab: tabIndex,
          config: {
            required: field.required || false,
            placeholder: field.placeholder || "",
            options: field.options || null,
            accept: field.accept || null,
            min: field.min || null,
            max: field.max || null,
            pattern: field.pattern || null,
            patternMessage: field.patternMessage || null,
          },
        }))
      );

      setFields(rebuilt);
      toast.success("Editing existing form");
    };

    loadForm();
  }, [editId]);

  // -----------------------------------------------------
  // TAB TITLE RENAME
  // -----------------------------------------------------
  const renameTab = (index, newName) => {
    const updated = [...tabs];
    updated[index].title = newName || "Untitled Tab";
    setTabs(updated);
  };

  const handleTabKey = (e) => {
    if (e.key === "Enter") e.target.blur();
  };

  // -----------------------------------------------------
  // FIELD ACTIONS
  // -----------------------------------------------------
  const addField = (type) => {
    const el = ELEMENTS.find((e) => e.type === type);
    setFields([
      ...fields,
      {
        id: Date.now(),
        type,
        label: el.default,
        tab: activeTab,
        config: structuredClone(el.config),
      },
    ]);
  };

  const updateField = (id, changes) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...changes } : f)));
    if (selectedField?.id === id)
      setSelectedField({ ...selectedField, ...changes });
  };

  const deleteField = (id) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedField?.id === id) setSelectedField(null);
  };

  // -----------------------------------------------------
  // DRAG SORT
  // -----------------------------------------------------
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const tabFields = fields.filter((f) => f.tab === activeTab);
    const oldIndex = tabFields.findIndex((f) => f.id === active.id);
    const newIndex = tabFields.findIndex((f) => f.id === over.id);

    const reordered = arrayMove(tabFields, oldIndex, newIndex);

    const updated = fields.map((f) => {
      const found = reordered.find((x) => x.id === f.id);
      return found || f;
    });

    setFields(updated);
  };

  // -----------------------------------------------------
  // SAVE FORM TO DATABASE
  // -----------------------------------------------------
  const saveFormData = async () => {
    const finalTabs = tabs.map((tab, index) => ({
      id: tab.title.toLowerCase().replace(/\s+/g, "_"),
      title: tab.title,
      icon: tab.icon,
      fields: fields
        .filter((f) => f.tab === index)
        .map((f) => ({
          name: f.label.toLowerCase().replace(/\s+/g, "_"),
          label: f.label,
          type: f.type,
          required: f.config.required || false,
          placeholder: f.config.placeholder || "",
          options: f.config.options || null,
          accept: f.config.accept || null,
          min: f.config.min || null,
          max: f.config.max || null,
          pattern: f.config.pattern || null,
          patternMessage: f.config.patternMessage || null,
        })),
    }));

    const form = {
      id: formId,
      name: formName,
      tabs: finalTabs,
    };

    const url = formId ? `/api/forms/${formId}` : "/api/forms";
    const method = formId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setFormId(data.id);

    toast.success("Form saved!");
  };

  const fieldsInTab = fields.filter((f) => f.tab === activeTab);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

      {/* LEFT SIDEBAR */}
      <Card className="p-4 h-fit">
        <CardHeader><CardTitle>Form Controls</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {ELEMENTS.map((el) => (
            <Button key={el.type} variant="outline" className="w-full"
              onClick={() => addField(el.type)}>
              ➕ {el.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* MAIN BUILDER */}
      <Card className="md:col-span-2 p-6">
        <CardHeader><CardTitle>Form Layout</CardTitle></CardHeader>

        <input
          className="border p-2 rounded w-full text-xl font-semibold mb-4"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {tabs.map((tab, i) => (
            <div key={i} className="flex items-center gap-1">
              
              {editingTab === i ? (
                <input
                  autoFocus
                  className="border px-2 py-1 rounded"
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
                >
                  <Icon icon={tab.icon} width={18} />
                  {tab.title}
                </Button>
              )}

              {/* ICON PICKER BUTTON */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEditingIcon(i)}
              >
                🎨
              </Button>
            </div>
          ))}

          {/* Add Tab */}
          <Button
            variant="secondary"
            onClick={() =>
              setTabs([...tabs, { title: `Tab ${tabs.length + 1}`, icon: "mdi:form-textbox" }])
            }
          >
            + Tab
          </Button>

          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={saveFormData}>💾 Save</Button>
            {formId && (
              <Link href={`/form-preview/${formId}`}>
                <Button>👀 Preview</Button>
              </Link>
            )}
          </div>
        </div>

        {/* ICON PICKER POPUP */}
        {editingIcon !== null && (
          <div className="border p-3 rounded bg-white shadow space-y-2 mb-4">
            <h3 className="font-semibold">Choose Icon</h3>

            <div className="grid grid-cols-4 gap-3">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  className="p-2 border rounded hover:bg-gray-100 flex justify-center"
                  onClick={() => {
                    const updated = [...tabs];
                    updated[editingIcon].icon = icon;
                    setTabs(updated);
                    setEditingIcon(null);
                  }}
                >
                  <Icon icon={icon} width={24} />
                </button>
              ))}
            </div>

            <Button variant="outline" className="w-full" onClick={() => setEditingIcon(null)}>
              Close
            </Button>
          </div>
        )}

        {/* sortable fields */}
        <CardContent>
          {fieldsInTab.length === 0 ? (
            <p className="opacity-50 text-center p-10 border rounded">
              Add fields to this tab
            </p>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fieldsInTab} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {fieldsInTab.map((field) => (
                    <div key={field.id} onClick={() => setSelectedField(field)}>
                      <SortableItem field={field} onDelete={deleteField} />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* RIGHT SETTINGS PANEL */}
      <Card className="p-4">
        <FieldSettings
          field={selectedField}
          updateField={updateField}
          deleteField={deleteField}
        />
      </Card>

    </div>
  );
}
