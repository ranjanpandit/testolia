"use client";

import ChartComponent from "@/components/ui/Chart";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Card className="shadow">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Total Users</CardTitle>
            <Users />
          </CardHeader>
          <CardContent className="text-3xl font-bold">4,215</CardContent>
        </Card>

        <Card className="shadow">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Total Forms</CardTitle>
            <FileText />
          </CardHeader>
          <CardContent className="text-3xl font-bold">128</CardContent>
        </Card>

        <Card className="shadow">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Growth</CardTitle>
            <TrendingUp />
          </CardHeader>
          <CardContent className="text-3xl font-bold">+32%</CardContent>
        </Card>

      </div>

      {/* Line Chart */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle>Monthly Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartComponent
            type="line"
            series={[
              {
                name: "Users",
                data: [45, 52, 38, 60, 91, 125, 140, 170, 180, 200, 250, 300],
              },
            ]}
            categories={["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}
          />
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle>Forms Submitted Per Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartComponent
            type="bar"
            series={[
              {
                name: "Submissions",
                data: [120, 85, 200, 140, 290],
              },
            ]}
            categories={["Admissions", "Exams", "HR", "Events", "Feedback"]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
