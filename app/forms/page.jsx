"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { usePermissionStore } from "@/lib/permissionStore";

export default function FormsList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changingStatusId, setChangingStatusId] = useState(null);

  const has = usePermissionStore((s) => s.has);

  const loadForms = async () => {
    try {
      const res = await fetch("/api/forms");
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
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

  const togglePublish = async (form) => {
    const nextStatus = form.status === "published" ? "draft" : "published";

    try {
      setChangingStatusId(form.id);
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          theme: form.theme,
          tabs: form.tabs,
          status: nextStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update publish status");
      }

      toast.success(
        nextStatus === "published"
          ? "Form published successfully"
          : "Form unpublished successfully"
      );
      loadForms();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update publish status");
    } finally {
      setChangingStatusId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forms</h1>
        {has("form.create") && (
          <Link href="/form-builder">
            <Button>Create New Form</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <p className="opacity-50">Loading forms...</p>
      ) : forms.length === 0 ? (
        <p className="opacity-50">No forms created yet.</p>
      ) : (
        <div className="space-y-4">
          {forms.map((f) => {
            const isPublished = f.status === "published";
            return (
              <div
                key={f.id}
                className="flex items-center justify-between rounded border p-4"
              >
                <div>
                  <h2 className="font-semibold">{f.name}</h2>
                  <p className="text-sm opacity-60">
                    Updated: {new Date(f.updatedAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs">
                    Status:{" "}
                    <span
                      className={isPublished ? "font-medium text-emerald-600" : "font-medium text-slate-600"}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {has("form.edit") && (
                    <Link href={`/form-builder?id=${f.id}`}>
                      <Button variant="outline">Edit</Button>
                    </Link>
                  )}

                  <Link href={`/form-preview/${f.id}`}>
                    <Button variant="outline">Preview</Button>
                  </Link>

                  <Link href={`/form-responses?formId=${f.id}`}>
                    <Button variant="outline">Check Responses</Button>
                  </Link>

                  {has("form.edit") && (
                    <Button
                      onClick={() => togglePublish(f)}
                      disabled={changingStatusId === f.id}
                    >
                      {isPublished ? "Unpublish" : "Publish"}
                    </Button>
                  )}

                  <Button variant="destructive" onClick={() => remove(f.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
