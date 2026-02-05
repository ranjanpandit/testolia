"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  Calendar,
  GraduationCap,
  Users,
  AlertCircle,
  Loader2,
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

export default function AssignClassBatch() {
  const { id } = useParams();
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classId, setClassId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load all classes
  useEffect(() => {
    async function fetchClasses() {
      setLoadingClasses(true);
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) throw new Error("Failed to load classes");
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        toast.error("Failed to load class list");
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, []);

  // Load batches when class is selected
  useEffect(() => {
    if (!classId) {
      setBatches([]);
      setBatchId("");
      return;
    }

    async function fetchBatches() {
      setLoadingBatches(true);
      try {
        const res = await fetch(`/api/batches?classId=${classId}`);
        if (!res.ok) throw new Error("Failed to load batches");
        const data = await res.json();
        setBatches(data);
      } catch (err) {
        toast.error("Failed to load batches for selected class");
      } finally {
        setLoadingBatches(false);
      }
    }

    fetchBatches();
  }, [classId]);

  const handleAssign = async () => {
    if (!classId) {
      toast.error("Please select a class");
      return;
    }
    if (!batchId) {
      toast.error("Please select a batch");
      return;
    }
    if (!startDate) {
      toast.error("Please select an effective start date");
      return;
    }

    setSubmitting(true);
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

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Assignment failed");
      }

      toast.success("Class & batch assigned successfully");
      router.push(`/students/${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to assign class/batch");
    } finally {
      setSubmitting(false);
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
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold tracking-tight">
                  Assign Class & Batch
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Academic Enrollment
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            {/* Class Selection */}
            <div className="space-y-2">
              <Label htmlFor="class">Class Level *</Label>
              {loadingClasses ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger id="class" className="h-11">
                    <SelectValue placeholder="Select class level" />
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

            {/* Batch Selection */}
            <div className="space-y-2">
              <Label htmlFor="batch">Batch / Section *</Label>
              {loadingBatches ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={batchId}
                  onValueChange={setBatchId}
                  disabled={!classId || batches.length === 0}
                >
                  <SelectTrigger id="batch" className="h-11">
                    <SelectValue placeholder="Select batch/section" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.length === 0 ? (
                      <SelectItem value="none" disabled>
                        {classId ? "No batches available" : "Select class first"}
                      </SelectItem>
                    ) : (
                      batches.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Effective From *</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="h-11"
                />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-6 border-t">
              <Button
                onClick={handleAssign}
                disabled={submitting || !classId || !batchId || !startDate}
                className="h-12 gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Assignment
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
                className="h-12"
              >
                Cancel
              </Button>
            </div>

            {/* Helper text */}
            <div className="flex items-start gap-3 text-xs text-muted-foreground pt-4">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Assigning a new class/batch will update the student's academic
                record. Previous assignments remain in history.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}