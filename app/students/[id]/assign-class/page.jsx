"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Calendar, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function AssignClassBatch() {
  const { id } = useParams();
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classId, setClassId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  // Load Classes
  useEffect(() => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(setClasses)
      .catch(() => toast.error("Failed to load class registry"));
  }, []);

  // Load Batches when Class changes
  useEffect(() => {
    if (!classId) {
      setBatches([]);
      setBatchId("");
      return;
    }
    fetch(`/api/batches?classId=${classId}`)
      .then((res) => res.json())
      .then(setBatches);
  }, [classId]);

  const handleAssign = async () => {
    if (!classId || !batchId) {
      toast.error("Class and Batch selection is mandatory.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/student-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: id,
          classId,
          batchId,
          startDate,
        }),
      });

      if (res.ok) {
        toast.success("Academic records updated successfully");
        router.push(`/students/${id}`);
      } else {
        throw new Error("Assignment failed");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl transition-all">
        <header className="mb-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Settings className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Academic Assignment</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Registry Enrollment System</p>
        </header>

        <div className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Target Class</Label>
            <select
              className="w-full h-12 border border-slate-200 rounded-xl px-4 text-sm font-bold bg-slate-50/50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Select Class Level</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Batch Selection */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Assigned Batch</Label>
            <select
              className="w-full h-12 border border-slate-200 rounded-xl px-4 text-sm font-bold bg-slate-50/50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              disabled={!classId}
            >
              <option value="">Select Study Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Effective Date</Label>
            <div className="relative">
              <input
                type="date"
                className="w-full h-12 border border-slate-200 rounded-xl px-4 text-sm font-bold bg-slate-50/50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              disabled={loading}
              className="w-full py-7 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all active:scale-95" 
              onClick={handleAssign}
            >
              {loading ? "Updating Registry..." : "Confirm Assignment"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest"
            >
              Discard Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}