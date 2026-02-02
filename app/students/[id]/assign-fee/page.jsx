"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function AssignFee() {
  const { id } = useParams();
  const router = useRouter();

  const [feeStructures, setFeeStructures] = useState([]);
  const [feeId, setFeeId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/fee-structures")
      .then(res => res.json())
      .then(setFeeStructures)
      .catch(() => toast.error("Financial records unreachable"));
  }, []);

  const handleAssign = async () => {
    if (!feeId) {
      toast.error("Please select a valid fee structure.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/student-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: id,
          feeStructureId: feeId,
        }),
      });

      if (res.ok) {
        toast.success("Fee structure assigned successfully");
        router.push(`/students/${id}`);
      } else {
        throw new Error("Financial update failed");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
        <header className="mb-10 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Fee Setup</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Billing & Financial Management</p>
        </header>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Billing Structure</label>
            <select
              className="w-full h-14 border border-slate-200 rounded-2xl px-4 text-sm font-bold bg-slate-50/50 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              value={feeId}
              onChange={(e) => setFeeId(e.target.value)}
            >
              <option value="">Select Package</option>
              {feeStructures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.class_name} {f.batch_name ? `(${f.batch_name})` : ""} — ₹{f.total_amount}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Assigning a structure will initialize the student's ledger. This action will be logged in the financial audit history.
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <Button 
              disabled={loading}
              className="w-full py-8 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95" 
              onClick={handleAssign}
            >
              {loading ? "Generating Ledger..." : "Finalize Fee Setup"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}