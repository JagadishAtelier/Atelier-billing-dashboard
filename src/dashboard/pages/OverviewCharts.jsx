// src/components/OverviewCharts.jsx
import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const defaultSalesData = [
  { name: "Mon", sales: 4000, purchases: 2400, profit: 1600 },
  { name: "Tue", sales: 3000, purchases: 1398, profit: 1602 },
  { name: "Wed", sales: 5000, purchases: 2800, profit: 2200 },
  { name: "Thu", sales: 2780, purchases: 3908, profit: -1128 },
  { name: "Fri", sales: 6890, purchases: 4800, profit: 2090 },
  { name: "Sat", sales: 7390, purchases: 3800, profit: 3590 },
  { name: "Sun", sales: 5490, purchases: 4300, profit: 1190 },
];

const defaultCategoryData = [
  { name: "Electronics", value: 35, color: "#3b82f6" },
  { name: "Clothing", value: 25, color: "#8b5cf6" },
  { name: "Food", value: 20, color: "#10b981" },
  { name: "Furniture", value: 15, color: "#f59e0b" },
  { name: "Others", value: 5, color: "#6b7280" },
];

export default function OverviewCharts({
  salesData = defaultSalesData,
  categoryData = defaultCategoryData,
}) {
  const [filter, setFilter] = useState("monthly");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Sales & Profit Overview */}
      <Card className="lg:col-span-2 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">

            <span>Sales & Profit Overview</span>

            {/* Dropdown Box */}
            {/* Dropdown Box */}
            <Select value={filter} onValueChange={(v) => setFilter(v)}>
              <SelectTrigger className="w-[140px] bg-white border border-gray-200 shadow-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-[#fff]">
                <SelectItem value="monthly" className="hover:bg-gray-100">Monthly</SelectItem>
                <SelectItem value="weekly" className="hover:bg-gray-100">Weekly</SelectItem>
              </SelectContent>
            </Select>


          </CardTitle>
        </CardHeader>

        <CardContent>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  fill="url(#colorSales)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales by Category */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sales by Category</span>
            <Select value={filter} onValueChange={(v) => setFilter(v)}>
              <SelectTrigger className="w-[130px] bg-white border border-gray-200 shadow-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-[#fff]">
                <SelectItem value="monthly" className="hover:bg-gray-100">Monthly</SelectItem>
                <SelectItem value="weekly" className="hover:bg-gray-100">Weekly</SelectItem>
              </SelectContent>
            </Select>
            </CardTitle>
          
        </CardHeader>

        <CardContent>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
