"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  Activity,
  CalendarDays,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  UserPlus,
} from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import ChartComponent from "@/components/ui/Chart";

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        users: { total: 5423, growth: 18.7 },
        exams: { total: 187, active: 23 },
        revenue: { total: 1248000, pending: 45800 },
      });
    }, 800);
  }, []);

  if (!stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/40 p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ------------------------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------------------------ */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button size="sm">Generate Report</Button>
          </div>
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* KPI Row */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            title="Total Candidates"
            value={stats.users.total.toLocaleString()}
            change={stats.users.growth}
            icon={<Users />}
          />

          <StatCard
            title="Active Exams"
            value={stats.exams.active}
            change={Math.round((stats.exams.active / stats.exams.total) * 100)}
            suffix={` / ${stats.exams.total}`}
            icon={<Activity />}
          />

          <StatCard
            title="Total Revenue"
            value={`₹${(stats.revenue.total / 100000).toFixed(1)}L`}
            change={-4.2}
            suffix={` | ₹${(stats.revenue.pending / 1000).toFixed(0)}K pending`}
            icon={<IndianRupee />}
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Charts */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard
            title="Candidate Registrations"
            description="Monthly new registrations"
            badge="+18.7% YoY"
          >
            <ChartComponent
              type="line"
              height={320}
              series={[
                {
                  name: "Registrations",
                  data: [320, 480, 380, 620, 910, 1250, 1480, 1670, 1820, 2100, 2450, 3200],
                },
              ]}
              categories={["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}
              colors={["#2563eb"]}
              curve="smooth"
            />
          </ChartCard>

          <ChartCard
            title="Exam Category Distribution"
            description="Active & upcoming exams"
            badge="187 Exams"
          >
            <ChartComponent
              type="bar"
              height={320}
              series={[
                { name: "Exams", data: [42, 28, 65, 35, 17] },
              ]}
              categories={[
                "Engineering",
                "Medical",
                "Management",
                "Government",
                "Others",
              ]}
            />
          </ChartCard>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Quick Actions */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            title="Create Test"
            description="New examination"
            icon={<FileText />}
            href="/tests/new"
          />
          <QuickAction
            title="Add Candidate"
            description="Student registration"
            icon={<UserPlus />}
            href="/students/add"
          />
          <QuickAction
            title="Pending Fees"
            description="Process dues"
            icon={<IndianRupee />}
            badge="₹12K"
            href="/fees/pending"
          />
          <QuickAction
            title="Live Exams"
            description="Monitor sessions"
            icon={<Activity />}
            badge="23"
            href="/live"
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENTS                                   */
/* -------------------------------------------------------------------------- */

function StatCard({ title, value, change, icon, suffix }) {
  const positive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold">
            {value}
            {suffix && (
              <span className="ml-2 text-sm text-muted-foreground">
                {suffix}
              </span>
            )}
          </h3>
          <div
            className={cn(
              "mt-2 inline-flex items-center text-sm font-medium",
              positive ? "text-emerald-600" : "text-red-600"
            )}
          >
            {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3 text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, badge, children }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {badge && <Badge variant="outline">{badge}</Badge>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function QuickAction({ title, description, icon, href, badge }) {
  return (
    <Link href={href}>
      <Card className="hover:bg-muted/50 transition">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="rounded-lg bg-muted p-3">{icon}</div>
          <div className="flex-1">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {badge && <Badge>{badge}</Badge>}
        </CardContent>
      </Card>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SKELETON                                      */
/* -------------------------------------------------------------------------- */

function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-10 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
