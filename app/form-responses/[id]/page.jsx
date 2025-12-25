"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SingleResponsePage() {
  const { id } = useParams();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const res = await fetch(`/api/form-responses/${id}`);
    const data = await res.json();
    setResponse(data);
  }

  async function approve() {
    if (!confirm("Approve this application and create student record?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/create-students/from-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseId: Number(id) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      alert(`Student created (id: ${data.studentId})`);
      load();
    } catch (err) {
      alert(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  if (!response) return <p className="p-6">Loading...</p>;

  // ✅ use field_order if available, fallback to object keys
  const orderedKeys = Array.isArray(response.field_order)
    ? response.field_order
    : Object.keys(response.data || {});

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Response #{id}</h1>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>

          <Button variant="destructive">
            Delete
          </Button>

          <Button
            onClick={approve}
            disabled={loading || response.status === "approved"}
          >
            {response.status === "approved"
              ? "Approved"
              : loading
              ? "Processing..."
              : "Approve & Create Student"}
          </Button>
        </div>
      </div>

      {/* Response Data (ORDERED) */}
      <div className="space-y-4">
        {orderedKeys.map((key) => {
          const value = response.data?.[key];

          const isFile =
            typeof value === "string" &&
            value.startsWith("https://res.cloudinary.com/");
          const isImage =
            isFile && /\.(jpg|jpeg|png|gif|webp)$/i.test(value);

          return (
            <div
              key={key}
              className="p-3 border rounded flex items-center justify-between gap-4"
            >
              <strong className="capitalize">{key.replace(/_/g, " ")}</strong>

              <div className="text-right">
                {isImage ? (
                  <img
                    src={value}
                    alt={key}
                    className="w-24 h-24 object-cover rounded border"
                  />
                ) : isFile ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Download file
                  </a>
                ) : (
                  <span>{String(value)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
