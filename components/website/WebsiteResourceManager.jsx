"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, RefreshCw, Trash2 } from "lucide-react";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function WebsiteResourceManager({
  title,
  description,
  endpoint,
  fields,
  columns,
  emptyText,
}) {
  const emptyForm = useMemo(
    () =>
      fields.reduce((values, field) => {
        values[field.name] = field.defaultValue ?? "";
        return values;
      }, {}),
    [fields]
  );

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(endpoint);
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialItems() {
      const res = await fetch(endpoint);
      const data = await res.json();

      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    }

    loadInitialItems();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm(
      fields.reduce((values, field) => {
        values[field.name] = item[field.name] ?? field.defaultValue ?? "";
        return values;
      }, {})
    );
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    await fetch(editingId ? `${endpoint}/${editingId}` : endpoint, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    resetForm();
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this item?")) return;
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <PermissionGuard permission="user.manage">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" onClick={load}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form onSubmit={save} className="rounded-md border bg-background p-5 space-y-4">
            <div>
              <h2 className="font-semibold">{editingId ? "Edit Item" : "Add Item"}</h2>
              <p className="text-sm text-muted-foreground">Changes are saved to the website database.</p>
            </div>

            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    value={form[field.name]}
                    required={field.required}
                    rows={field.rows || 4}
                    onChange={(e) => updateField(field.name, e.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    value={form[field.name]}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    onChange={(e) => updateField(field.name, e.target.value)}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                <Plus className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Update" : "Add"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>

          <div className="rounded-md border bg-background">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Saved Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {columns.map((column) => (
                      <th key={column.key} className="px-4 py-3 text-left font-medium">
                        {column.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-6 text-muted-foreground" colSpan={columns.length + 1}>
                        Loading...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-muted-foreground" colSpan={columns.length + 1}>
                        {emptyText}
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        {columns.map((column) => (
                          <td key={column.key} className="max-w-xs px-4 py-3 align-top">
                            {column.key === "status" ? (
                              <Badge variant={item.status === "active" ? "default" : "secondary"}>
                                {item.status}
                              </Badge>
                            ) : (
                              <span className="line-clamp-2">{item[column.key] || "-"}</span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
