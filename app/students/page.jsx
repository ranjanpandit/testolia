"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, FileDown, FileUp, Search, Eye, FilterX, 
  ChevronLeft, ChevronRight, GraduationCap, ArrowUpDown, ArrowUp, ArrowDown 
} from "lucide-react";
import Link from "next/link";

export default function StudentList() {
  const [data, setData] = useState({ data: [], classes: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  
  // 1. Expanded filters to include sorting
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    classId: "all",
    sortBy: "id",
    order: "DESC",
    page: 1
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      ...filters,
      page: filters.page.toString(),
      limit: "10"
    }).toString();

    try {
      const res = await fetch(`/api/students?${query}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(), 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key === "page" ? value : 1 }));
  };

  // 2. Sorting Toggle Logic
  const handleSort = (field) => {
    const isAsc = filters.sortBy === field && filters.order === "ASC";
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      order: isAsc ? "DESC" : "ASC",
      page: 1
    }));
  };

  // 3. Icon Helper for Headers
  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return filters.order === "ASC" 
      ? <ArrowUp className="ml-2 h-3 w-3 text-teal-600" /> 
      : <ArrowDown className="ml-2 h-3 w-3 text-teal-600" />;
  };
  // Inside your StudentList component
const exportStudents = () => {
  const query = new URLSearchParams({
    search: filters.search,
    status: filters.status,
    classId: filters.classId
  }).toString();

  // Redirect to the export API with the active filters
  window.location.href = `/api/students/export?${query}`;
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-teal-600" /> Candidate Registry
            </h1>
            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mt-1">
              Active Records: <span className="text-teal-600 font-black">{data.total}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/students/add"><Button className="bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg"><UserPlus className="w-4 h-4 mr-2" /> Add Student</Button></Link>
            <Link href="/students/import"><Button variant="outline" className="text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-xl"><FileDown className="w-4 h-4 mr-2" /> Import</Button></Link>
            <Button variant="outline" onClick={exportStudents} className="text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50"><FileUp className="w-4 h-4 mr-2" /> Export</Button>
          </div>
        </div>

        {/* FILTER BOX */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search Name, Email, or Code..." className="pl-10 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-teal-500" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select className="border border-slate-100 bg-slate-50/50 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer" value={filters.classId} onChange={(e) => updateFilter("classId", e.target.value)}>
              <option value="all">All Classes</option>
              {data.classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select className="border border-slate-100 bg-slate-50/50 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-teal-500" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>

            <Button variant="ghost" className="text-slate-300 hover:text-red-500" onClick={() => setFilters({ search: "", status: "", classId: "all", sortBy: "id", order: "DESC", page: 1 })}><FilterX className="w-5 h-5" /></Button>
          </div>
        </div>

        {/* REGISTRY TABLE WITH SORTABLE HEADERS */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th onClick={() => handleSort('first_name')} className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-teal-600 transition-colors">
                    <div className="flex items-center">Identification <SortIcon field="first_name" /></div>
                  </th>
                  <th onClick={() => handleSort('email')} className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-teal-600 transition-colors">
                    <div className="flex items-center">Contact <SortIcon field="email" /></div>
                  </th>
                  <th onClick={() => handleSort('class_name')} className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-teal-600 transition-colors">
                    <div className="flex items-center">Class Level <SortIcon field="class_name" /></div>
                  </th>
                  <th onClick={() => handleSort('status')} className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-teal-600 transition-colors">
                    <div className="flex items-center">Status <SortIcon field="status" /></div>
                  </th>
                  <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="5" className="p-24 text-center font-bold text-slate-300 animate-pulse tracking-widest uppercase text-xs">Syncing Registry...</td></tr>
                ) : (
                  data.data.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-sm uppercase">{s.first_name?.[0]}{s.last_name?.[0]}</div>
                          <div>
                            <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{s.first_name} {s.last_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{s.student_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-semibold text-slate-600">{s.email}</p>
                        <p className="text-[10px] font-bold text-slate-400">{s.phone}</p>
                      </td>
                      <td className="p-6"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase italic border border-blue-100">{s.class_name || "Unassigned"}</span></td>
                      <td className="p-6"><span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>{s.status || "active"}</span></td>
                      <td className="p-6 text-right"><Link href={`/students/${s.id}`}><Button variant="ghost" className="hover:bg-teal-50 hover:text-teal-600 rounded-xl font-black uppercase text-[10px] tracking-widest"><Eye className="w-4 h-4 mr-2" /> View Dossier</Button></Link></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {filters.page} of {data.pages}</p>
            <div className="flex gap-3">
              <Button variant="outline" disabled={filters.page === 1} onClick={() => updateFilter("page", filters.page - 1)} className="rounded-xl h-10 px-4 border-slate-200 bg-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition"><ChevronLeft className="w-4 h-4 mr-2" /> Prev</Button>
              <Button variant="outline" disabled={filters.page >= data.pages} onClick={() => updateFilter("page", filters.page + 1)} className="rounded-xl h-10 px-4 border-slate-200 bg-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition">Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}