"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  UserPlus,
  Download,
  Upload,
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentList() {
  const [data, setData] = useState({ data: [], classes: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    classId: "all",
    sortBy: "id",
    order: "DESC",
    page: 1,
    limit: 10,
  });

  const searchTimeout = useRef(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      search: filters.search.trim(),
      status: filters.status === "all" ? "" : filters.status,
      classId: filters.classId === "all" ? "" : filters.classId,
      sortBy: filters.sortBy,
      order: filters.order,
      page: filters.page.toString(),
      limit: filters.limit.toString(),
    }).toString();

    try {
      const res = await fetch(`/api/students?${query}`);
      if (!res.ok) throw new Error("Failed to load students");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      fetchStudents();
    }, 350);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [fetchStudents]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleSort = (field) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      order: prev.sortBy === field && prev.order === "ASC" ? "DESC" : "ASC",
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      classId: "all",
      sortBy: "id",
      order: "DESC",
      page: 1,
      limit: 10,
    });
  };

  const exportStudents = () => {
    const query = new URLSearchParams({
      search: filters.search.trim(),
      status: filters.status === "all" ? "" : filters.status,
      classId: filters.classId === "all" ? "" : filters.classId,
      sortBy: filters.sortBy,
      order: filters.order,
    }).toString();

    window.location.href = `/api/students/export?${query}`;
  };

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />;
    return filters.order === "ASC" ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Students</h1>
                <p className="text-xs text-muted-foreground">
                  Total: <span className="font-medium">{data.total.toLocaleString()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/students/import">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={exportStudents}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button asChild size="sm">
                <Link href="/students/add">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <Card className="mb-6 sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <CardContent className="pt-5 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1 min-w-[240px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name, email, code..."
                    className="pl-9 h-10"
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={filters.classId}
                  onValueChange={(v) => updateFilter("classId", v)}
                >
                  <SelectTrigger className="w-[180px] h-10">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {data.classes?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(v) => updateFilter("status", v)}
                >
                  <SelectTrigger className="w-[160px] h-10">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.limit.toString()}
                  onValueChange={(v) => updateFilter("limit", Number(v))}
                >
                  <SelectTrigger className="w-[100px] h-10">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset filters">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : data.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                <Search className="h-16 w-16 mb-6 opacity-30" />
                <h3 className="text-xl font-medium mb-2">No students found</h3>
                <p className="text-sm max-w-md">
                  Try adjusting your filters or add a new student to get started.
                </p>
                <Button asChild className="mt-6 gap-2">
                  <Link href="/students/add">
                    <UserPlus className="h-4 w-4" />
                    Add First Student
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        {[
                          { label: "Student", field: "first_name" },
                          { label: "Contact", field: "email" },
                          { label: "Class", field: "class_name" },
                          { label: "Status", field: "status" },
                          { label: "Actions", sortable: false },
                        ].map((col) => (
                          <TableHead
                            key={col.label}
                            className={`cursor-pointer ${col.sortable !== false ? "hover:text-primary" : ""}`}
                            onClick={() => col.field && handleSort(col.field)}
                          >
                            <div className="flex items-center gap-1.5">
                              {col.label}
                              {col.field && <SortIcon field={col.field} />}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {data.data.map((student) => (
                        <TableRow key={student.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                                {student.first_name?.[0]}
                                {student.last_name?.[0]}
                              </div>
                              <div>
                                <div className="font-medium leading-tight">
                                  {student.first_name} {student.last_name}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {student.student_code}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-sm">
                            <div>{student.email}</div>
                            {student.phone && (
                              <div className="text-xs text-muted-foreground">{student.phone}</div>
                            )}
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {student.class_name || "Unassigned"}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                student.status === "active"
                                  ? "default"
                                  : student.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {student.status?.charAt(0).toUpperCase() + student.status?.slice(1) || "Active"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/students/${student.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {data.pages > 1 && (
                  <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/20">
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      Showing {data.data.length} of {data.total.toLocaleString()} students
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hidden sm:flex"
                        disabled={filters.page === 1}
                        onClick={() => updateFilter("page", 1)}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={filters.page === 1}
                        onClick={() => updateFilter("page", filters.page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <span className="text-sm font-medium px-3 sm:px-4">
                        {filters.page} / {data.pages}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        disabled={filters.page >= data.pages}
                        onClick={() => updateFilter("page", filters.page + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hidden sm:flex"
                        disabled={filters.page >= data.pages}
                        onClick={() => updateFilter("page", data.pages)}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}