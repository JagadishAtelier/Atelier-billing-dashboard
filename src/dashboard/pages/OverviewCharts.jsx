// src/components/OverviewCharts.jsx
import React, { useState, useEffect } from "react";
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

// Default Data
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
  const [salesFilter, setSalesFilter] = useState("monthly");
  const [categoryFilter, setCategoryFilter] = useState("monthly");
  useEffect(() => {
    const content = document.querySelector(".ant-layout-content");
    if (content) {
      content.style.overflowY = "scroll";    // scrollbar ALWAYS visible
    }
  }, []);
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* SALES & PROFIT CHART */}
      <Card className="lg:col-span-2 border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sales & Profit Overview</span>

            <Select value={salesFilter} onValueChange={(v) => setSalesFilter(v)}>
              <SelectTrigger className="w-[140px] bg-white border border-gray-200 shadow-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>

              <SelectContent className="bg-white" position="popper">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>

          </CardTitle>
        </CardHeader>

        <CardContent>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
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

                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="url(#colorSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* CATEGORY PIE CHART */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sales by Category</span>

            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
              <SelectTrigger className="w-[130px] bg-white border border-gray-200 shadow-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>

              <SelectContent className="bg-white" position="popper">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>

          </CardTitle>
        </CardHeader>

        <CardContent>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
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
