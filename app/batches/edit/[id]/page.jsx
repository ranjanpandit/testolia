"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  GraduationCap,
  Save,
  Loader2,
  AlertCircle,
  Calendar,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditBatchPage() {
  const { id } = useParams();
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch batch data + classes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch batch
        const batchRes = await fetch(`/api/batches/${id}`);
        if (!batchRes.ok) throw new Error("Failed to load batch");
        const batchData = await batchRes.json();
        setForm(batchData);

        // Fetch classes for dropdown
        const classesRes = await fetch("/api/classes");
        if (!classesRes.ok) throw new Error("Failed to load classes");
        const classesData = await classesRes.json();
        setClasses(classesData || []);
      } catch (err) {
        toast.error(err.message || "Could not load batch details");
        router.push("/batches");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  const validateForm = () => {
    const newErrors = {};
    if (!form?.classId) newErrors.classId = "Please select a class";
    if (!form?.name?.trim()) newErrors.name = "Batch name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/batches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: form.classId,
          name: form.name.trim(),
          capacity: form.capacity ? Number(form.capacity) : null,
          startDate: form.startDate,
          status: form.status,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update batch");
      }

      toast.success("Batch updated successfully");
      router.push("/batches");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-16 w-full mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold tracking-tight">
                  Edit Batch
                </h1>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="gap-2 min-w-[140px]"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Update Batch
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              Batch Information
            </CardTitle>
            <CardDescription>
              Update details for this batch. Fields marked with * are required.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            {/* Class Selection */}
            <div className="space-y-2">
              <Label htmlFor="classId">
                Associated Class <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.classId?.toString() || ""}
                onValueChange={(value) => setForm({ ...form, classId: value })}
              >
                <SelectTrigger id="classId" className="h-10">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.classId}
                </p>
              )}
            </div>

            {/* Batch Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Batch Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Morning Batch A / Batch 2025-26"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (optional)</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Leave blank for unlimited"
                value={form.capacity || ""}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of students allowed in this batch
              </p>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate || ""}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="h-10"
                  min={new Date().toISOString().split("T")[0]}
                />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status || "active"}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger id="status" className="h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Important Notice */}
            <div className="flex items-start gap-3 rounded-lg border bg-amber-50/50 p-4 text-sm text-amber-800">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <p>
                Updating this batch will affect student assignments and exam scheduling.
                Changes are immediate and will be logged in the system audit trail.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 h-11 gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Batch
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                className="h-11"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}