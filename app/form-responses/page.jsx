"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

export default function FormResponsesList() {
  const searchParams = useSearchParams();
  const initialFormId = searchParams.get("formId") || "";
  const [responses, setResponses] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [filterFormId, setFilterFormId] = useState(initialFormId);
  const [filterStudentId, setFilterStudentId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  // For checkbox selection
  const [selectedIds, setSelectedIds] = useState([]);

  // ------------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------------
  const load = async () => {
    const res = await fetch("/api/form-responses");
    const data = await res.json();

    setResponses(data);
    setFiltered(data);
  };

  useEffect(() => {
    load();
  }, []);

  // ------------------------------------------------------
  // SEARCH + FILTER
  // ------------------------------------------------------
  useEffect(() => {
    let list = [...responses];

    if (search.trim() !== "") {
      list = list.filter((r) =>
        JSON.stringify(r.data || {})
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (filterFormId.trim() !== "") {
      list = list.filter((r) => String(r.formId) === filterFormId);
    }

    if (filterStudentId.trim() !== "") {
      list = list.filter((r) => String(r.studentId) === filterStudentId);
    }

    if (filterStatus.trim() !== "") {
      list = list.filter((r) => r.status === filterStatus);
    }

    setFiltered(list);
    setPage(1);
  }, [search, filterFormId, filterStudentId, filterStatus, responses]);

  // ------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const next = () => setPage((p) => Math.min(p + 1, totalPages));
  const prev = () => setPage((p) => Math.max(p - 1, 1));

  // ------------------------------------------------------
  // DELETE RESPONSE
  // ------------------------------------------------------
  async function deleteResponse(id) {
    if (!confirm("Delete this response?")) return;

    await fetch(`/api/form-responses/${id}`, { method: "DELETE" });
    load();
  }

  // ------------------------------------------------------
  // CSV EXPORT
  // ------------------------------------------------------
  const exportCSV = () => {
    window.location.href = "/api/form-responses/export";
  };

  // ------------------------------------------------------
  // STATUS BADGES
  // ------------------------------------------------------
  const statusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "under_review":
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      case "rejected":
        return <Badge className="bg-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500">Applied</Badge>;
    }
  };

  // ------------------------------------------------------
  // Update Status
  // ------------------------------------------------------
  async function updateStatus(id, status) {
    await fetch(`/api/form-responses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    load();
  }

  // ------------------------------------------------------
  // Checkbox select / unselect
  // ------------------------------------------------------
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Form Responses</h1>
        <Button onClick={exportCSV}>📥 Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Input
          placeholder="Search response..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input
          placeholder="Filter by Form ID"
          value={filterFormId}
          onChange={(e) => setFilterFormId(e.target.value)}
        />

        <Input
          placeholder="Filter by Student ID"
          value={filterStudentId}
          onChange={(e) => setFilterStudentId(e.target.value)}
        />

        <select
          className="border rounded p-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Filter by Status</option>
          <option value="applied">Applied</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Listing */}
      {paginated.length === 0 ? (
        <p className="p-6">No responses found.</p>
      ) : (
        <div className="space-y-4">
          {paginated.map((res) => (
            <div
              key={res.id}
              className="border p-4 rounded flex justify-between items-center shadow-sm"
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.includes(res.id)}
                onChange={() => toggleSelect(res.id)}
                className="mr-3"
              />

              <div>
                <p className="font-semibold">Response #{res.id}</p>

                {/* STATUS */}
                <div className="flex items-center gap-2 mt-1">
                  {statusBadge(res.status)}

                  <select
                    className="border p-1 rounded text-sm"
                    value={res.status || "applied"}
                    onChange={(e) => updateStatus(res.id, e.target.value)}
                  >
                    <option value="applied">Applied</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <p className="text-sm opacity-70 mt-1">
                  Form ID: {res.formId}
                </p>

                <p className="text-sm opacity-70">
                  Student ID: {res.studentId || "—"}
                </p>

                <p className="text-sm opacity-70">
                  Submitted: {new Date(res.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href={`/form-responses/${res.id}`}>
                  <Button variant="outline">👁 View</Button>
                </Link>

                <Button
                  variant="destructive"
                  onClick={() => deleteResponse(res.id)}
                >
                  🗑 Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        <Button variant="outline" onClick={prev} disabled={page === 1}>
          ◀ Previous
        </Button>

        <span className="font-semibold">
          Page {page} / {totalPages}
        </span>

        <Button variant="outline" onClick={next} disabled={page === totalPages}>
          Next ▶
        </Button>
      </div>
    </div>
  );
}
