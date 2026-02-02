"use client";

import { useEffect, useState } from "react";
import ChartComponent from "@/components/ui/Chart";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  CalendarDays,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: { total: 0, growth: 0 },
    exams: { total: 0, active: 0 },
    revenue: { total: 0, pending: 0 }
  });

  // Mock data fetching - in production, replace with useEffect calling your API
  useEffect(() => {
    setStats({
      users: { total: 4215, growth: 12.5 },
      exams: { total: 128, active: 14 },
      revenue: { total: "854k", pending: "12k" }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 space-y-10">
      
      {/* TOP BAR: Contextual Info & Actions */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Command Center</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> System Overview: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-bold uppercase tracking-widest bg-white shadow-sm">
            <Filter className="w-3 h-3 mr-2" /> Filter
          </Button>
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all">
            Generate Report
          </Button>
        </div>
      </header>

      {/* STATS GRID: High-Density Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Candidate Registry" 
          value={stats.users.total.toLocaleString()} 
          subValue={`${stats.users.growth}% from last month`}
          icon={<Users className="text-indigo-600" />}
          trend="up"
        />
        <StatCard 
          title="Examination Index" 
          value={stats.exams.total} 
          subValue={`${stats.exams.active} active sessions`}
          icon={<Activity className="text-emerald-600" />}
          trend="up"
        />
        <StatCard 
          title="Financial Liquidity" 
          value={`₹${stats.revenue.total}`} 
          subValue={`₹${stats.revenue.pending} outstanding`}
          icon={<TrendingUp className="text-amber-600" />}
          trend="down"
          isCurrency
        />
      </div>

      {/* MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Registration Analytics */}
        <Card className="rounded-[2rem] border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-50 p-8">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-800">Enrollment Velocity</CardTitle>
                <CardDescription className="font-medium">Monthly candidate registration trends</CardDescription>
              </div>
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Live Feed</div>
            </div>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <ChartComponent
              type="line"
              series={[
                {
                  name: "Registrations",
                  data: [45, 52, 38, 60, 91, 125, 140, 170, 180, 200, 250, 300],
                },
              ]}
              categories={["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}
              color="#4f46e5"
            />
          </CardContent>
        </Card>

        {/* Categorical Distribution */}
        <Card className="rounded-[2rem] border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-50 p-8">
             <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-800">Operational Distribution</CardTitle>
             <CardDescription className="font-medium">Submissions categorized by department</CardDescription>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <ChartComponent
              type="bar"
              series={[
                {
                  name: "Submissions",
                  data: [120, 85, 200, 140, 290],
                },
              ]}
              categories={["Admissions", "Exams", "HR", "Events", "Feedback"]}
              color="#0f172a"
            />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

/* Sub-component for Stats to maintain consistency 
*/
function StatCard({ title, value, subValue, icon, trend, isCurrency }) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {trend === "up" ? (
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold">
              <ArrowDownRight className="w-3 h-3" /> -2%
            </div>
          )}
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
          <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1">
             {subValue}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}