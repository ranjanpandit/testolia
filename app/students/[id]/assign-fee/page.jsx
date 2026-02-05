"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  Wallet,
  CreditCard,
  AlertCircle,
  Loader2,
  IndianRupee,
  Calendar,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function AssignFee() {
  const { id } = useParams();
  const router = useRouter();

  const [feeStructures, setFeeStructures] = useState([]);
  const [feeId, setFeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedFee = feeStructures.find((f) => f.id.toString() === feeId);

  // Load fee structures
  useEffect(() => {
    async function fetchFeeStructures() {
      setLoading(true);
      try {
        const res = await fetch("/api/fee-structures");
        if (!res.ok) throw new Error("Failed to load fee structures");
        const data = await res.json();
        setFeeStructures(data || []);
      } catch (err) {
        toast.error("Unable to load available fee packages");
      } finally {
        setLoading(false);
      }
    }
    fetchFeeStructures();
  }, []);

  const handleAssign = async () => {
    if (!feeId) {
      toast.error("Please select a fee structure");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/student-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: id,
          feeStructureId: feeId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to assign fee structure");
      }

      toast.success("Fee structure assigned successfully");
      router.push(`/students/${id}`);
    } catch (err) {
      toast.error(err.message || "Assignment failed");
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
                <Wallet className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold tracking-tight">
                  Assign Fee Structure
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Fee Structure Assignment
            </CardTitle>
            <CardDescription>
              Select a fee package to initialize the student's financial record
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            {/* Fee Structure Selection */}
            <div className="space-y-2">
              <Label htmlFor="fee-structure">Fee Package *</Label>
              {loading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <Select value={feeId} onValueChange={setFeeId}>
                  <SelectTrigger id="fee-structure" className="h-11">
                    <SelectValue placeholder="Choose a fee structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeStructures.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No fee structures available
                      </SelectItem>
                    ) : (
                      feeStructures.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.class_name}
                          {f.batch_name ? ` • ${f.batch_name}` : ""}
                          {" • ₹"}
                          {Number(f.total_amount).toLocaleString("en-IN")}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Selected Fee Preview */}
            {selectedFee && (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{selectedFee.class_name}</h3>
                      {selectedFee.batch_name && (
                        <p className="text-sm text-muted-foreground">
                          Batch: {selectedFee.batch_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ₹{Number(selectedFee.total_amount).toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Amount</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Due Date</div>
                      <div className="font-medium">
                        {selectedFee.due_date
                          ? new Date(selectedFee.due_date).toLocaleDateString("en-IN")
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Installments</div>
                      <div className="font-medium">
                        {selectedFee.installments || 1}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Important Notice */}
            <div className="flex items-start gap-3 rounded-lg border bg-amber-50/50 p-4 text-sm">
              <AlertCircle className="h-5 w-5 mt-0.5 text-amber-600 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-amber-800">Important</p>
                <p className="text-amber-700">
                  Assigning a fee structure creates the student's financial ledger. 
                  This action is permanent and will be recorded in the audit trail.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-6 border-t">
              <Button
                onClick={handleAssign}
                disabled={submitting || !feeId || loading}
                className="h-12 gap-2 text-base"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                Confirm & Assign Fee
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}