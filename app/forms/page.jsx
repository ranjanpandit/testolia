"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function FormsList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD FORMS FROM API ----------------
  const loadForms = async () => {
    try {
      const res = await fetch("/api/forms");
      const data = await res.json();
      setForms(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  // ---------------- DELETE FORM ----------------
  const remove = async (id) => {
    if (!confirm("Delete this form permanently?")) return;

    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Form deleted successfully");
        loadForms();
      } else {
        toast.error("Failed to delete form");
      }
    } catch (err) {
      toast.error("Error deleting form");
    }
  };

  // ---------------- UI ----------------
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>

        <Link href="/form-builder">
          <Button>➕ Create New Form</Button>
        </Link>
      </div>

      {loading ? (
        <p className="opacity-50">Loading forms...</p>
      ) : forms.length === 0 ? (
        <p className="opacity-50">No forms created yet.</p>
      ) : (
        <div className="space-y-4">
          {forms.map((f) => (
            <div
              key={f.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{f.name}</h2>
                <p className="text-sm opacity-60">
                  Updated: {new Date(f.updatedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <Link href={`/form-builder?id=${f.id}`}>
                  <Button variant="outline">✏ Edit</Button>
                </Link>
                <Link href={`/form-preview/${(f.id)}`}>
                  <Button>👀 Preview</Button>
                </Link>

                <Button variant="destructive" onClick={() => remove(f.id)}>
                  🗑 Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
