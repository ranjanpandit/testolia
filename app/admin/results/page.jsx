"use client";
import { useEffect, useState, useCallback } from "react";

export default function ResultsPage() {
  const [data, setData] = useState({ rows: [], exams: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "all",
    examId: "all", // New filter state
  });

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams(filters).toString();
    try {
      const res = await fetch(`/api/admin/results?${query}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(timer);
  }, [fetchResults]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ 
      ...prev, 
      [key]: value, 
      page: key === "page" ? value : 1 
    }));
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Result Analytics</h1>
            <p className="text-slate-500 text-sm font-medium">Filter by student, status, or specific examination</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Exam Name Filter */}
            <select
              className="px-4 py-2 border rounded-xl text-xs font-bold bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.examId}
              onChange={(e) => updateFilter("examId", e.target.value)}
            >
              <option value="all">All Exams</option>
              {data.exams?.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border rounded-xl text-xs font-bold bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by student name..."
              className="px-4 py-2 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
        </header>

        {/* ... Table and Pagination code remains the same as previous enterprise version ... */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-b">
                <tr>
                   <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                   <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Name</th>
                   <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                   <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                   <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-12 text-center text-slate-400 animate-pulse font-bold">Updating Analytics...</td></tr>
                ) : (
                  data.rows.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-all">
                       <td className="px-6 py-4 font-bold text-slate-700">{r.student_name}</td>
                       <td className="px-6 py-4 text-xs font-bold text-blue-600 uppercase">{r.exam_title}</td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <span className="font-black text-slate-800">{r.obtained_marks}/{r.total_marks}</span>
                             <span className="text-[10px] text-slate-400 font-bold uppercase">{r.percentage}% Accuracy</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${r.result_status === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                             {r.result_status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-[10px] text-slate-400 font-bold">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
             </tbody>
          </table>

          {/* PAGINATION FOOTER */}
          <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              Page {data.pagination.page} of {data.pagination.totalPages} — {data.pagination.total} Total Results
            </span>
            <div className="flex gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() => updateFilter("page", filters.page - 1)}
                className="px-5 py-2 border bg-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 disabled:opacity-30 transition"
              >
                Prev
              </button>
              <button
                disabled={filters.page >= data.pagination.totalPages}
                onClick={() => updateFilter("page", filters.page + 1)}
                className="px-5 py-2 border bg-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 disabled:opacity-30 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}