"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SingleResponsePage() {
  const { id } = useParams();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [id]);

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
        body: JSON.stringify({ responseId: Number(id) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      alert(`Student created (id: ${data.studentId})`);
      // refresh
      load();
    } catch (err) {
      alert(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  if (!response) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Response #{id}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>Print</Button>
          <Button variant="destructive" onClick={() => {/* delete if needed */}}>Delete</Button>
          <Button onClick={approve} disabled={loading || response.status === "approved"}>
            {response.status === "approved" ? "Approved" : (loading ? "Processing..." : "Approve & Create Student")}
          </Button>
        </div>
      </div>

      {/* show preview of fields */}
      <div className="space-y-3">
        {Object.entries(response.data || {}).map(([k, v]) => (
          <div key={k} className="p-3 border rounded flex justify-between">
            <strong className="capitalize">{k}</strong>
            <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
