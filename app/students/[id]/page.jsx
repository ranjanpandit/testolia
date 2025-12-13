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

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch(`/api/students/${id}`);
    const data = await res.json();

    setStudent(data.student);
    setDocs(data.documents);
    setResponse(data.response);

    setForm(data.student); // Pre-fill edit form
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
          <>
            <Link href={`/students`}>
              <Button variant="outline">Back </Button>
            </Link>
            <Link href={`/students/${id}/assign-class`}>
              <Button variant="outline">🏫 Assign / Change Class</Button>
            </Link>
            <Button onClick={() => setEditMode(true)}>✏ Edit</Button>
          </>
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
      <section className="border p-4 rounded shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-4">Personal Details</h2>

        {!editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Student Code:</strong> {student.student_code}
            </p>
            <p>
              <strong>First Name:</strong> {student.first_name}
            </p>
            <p>
              <strong>Last Name:</strong> {student.last_name}
            </p>
            <p>
              <strong>Email:</strong> {student.email}
            </p>
            <p>
              <strong>Phone:</strong> {student.phone}
            </p>
            <p>
              <strong>DOB:</strong> {student.dob || "—"}
            </p>
            <p>
              <strong>Gender:</strong> {student.gender || "—"}
            </p>
            <p>
              <strong>Class:</strong> {student.class_name || "—"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input
              type="date"
              value={form.dob || ""}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
            <select
              className="border p-2 rounded"
              value={form.gender || ""}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        )}
      </section>

      {/* ADDRESS */}
      <section className="border p-4 rounded shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-4">Address</h2>

        {!editMode ? (
          <>
            <p>
              <strong>Address:</strong> {student.address || "—"}
            </p>
            <p>
              <strong>City:</strong> {student.city || "—"}
            </p>
            <p>
              <strong>State:</strong> {student.state || "—"}
            </p>
            <p>
              <strong>Country:</strong> {student.country || "—"}
            </p>
          </>
        ) : (
          <>
            <Input
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Address"
            />
            <Input
              value={form.city || ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="City"
            />
            <Input
              value={form.state || ""}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="State"
            />
            <Input
              value={form.country || ""}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="Country"
            />
          </>
        )}
      </section>

      {/* DOCUMENTS */}
      <section className="border p-4 rounded shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>

        {docs.length === 0 ? (
          <p>No documents uploaded</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="flex justify-between items-center">
                <span>
                  {d.original_name} ({d.type})
                </span>
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

      {/* APPLICATION RESPONSE */}
      {response && (
        <section className="border p-4 rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-4">Application Form Data</h2>

          <pre className="bg-gray-900 text-white p-4 rounded text-sm overflow-auto">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
