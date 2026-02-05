"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  IndianRupee,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [classes, setClasses] = useState([]);

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
    country: "India",
    class_id: "",
    total_amount: "",
  });

  useEffect(() => {
    async function loadLookups() {
      setLookupsLoading(true);
      try {
        const res = await fetch("/api/students?limit=1"); // Assuming this returns classes in response
        if (!res.ok) throw new Error("Failed to load lookups");
        const data = await res.json();
        setClasses(data.classes || []);
      } catch (err) {
        toast.error("Failed to load class list");
      } finally {
        setLookupsLoading(false);
      }
    }
    loadLookups();
  }, []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.first_name.trim()) return toast.error("First name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!form.class_id) return toast.error("Please assign a class");

    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create student");
      }

      const data = await res.json();
      toast.success("Student profile created successfully");
      router.push(`/students/${data.studentId || data.id}`);
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold tracking-tight">
                Add New Student
              </h1>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Student
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column – Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      placeholder="Enter first name"
                      value={form.first_name}
                      onChange={(e) => handleChange("first_name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      placeholder="Enter last name"
                      value={form.last_name}
                      onChange={(e) => handleChange("last_name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => handleChange("gender", v)}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={form.dob}
                      onChange={(e) => handleChange("dob", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic & Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  Academic & Address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="class_id">Class Level *</Label>
                    {lookupsLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={form.class_id}
                        onValueChange={(v) => handleChange("class_id", v)}
                      >
                        <SelectTrigger id="class_id">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No classes available
                            </SelectItem>
                          ) : (
                            classes.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      placeholder="House no, Street, Area"
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="e.g. Delhi"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="e.g. Delhi"
                      value={form.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column – Billing & Actions */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-muted-foreground" />
                  Billing Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Course Fee (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="total_amount"
                      type="number"
                      placeholder="0.00"
                      value={form.total_amount}
                      onChange={(e) => handleChange("total_amount", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  This will be the initial fee assigned to the student. You can adjust later.
                </p>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="h-12 gap-2 text-base"
                  >
                    {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                    Create Student Profile
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="h-12"
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground pt-2">
                  Fields marked with * are required
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}