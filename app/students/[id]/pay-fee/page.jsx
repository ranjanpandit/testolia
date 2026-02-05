"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  IndianRupee,
  CreditCard,
  Wallet,
  Banknote,
  QrCode,
  Loader2,
  AlertCircle,
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

export default function PayFee() {
  const { id } = useParams();
  const router = useRouter();

  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    async function fetchFee() {
      setLoading(true);
      try {
        const res = await fetch(`/api/students/${id}/fees`);
        if (!res.ok) throw new Error("Failed to load fee details");
        const data = await res.json();
        setFee(data.fee);
      } catch (err) {
        toast.error("Unable to load fee information");
      } finally {
        setLoading(false);
      }
    }

    fetchFee();
  }, [id]);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(amount) > (fee?.total_amount - fee?.paid_amount || 0)) {
      toast.warning("Amount exceeds outstanding balance");
      // You can allow overpayment if business logic permits
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${id}/fees/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fee_id: fee?.id,
          amount: Number(amount),
          payment_mode: mode,
          reference_no: referenceNo.trim() || null,
          remarks: remarks.trim() || null,
          paid_on: new Date().toISOString().slice(0, 10),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Payment failed");
      }

      toast.success("Payment recorded successfully");
      router.push(`/students/${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const outstanding = fee ? fee.total_amount - fee.paid_amount : 0;

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
                <IndianRupee className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold tracking-tight">
                  Record Fee Payment
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Record Payment
            </CardTitle>
            <CardDescription>
              Add a payment to update the student's fee ledger
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !fee ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">No fee record found</p>
                <Button asChild variant="outline">
                  <Link href={`/students/${id}/assign-fee`}>Assign Fee Structure</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Fee Summary */}
                <div className="rounded-lg border bg-muted/30 p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-lg font-semibold">
                        ₹{Number(fee.total_amount).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Paid</div>
                      <div className="text-lg font-semibold text-emerald-600">
                        ₹{Number(fee.paid_amount).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Outstanding</div>
                      <div className="text-lg font-bold text-red-600">
                        ₹{Number(outstanding).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Payment Amount (₹) *</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10 h-11"
                        min="1"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mode">Payment Mode *</Label>
                    <Select value={mode} onValueChange={setMode}>
                      <SelectTrigger id="mode" className="h-11">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="upi">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4" />
                            UPI
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Card
                          </div>
                        </SelectItem>
                        <SelectItem value="bank">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference / Transaction ID (optional)</Label>
                    <Input
                      id="reference"
                      placeholder="e.g. TXN123456789"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks (optional)</Label>
                    <Input
                      id="remarks"
                      placeholder="Any additional notes..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Notice */}
                <div className="flex items-start gap-3 rounded-lg border bg-amber-50/50 p-4 text-sm">
                  <AlertCircle className="h-5 w-5 mt-0.5 text-amber-600 shrink-0" />
                  <p className="text-amber-800">
                    This payment will be recorded immediately and reflected in the student's ledger.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-6 border-t">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !amount || loading}
                    className="h-12 gap-2 text-base"
                  >
                    {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                    Record Payment
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
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}