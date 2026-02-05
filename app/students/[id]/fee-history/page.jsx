"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeeHistory() {
  const { id } = useParams();
  const router = useRouter();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      try {
        const res = await fetch(`/api/students/${id}/fee-payments`);
        if (!res.ok) throw new Error("Failed to load payment history");
        const data = await res.json();
        setPayments(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [id]);

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
                  Fee Payment History
                </h1>
              </div>
            </div>

            <Button asChild size="sm" className="gap-2">
              <Link href={`/students/${id}/pay-fee`}>
                <Plus className="h-4 w-4" />
                Add Payment
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Transaction Records
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <IndianRupee className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">No payments recorded yet</p>
                <p className="text-sm mt-2">
                  Add a payment to start tracking the student's fee ledger
                </p>
                <Button asChild className="mt-6 gap-2">
                  <Link href={`/students/${id}/pay-fee`}>
                    <Plus className="h-4 w-4" />
                    Record First Payment
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(payment.paid_on).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">
                          ₹{Number(payment.amount).toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">{payment.payment_mode || "—"}</Badge>
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {payment.reference_no || "—"}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={`/api/fees/receipt/${payment.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              View Receipt
                              <FileText className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}