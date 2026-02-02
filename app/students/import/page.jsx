"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, CheckCircle2, AlertCircle, Loader2, Table as TableIcon, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ImportStudents() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [mode, setMode] = useState("skip");
  const [loading, setLoading] = useState(false);

  const parseFile = async () => {
    if (!file) return toast.error("Please select a file first");
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/students/import", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setPreview(data.rows || []);
      setErrors(data.errors || []);
      if (data.errors?.length > 0) toast.warning("File parsed with validation errors");
      else toast.success("File parsed successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const importNow = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/students/import?commit=1&mode=${mode}`, { 
        method: "POST", 
        body: formData 
      });
      const out = await res.json();
      
      toast.success(`Import Finished: ${out.inserted} New, ${out.updated} Updated`);
      setPreview([]);
      setFile(null);
    } catch (err) {
      toast.error("Final commit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bulk Candidate Import</h1>
          <p className="text-slate-500 mt-1">Upload CSV or Excel files to register multiple students at once.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* UPLOAD PANEL */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
                <FileUp className="w-4 h-4" /> 1. Select Source
              </div>
              <Input 
                type="file" 
                accept=".csv,.xlsx" 
                onChange={(e) => setFile(e.target.files?.[0])}
                className="cursor-pointer"
              />
              <Button 
                onClick={parseFile} 
                disabled={loading || !file} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Verify File Structure"}
              </Button>
            </div>

            {preview.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
                  <ArrowRight className="w-4 h-4" /> 2. Strategy
                </div>
                <div className="space-y-3">
                  <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${mode === 'skip' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                    <input type="radio" className="hidden" checked={mode === "skip"} onChange={() => setMode("skip")} />
                    <div className="text-xs font-bold text-slate-700">Skip Duplicates<p className="text-[10px] font-normal text-slate-500">Protect existing data</p></div>
                  </label>
                  <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${mode === 'update' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                    <input type="radio" className="hidden" checked={mode === "update"} onChange={() => setMode("update")} />
                    <div className="text-xs font-bold text-slate-700">Update Existing<p className="text-[10px] font-normal text-slate-500">Overwrite info by Email/Phone</p></div>
                  </label>
                </div>
                <Button 
                  onClick={importNow} 
                  disabled={loading || errors.length > 0} 
                  className="w-full bg-slate-900 hover:bg-black h-14 rounded-xl font-bold uppercase tracking-widest text-xs"
                >
                  Confirm & Commit
                </Button>
              </div>
            )}
          </div>

          {/* PREVIEW/ERROR PANEL */}
          <div className="lg:col-span-2 space-y-6">
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-4">
                  <AlertCircle className="w-5 h-5" /> Validation Failures
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {errors.map((e, i) => (
                    <div key={i} className="text-xs text-red-600 bg-white/50 p-2 rounded-lg border border-red-50">Row {e}</div>
                  ))}
                </div>
              </div>
            )}

            {preview.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                    <TableIcon className="w-4 h-4" /> Data Preview (Top 50)
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-black uppercase">
                    Total Rows: {preview.length}
                  </span>
                </div>
                <div className="overflow-auto max-h-[500px]">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        {Object.keys(preview[0]).map(k => (
                          <th key={k} className="p-3 border-b font-black text-slate-400 uppercase tracking-widest">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {preview.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          {Object.values(row).map((v, j) => (
                            <td key={j} className="p-3 text-slate-600 truncate max-w-[150px]">{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400">
                <TableIcon className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No Data Loaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}