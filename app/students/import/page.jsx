"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  Upload,
  FileUp,
  Table as TableIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  ArrowRight,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";

export default function ImportStudents() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [mode, setMode] = useState("skip"); // skip, update, overwrite
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(selectedFile.type)) {
        toast.error("Only CSV or Excel (.xlsx) files are allowed");
        return;
      }
      setFile(selectedFile);
      setPreview([]);
      setErrors([]);
    }
  };

  const parseFile = async () => {
    if (!file) return toast.error("Please select a file first");

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "File parsing failed");
      }

      const data = await res.json();
      setPreview(data.rows || []);
      setErrors(data.errors || []);

      if (data.errors?.length > 0) {
        toast.warning(`File parsed with ${data.errors.length} validation issues`);
      } else {
        toast.success("File validated successfully");
      }
    } catch (err) {
      toast.error(err.message || "Unable to process file");
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const importNow = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    try {
      const res = await fetch(`/api/students/import?commit=1`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Import failed");
      }

      const out = await res.json();
      toast.success(
        `Import complete: ${out.inserted} new, ${out.updated} updated, ${out.skipped} skipped`
      );

      setFile(null);
      setPreview([]);
      setErrors([]);
      setMode("skip");
      router.push("/students");
    } catch (err) {
      toast.error(err.message || "Import failed");
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
                Bulk Import Students
              </h1>
            </div>

            {preview.length > 0 && (
              <Button
                onClick={importNow}
                disabled={loading || errors.length > 0}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Commit Import
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column – Upload & Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload File
                </CardTitle>
                <CardDescription>
                  Supported: CSV or Excel (.xlsx). Max 5,000 rows recommended.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    file ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFile = e.dataTransfer.files[0];
                    if (droppedFile) {
                      setFile(droppedFile);
                      setPreview([]);
                      setErrors([]);
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">
                    {file ? file.name : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV or Excel files only
                  </p>
                </div>

                {file && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Import Strategy</Label>
                      <RadioGroup value={mode} onValueChange={setMode} className="space-y-3">
                        <div className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                          mode === "skip" ? "border-primary bg-primary/5" : "border-border"
                        }`}>
                          <RadioGroupItem value="skip" id="skip" />
                          <div>
                            <Label htmlFor="skip" className="font-medium leading-none">
                              Skip duplicates
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Protect existing records (recommended)
                            </p>
                          </div>
                        </div>

                        <div className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                          mode === "update" ? "border-primary bg-primary/5" : "border-border"
                        }`}>
                          <RadioGroupItem value="update" id="update" />
                          <div>
                            <Label htmlFor="update" className="font-medium leading-none">
                              Update existing
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Overwrite by email/phone match
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button
                      onClick={parseFile}
                      disabled={loading || !file}
                      className="w-full h-11 gap-2"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileUp className="h-4 w-4" />
                      )}
                      {loading ? "Validating..." : "Validate & Preview"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {preview.length > 0 && (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <TableIcon className="h-4 w-4" />
                      Preview Ready
                    </h3>
                    <Badge variant="secondary">
                      {preview.length} rows detected
                    </Badge>
                  </div>
                  <Button
                    onClick={importNow}
                    disabled={loading || errors.length > 0}
                    className="w-full h-11 gap-2"
                    variant="default"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Commit Import
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column – Preview & Errors */}
          <div className="lg:col-span-2 space-y-6">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Issues Detected</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {errors.map((err, i) => (
                      <div
                        key={i}
                        className="text-xs bg-red-50 border border-red-200 rounded p-2"
                      >
                        Row {err.row}: {err.message}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {preview.length > 0 ? (
              <Card>
                <CardHeader className="border-b pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon className="h-5 w-5 text-muted-foreground" />
                      Data Preview
                    </div>
                    <Badge variant="outline">
                      Showing first {Math.min(50, preview.length)} rows
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm border-collapse">
                      <thead className="sticky top-0 bg-muted z-10">
                        <tr>
                          {preview[0] &&
                            Object.keys(preview[0]).map((key) => (
                              <th
                                key={key}
                                className="p-3 text-left font-medium text-muted-foreground border-b"
                              >
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {preview.slice(0, 50).map((row, i) => (
                          <tr key={i} className="hover:bg-muted/50 transition-colors">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="p-3 text-muted-foreground truncate max-w-[200px]">
                                {val ?? "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                  <Upload className="h-16 w-16 mb-6 opacity-40" />
                  <h3 className="text-xl font-medium mb-2">No file loaded</h3>
                  <p className="text-sm max-w-md">
                    Upload a CSV or Excel file to preview and import student records in bulk.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}