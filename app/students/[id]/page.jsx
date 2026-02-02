"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { 
  User, CreditCard, FileText, Activity, 
  ChevronLeft, Settings, Plus, History, ExternalLink 
} from "lucide-react";

export default function StudentProfile() {
  const { id } = useParams();
  const [data, setData] = useState({ student: null, docs: [], response: null, fee: null });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  const load = useCallback(async () => {
    const res = await fetch(`/api/students/${id}`);
    const d = await res.json();
    setData({ student: d.student, docs: d.documents || [], response: d.response, fee: d.fee });
    setForm(d.student);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Identity Records Updated");
      setEditMode(false);
      load();
    }
  };

  if (!data.student) return <div className="p-12 text-center animate-pulse font-black text-slate-300">ACCESSING REGISTRY...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 space-y-8">
      {/* ENTERPRISE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black italic shadow-lg shadow-indigo-100">
            {data.student.first_name[0]}{data.student.last_name?.[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
              {data.student.first_name} {data.student.last_name}
            </h1>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">{data.student.student_code}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!editMode ? (
            <>
              <Link href="/students"><Button variant="outline" className="rounded-xl border-slate-200"><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
              <Link href={`/students/${id}/assign-class`}><Button variant="outline" className="rounded-xl border-slate-200 text-indigo-600 font-bold uppercase text-[10px] tracking-widest"><Settings className="w-3 h-3 mr-2" /> Class Assignment</Button></Link>
              <Button onClick={() => setEditMode(true)} className="bg-slate-900 rounded-xl px-8 uppercase font-bold text-xs tracking-widest transition-all hover:bg-black">Edit Dossier</Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-emerald-600 text-white rounded-xl uppercase font-bold text-xs tracking-widest">Commit Changes</Button>
              <Button variant="ghost" onClick={() => setEditMode(false)} className="text-slate-400 font-bold">Discard</Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: IDENTITY */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-8 border-b border-slate-50 pb-4">
              <User className="w-4 h-4" /> Identity Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {!editMode ? (
                <>
                  <DataField label="Full Email" value={data.student.email} />
                  <DataField label="Contact" value={data.student.phone} />
                  <DataField label="Date of Birth" value={data.student.dob || "—"} />
                  <DataField label="Gender" value={data.student.gender || "—"} />
                  <DataField label="Assigned Class" value={data.student.class_name || "Unassigned"} highlighted />
                </>
              ) : (
                <>
                  <Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} placeholder="First Name" />
                  <Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} placeholder="Last Name" />
                  <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" />
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" />
                </>
              )}
            </div>
          </section>

          {/* DOCUMENTS */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
              <FileText className="w-4 h-4" /> Certification & Docs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.docs.length === 0 ? (
                <p className="text-slate-300 text-xs font-bold uppercase">No records uploaded</p>
              ) : (
                data.docs.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{d.original_name}</span>
                    <a href={d.file_path} target="_blank" className="text-indigo-600 p-2 hover:bg-white rounded-lg transition-all"><ExternalLink className="w-4 h-4" /></a>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: FINANCIALS */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-4 py-1 text-[8px] font-black uppercase tracking-widest ${data.fee?.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
              {data.fee?.status || 'UNASSIGNED'}
            </div>
            <h2 className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-[0.3em] mb-8">
              <CreditCard className="w-4 h-4" /> Financial Summary
            </h2>
            
            {!data.fee ? (
              <div className="text-center py-6">
                <p className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-widest">Financial profile missing</p>
                <Link href={`/students/${id}/assign-fee`}><Button className="w-full bg-slate-900 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg">Initialize Fees</Button></Link>
              </div>
            ) : (
              <div className="space-y-4">
                <StatRow label="Total Value" value={`₹${data.fee.total_amount}`} />
                <StatRow label="Received" value={`₹${data.fee.paid_amount}`} color="text-emerald-600" />
                <div className="pt-4 border-t border-slate-100">
                  <StatRow label="Outstanding" value={`₹${data.fee.total_amount - data.fee.paid_amount}`} color="text-red-600" />
                </div>
                <div className="flex gap-2 pt-6">
                   <Link href={`/students/${id}/pay-fee`} className="flex-1"><Button className="w-full bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest"><Plus className="w-3 h-3 mr-1" /> Pay</Button></Link>
                   <Link href={`/students/${id}/fee-history`}><Button variant="outline" className="rounded-xl p-2"><History className="w-4 h-4" /></Button></Link>
                </div>
              </div>
            )}
          </section>

          {/* RAW JSON RESPONSE (OPTIONAL) */}
          {data.response && (
            <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl">
               <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Activity className="w-3 h-3" /> System Meta Data
               </p>
               <pre className="text-[10px] text-slate-400 font-mono h-32 overflow-y-auto no-scrollbar italic leading-relaxed">
                 {JSON.stringify(data.response.data, null, 2)}
               </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataField({ label, value, highlighted }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-bold text-sm ${highlighted ? 'text-indigo-600' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
      <span className={`text-sm font-black ${color || 'text-slate-900'}`}>{value}</span>
    </div>
  );
}