"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GeneratedForm from "@/components/form/GeneratedForm";

export default function PreviewFormPage() {
  const { id } = useParams();
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);

  // ------------------ LOAD FORM FROM API ------------------
  useEffect(() => {
    const loadForm = async () => {
      try {
        const res = await fetch(`/api/forms/${id}`);

        if (!res.ok) {
          setError("Form not found!");
          return;
        }

        const form = await res.json();
        setSchema(form);

      } catch (err) {
        console.error(err);
        setError("Failed to load form");
      }
    };

    loadForm();
  }, [id]);

  // ------------------ ERROR STATES ------------------
  if (error) {
    return <p className="text-center p-10 text-red-600">{error}</p>;
  }

  if (!schema) {
    return <p className="text-center p-10">⏳ Loading form...</p>;
  }

  // ------------------ UI ------------------
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          📄 Preview: {schema.name}
        </h1>

        <Link href={`/form-builder?id=${schema.id}`}>
          <Button variant="outline">✏ Back to Builder</Button>
        </Link>
      </div>

      {/* Form Renderer */}
      <GeneratedForm schema={schema} />
    </div>
  );
}
