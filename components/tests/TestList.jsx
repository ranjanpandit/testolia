"use client";

import { useEffect, useState, useCallback, cloneElement } from "react";
import {
  Trash2,
  Edit3,
  Settings,
  Layers,
  UserPlus,
  PlayCircle,
  Clock,
  Calendar,
  Loader2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // ← make sure this is added via shadcn
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label"; // optional – for better accessibility

// ────────────────────────────────────────────────
// Reusable small components
// ────────────────────────────────────────────────

function ActionIconButton({ icon, tooltip, onClick, disabled = false, variant = "ghost" }) {
  const baseClasses = "p-2 rounded-lg transition-colors";

  const variantClasses =
    variant === "destructive"
      ? "text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:hover:bg-transparent disabled:opacity-30"
      : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 disabled:hover:bg-transparent disabled:opacity-40";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, variantClasses, disabled && "cursor-not-allowed")}
      title={tooltip}
      aria-label={tooltip}
    >
      {cloneElement(icon, { className: "h-4.5 w-4.5" })}
    </button>
  );
}

// ────────────────────────────────────────────────
// Main List Component
// ────────────────────────────────────────────────

export default function TestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null); // prevent double clicks

  const loadTests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tests");
      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const testArray = Array.isArray(data) ? data : data.data || [];
      setTests(testArray);
    } catch (err) {
      console.error(err);
      setError("Failed to load assessment blueprints");
      toast.error("Cannot connect to test registry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const handleTogglePublish = async (test) => {
    const newStatus = test.status === "published" ? "draft" : "published";
    const testId = test.id;

    setTogglingId(testId);

    try {
      const res = await fetch(`/api/tests/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update status");
      }

      toast.success(`Test ${newStatus === "published" ? "published" : "unpublished"} successfully`);
      loadTests(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update publish status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("This assessment blueprint will be permanently deleted. Continue?")) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/tests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      toast.success("Blueprint successfully deleted");
      loadTests();
    } catch {
      toast.error("Deletion failed. Published tests cannot be deleted.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateResults = async (examId) => {
    if (!window.confirm("Generate results for ALL active attempts?\nThis action cannot be undone.")) return;

    toast.loading("Generating results...");

    try {
      const res = await fetch("/api/admin/results/generate-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });

      if (!res.ok) throw new Error();

      const result = await res.json();
      const generated = result.generated || 0;
      const failed = result.failed || 0;

      toast.dismiss();
      toast.success(`Results generated: ${generated} successful, ${failed} failed`);
    } catch {
      toast.dismiss();
      toast.error("Result generation failed");
    }
  };

  const filteredTests = tests.filter((test) => {
    const term = searchTerm.toLowerCase();
    return (
      (test.title || "").toLowerCase().includes(term) ||
      String(test.id || "").includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Controls - unchanged */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white p-5 rounded-2xl border shadow-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or ID..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 outline-none transition-all"
            aria-label="Search assessment blueprints"
          />
        </div>

        <div className="flex gap-3 self-end sm:self-center">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
            <Filter className="mr-2 h-3.5 w-3.5" />
            Filter
          </Button>

          <Button
            asChild
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100/50"
          >
            <Link href="/tests/add">
              <span className="flex items-center gap-1.5 font-semibold">
                <span>+</span> New Test
              </span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                {["Test", "Duration", "Publish", "Schedule", "Actions"].map((header) => (
                  <th
                    key={header}
                    className={cn(
                      "px-6 py-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide",
                      header === "Actions" && "text-right"
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-9 w-9 animate-spin text-indigo-500" />
                      <p className="text-sm font-medium text-slate-500">Loading registry...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <p className="text-slate-400 font-medium">
                      {searchTerm ? "No matching blueprints" : "No blueprints yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => {
                  const isPublished = test.status === "published";
                  const canPublish =
                    test.status !== "published" && (test.isFullyPopulated ?? false);
                  const isToggling = togglingId === test.id;

                  return (
                    <tr
                      key={test.id}
                      className="group hover:bg-indigo-25/40 transition-colors duration-150"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-mono font-bold text-sm shadow-sm">
                            #{test.id}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 truncate max-w-[260px]">
                              {test.title || "Untitled"}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              REF-{test.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/80 rounded-lg text-slate-700 text-sm font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          {test.duration_minutes || "?"} min
                        </div>
                      </td>

                      {/* Publish Toggle Column */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={isPublished}
                            
                            onCheckedChange={() => handleTogglePublish(test)}
                            className={cn(
                              isPublished && "data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isPublished ? "text-emerald-700" : "text-slate-500"
                            )}
                          >
                            {isPublished ? "Published" : "Draft"}
                          </span>

                          
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {test.start_time ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                              <Calendar className="h-4 w-4 text-indigo-500/80" />
                              {new Date(test.start_time).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="text-xs text-slate-500 pl-6">
                              {new Date(test.start_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm italic">Not scheduled</span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Link href={`/tests/${test.id}/edit`}>
                            <ActionIconButton icon={<Edit3 />} tooltip="Edit blueprint" />
                          </Link>

                          <Link href={`/tests/${test.id}/sections`}>
                            <ActionIconButton icon={<Layers />} tooltip="Manage sections" />
                          </Link>

                          <Link href={`/tests/${test.id}/assign`}>
                            <ActionIconButton icon={<UserPlus />} tooltip="Enrollment & access" />
                          </Link>

                          <Link href={`/tests/${test.id}/settings`}>
                            <ActionIconButton icon={<Settings />} tooltip="Test settings" />
                          </Link>

                          <div className="w-px h-5 bg-slate-200 mx-3" />

                          <ActionIconButton
                            icon={<PlayCircle />}
                            tooltip="Generate results for all attempts"
                            onClick={() => handleGenerateResults(test.id)}
                          />

                          <ActionIconButton
                            icon={<Trash2 />}
                            tooltip="Delete blueprint (draft only)"
                            variant="destructive"
                            disabled={isPublished || deletingId === test.id}
                            onClick={() => handleDelete(test.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer - unchanged */}
        <div className="px-6 py-4 bg-slate-50/60 border-t flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing {filteredTests.length} of {tests.length} blueprints
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" disabled className="rounded-lg">
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg">
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}