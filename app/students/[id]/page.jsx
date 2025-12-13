"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function StudentProfile() {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [docs, setDocs] = useState([]);
  const [response, setResponse] = useState(null);
  const [fee, setFee] = useState(null); // ✅ NEW

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch(`/api/students/${id}`);
    const data = await res.json();

    setStudent(data.student);
    setDocs(data.documents || []);
    setResponse(data.response || null);
    setFee(data.fee || null); // ✅ NEW

    setForm(data.student);
  };

  const handleSave = async () => {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      toast.error("Update failed");
      return;
    }

    toast.success("Student updated successfully!");
    setEditMode(false);
    load();
  };

  if (!student) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Student Profile — {student.first_name} {student.last_name}
        </h1>

        {!editMode ? (
          <div className="flex gap-2">
            <Link href="/students">
              <Button variant="outline">Back</Button>
            </Link>

            <Link href={`/students/${id}/assign-class`}>
              <Button variant="outline">🏫 Assign Class</Button>
            </Link>

            <Link href={`/students/${id}/assign-fee`}>
              <Button variant="outline">💰 Assign Fees</Button>
            </Link>

            <Button onClick={() => setEditMode(true)}>✏ Edit</Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button onClick={handleSave} className="bg-green-600">
              💾 Save
            </Button>
            <Button variant="outline" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* PERSONAL DETAILS */}
      <section className="border p-4 rounded bg-white">
        <h2 className="text-lg font-semibold mb-4">Personal Details</h2>

        {!editMode ? (
          <div className="grid grid-cols-2 gap-4">
            <p>
              <b>Student Code:</b> {student.student_code}
            </p>
            <p>
              <b>Email:</b> {student.email}
            </p>
            <p>
              <b>Phone:</b> {student.phone}
            </p>
            <p>
              <b>DOB:</b> {student.dob || "—"}
            </p>
            <p>
              <b>Gender:</b> {student.gender || "—"}
            </p>
            <p>
              <b>Class:</b> {student.class_name || "—"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={form.first_name || ""}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder="First Name"
            />
            <Input
              value={form.last_name || ""}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder="Last Name"
            />
            <Input
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
            />
            <Input
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
            />
          </div>
        )}
      </section>

      {/* FEES */}
      <section className="border p-4 rounded bg-white">
        <h2 className="text-lg font-semibold mb-4">Fees</h2>

        {!fee ? (
          <p className="text-red-600">Fees not assigned yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <p>
              <b>Total:</b> ₹{fee.total_amount}
            </p>
            <p>
              <b>Paid:</b> ₹{fee.paid_amount}
            </p>
            <p>
              <b>Due:</b> ₹{fee.total_amount - fee.paid_amount}
            </p>
            <p>
              <b>Status:</b> {fee.status}
            </p>
          </div>
        )}

        <Link href={`/students/${id}/pay-fee`}>
          <Button className="mt-3">💳 Add Payment</Button>
        </Link>
        <Link href={`/students/${id}/fee-history `}>
          <Button variant="outline">Payment history</Button>
        </Link>
      </section>

      {/* DOCUMENTS */}
      <section className="border p-4 rounded bg-white">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>

        {docs.length === 0 ? (
          <p>No documents uploaded</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="flex justify-between">
                <span>{d.original_name}</span>
                <a
                  href={d.file_path}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* APPLICATION DATA */}
      {response && (
        <section className="border p-4 rounded bg-white">
          <h2 className="text-lg font-semibold mb-4">Application Form Data</h2>
          <pre className="bg-gray-900 text-white p-4 rounded text-sm overflow-auto">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
