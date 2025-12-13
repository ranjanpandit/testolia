"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddStudentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to create student");
      return;
    }

    toast.success("Student added successfully!");

    // redirect to student profile page
    router.push(`/students/${data.studentId}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Add New Student</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input
          placeholder="First Name *"
          value={form.first_name}
          onChange={(e) => handleChange("first_name", e.target.value)}
        />

        <Input
          placeholder="Last Name"
          value={form.last_name}
          onChange={(e) => handleChange("last_name", e.target.value)}
        />

        <Input
          placeholder="Email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />

        <Input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={form.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <Input
          type="date"
          value={form.dob}
          onChange={(e) => handleChange("dob", e.target.value)}
        />

        <Input
          placeholder="Address"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />

        <Input
          placeholder="City"
          value={form.city}
          onChange={(e) => handleChange("city", e.target.value)}
        />

        <Input
          placeholder="State"
          value={form.state}
          onChange={(e) => handleChange("state", e.target.value)}
        />

        <Input
          placeholder="Country"
          value={form.country}
          onChange={(e) => handleChange("country", e.target.value)}
        />
      </div>

      <Button className="w-full" onClick={save}>
        ➕ Add Student
      </Button>
    </div>
  );
}
