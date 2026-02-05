"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Plus,
  History,
  Edit3,
  Check,
  X,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function StudentProfile() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    student: null,
    docs: [],
    fee: null,
  });

  const [form, setForm] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${id}`);
      if (!res.ok) throw new Error("Failed to load profile");
      const json = await res.json();
      setData({
        student: json.student,
        docs: json.documents || [],
        fee: json.fee,
      });
      setForm(json.student || {});
    } catch (err) {
      toast.error("Failed to load student profile");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!form.first_name || !form.email) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success("Profile updated successfully");
      setEditMode(false);
      load();
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (JSON.stringify(form) !== JSON.stringify(data.student)) {
      if (!confirm("Discard changes?")) return;
    }
    setForm(data.student);
    setEditMode(false);
  };

  const handleBack = () => router.back();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data.student) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Student not found</p>
      </div>
    );
  }

  const outstanding = (data.fee?.total_amount || 0) - (data.fee?.paid_amount || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                  {data.student.first_name[0]}
                  {data.student.last_name?.[0] || ""}
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">
                    {data.student.first_name} {data.student.last_name}
                  </h1>
                  <p className="text-sm text-muted-foreground font-mono">
                    {data.student.student_code}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!editMode ? (
                <>
                  <Button variant="outline" asChild size="sm">
                    <Link href={`/students/${id}/assign-class`}>
                      <Users className="mr-2 h-4 w-4" />
                      Assign Class
                    </Link>
                  </Button>
                  <Button size="sm" onClick={() => setEditMode(true)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Identity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {editMode ? (
                    <>
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={form.first_name || ""}
                          onChange={(e) =>
                            setForm({ ...form, first_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={form.last_name || ""}
                          onChange={(e) =>
                            setForm({ ...form, last_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={form.email || ""}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={form.phone || ""}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={form.dob || ""}
                          onChange={(e) =>
                            setForm({ ...form, dob: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Input
                          value={form.gender || ""}
                          onChange={(e) =>
                            setForm({ ...form, gender: e.target.value })
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={data.student.email} />
                      <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={data.student.phone || "—"} />
                      <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date of Birth" value={data.student.dob || "—"} />
                      <InfoRow icon={<User className="h-4 w-4" />} label="Gender" value={data.student.gender || "—"} />
                      <div className="md:col-span-2">
                        <InfoRow
                          icon={<Users className="h-4 w-4" />}
                          label="Class"
                          value={
                            <Badge variant="secondary">
                              {data.student.class_name || "Unassigned"}
                            </Badge>
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.docs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No documents uploaded
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {data.docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 p-4"
                      >
                        <span className="truncate text-sm font-medium">
                          {doc.original_name}
                        </span>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Financial Summary */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Fee Status
                  </CardTitle>
                  {data.fee && (
                    <Badge
                      variant={data.fee.status === "paid" ? "default" : "secondary"}
                    >
                      {data.fee.status?.toUpperCase() || "PENDING"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!data.fee ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No fee record assigned
                    </p>
                    <Button asChild className="w-full">
                      <Link href={`/students/${id}/assign-fee`}>
                        Assign Fee Structure
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Amount</span>
                        <span className="font-semibold">₹{data.fee.total_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Paid</span>
                        <span className="font-medium text-emerald-600">
                          ₹{data.fee.paid_amount}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Outstanding</span>
                        <span
                          className={`font-bold ${
                            outstanding > 0 ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          ₹{outstanding}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button asChild className="flex-1">
                        <Link href={`/students/${id}/pay-fee`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Record Payment
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/students/${id}/fee-history`}>
                          <History className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable info row
function InfoRow({ icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{value || "—"}</div>
    </div>
  );
}