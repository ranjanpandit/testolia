"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, BookOpen, Wallet, MapPin, ArrowRight } from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lookups, setLookups] = useState({ classes: [] });

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    gender: "", dob: "", address: "", city: "",
    state: "", country: "India",
    class_id: "", batch_id: "", total_amount: ""
  });

  useEffect(() => {
    async function loadLookups() {
      try {
        const res = await fetch("/api/students?limit=1");
        const data = await res.json();
        setLookups({ classes: data.classes || [] });
      } catch (e) {
        console.error("Lookup load failed");
      }
    }
    loadLookups();
  }, []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    if (!form.first_name || !form.email || !form.class_id) {
      toast.error("Please provide First Name, Email, and Class Level.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Student profile created successfully.");
      router.push(`/students/${data.studentId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">New Student Registration</h1>
          <p className="text-slate-500 mt-1">Complete the form below to create a new student record and assign academic details.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Details */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-wider mb-6">
                <User className="w-4 h-4" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input placeholder="First Name *" value={form.first_name} onChange={(e) => handleChange("first_name", e.target.value)} />
                <Input placeholder="Last Name" value={form.last_name} onChange={(e) => handleChange("last_name", e.target.value)} />
                <Input placeholder="Email Address *" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                <Input placeholder="Phone Number" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <Input type="date" value={form.dob} onChange={(e) => handleChange("dob", e.target.value)} />
              </div>
            </section>

            {/* Academic & Location */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-wider mb-6">
                <BookOpen className="w-4 h-4" /> Academic & Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.class_id} onChange={(e) => handleChange("class_id", e.target.value)}>
                  <option value="">Assign Class *</option>
                  {lookups.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Input placeholder="City" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
                <div className="md:col-span-2">
                  <Input placeholder="Full Address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Secondary Details */}
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-wider mb-6">
                <Wallet className="w-4 h-4" /> Billing Setup
              </h2>
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Define the initial fee structure for this student.</p>
                <Input placeholder="Total Course Fee (INR)" type="number" value={form.total_amount} onChange={(e) => handleChange("total_amount", e.target.value)} />
              </div>
            </section>

            <div className="p-2">
              <Button 
                disabled={loading} 
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                onClick={save}
              >
                {loading ? "Registering..." : "Create Student Profile"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
              <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest font-bold">Fields marked with * are required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}