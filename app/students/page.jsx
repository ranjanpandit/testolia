"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  // -----------------------------
  // EXPORT STUDENTS
  // -----------------------------
  const exportStudents = () => {
    window.location.href = "/api/students/export";
  };
  const load = async () => {
    const res = await fetch(
      `/api/students?search=${search}&status=${statusFilter}&page=${page}&limit=10`
    );
    const data = await res.json();

    setStudents(data.data);
    setPages(data.pages);
  };

  useEffect(() => {
    load();
  }, [search, statusFilter, page]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* LEFT: TITLE */}
        <h1 className="text-2xl font-bold">Students</h1>

        {/* RIGHT: ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3 justify-end">
          <Link href="/students/add">
            <Button>➕ Add Student</Button>
          </Link>

          <Link href="/students/import">
            <Button variant="secondary">📥 Import Students</Button>
          </Link>

          <Button variant="outline" onClick={exportStudents}>
            📤 Export Students
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by name, email, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Filter Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Class</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-3">
                {s.first_name} {s.last_name}
              </td>
              <td className="p-3">{s.email}</td>
              <td className="p-3">{s.phone}</td>
              <td className="p-3">{s?.class_name}</td>
              <td className="p-3">
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-600">
                  {s.status || "active"}
                </span>
              </td>
              <td className="p-3 text-right">
                <Link href={`/students/${s.id}`}>
                  <Button variant="outline">View</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="px-3 py-1">
          Page {page} / {pages}
        </span>
        <Button disabled={page === pages} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
