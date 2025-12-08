// Reports.jsx
import React, { useState } from "react";
import {
  Download,
  FileText,
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { motion } from "framer-motion";


const salesReportData = [
  { month: "Jan", sales: 45000, profit: 12000 },
  { month: "Feb", sales: 52000, profit: 15000 },
  { month: "Mar", sales: 48000, profit: 13500 },
  { month: "Apr", sales: 61000, profit: 18000 },
  { month: "May", sales: 55000, profit: 16000 },
  { month: "Jun", sales: 67000, profit: 20000 },
];

const purchaseReportData = [
  { month: "Jan", purchases: 32000 },
  { month: "Feb", purchases: 38000 },
  { month: "Mar", purchases: 35000 },
  { month: "Apr", purchases: 42000 },
  { month: "May", purchases: 39000 },
  { month: "Jun", purchases: 45000 },
];

const stockMovementData = [
  { product: 'iPhone 15 Pro Max', inward: 50, outward: 45, closing: 35 },
  { product: 'Samsung Galaxy S24', inward: 40, outward: 38, closing: 25 },
  { product: 'MacBook Pro 14"', inward: 30, outward: 23, closing: 18 },
  { product: 'AirPods Pro 2', inward: 100, outward: 92, closing: 68 },
  { product: 'Sony WH-1000XM5', inward: 60, outward: 52, closing: 38 },
];

const topSellingProducts = [
  { rank: 1, product: "AirPods Pro 2", units: 92, revenue: "₹22,908" },
  { rank: 2, product: "iPhone 15 Pro Max", units: 45, revenue: "₹67,500" },
  { rank: 3, product: "Samsung Galaxy S24", units: 38, revenue: "₹53,200" },
  { rank: 4, product: 'MacBook Pro 14"', units: 23, revenue: "₹45,770" },
  { rank: 5, product: "Sony WH-1000XM5", units: 52, revenue: "₹20,748" },
];

export default function Reports() {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("month");

  const handleExport = (format) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // integrate actual export logic here
  };

  return (
    <div className="p-8 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 text-2xl font-semibold">Reports &amp; Analytics</h1>
          <p className="text-gray-500 mt-1">Generate detailed reports and analyze your business performance.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export Excel</span>
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Filters (card) */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-gray-100 rounded-md px-3 py-2"
              >
                <option value="sales">Sales Report</option>
                <option value="purchase">Purchase Report</option>
                <option value="profit">Profit &amp; Loss</option>
                <option value="stock">Stock Valuation</option>
                <option value="movement">Stock Movement</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-gray-100 rounded-md px-3 py-2"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-600">From Date</label>
              <input type="date" className="w-full bg-gray-100 rounded-md px-3 py-2" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-600">To Date</label>
              <input type="date" className="w-full bg-gray-100 rounded-md px-3 py-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

{/* Total Sales */}
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 15 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  whileHover={{ scale: 1.05, y: -6 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.25, ease: "easeOut" }}
  className="bg-white shadow rounded-lg p-6 flex items-center gap-4 cursor-pointer"
>
  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
    <DollarSign className="w-6 h-6 text-blue-600" />
  </div>
  <div>
    <p className="text-gray-500 text-sm">Total Sales</p>
    <p className="text-gray-900 mt-1 font-semibold">₹328,000</p>
  </div>
</motion.div>

{/* Total Purchases */}
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 15 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  whileHover={{ scale: 1.05, y: -6 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.28, ease: "easeOut" }}
  className="bg-white shadow rounded-lg p-6 flex items-center gap-4 cursor-pointer"
>
  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
    <ShoppingCart className="w-6 h-6 text-purple-600" />
  </div>
  <div>
    <p className="text-gray-500 text-sm">Total Purchases</p>
    <p className="text-gray-900 mt-1 font-semibold">₹231,000</p>
  </div>
</motion.div>

{/* Total Profit */}
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 15 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  whileHover={{ scale: 1.05, y: -6 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.30, ease: "easeOut" }}
  className="bg-white shadow rounded-lg p-6 flex items-center gap-4 cursor-pointer"
>
  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
    <TrendingUp className="w-6 h-6 text-green-600" />
  </div>
  <div>
    <p className="text-gray-500 text-sm">Total Profit</p>
    <p className="text-gray-900 mt-1 font-semibold">₹94,500</p>
  </div>
</motion.div>

{/* Stock Value */}
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 15 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  whileHover={{ scale: 1.05, y: -6 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.33, ease: "easeOut" }}
  className="bg-white shadow rounded-lg p-6 flex items-center gap-4 cursor-pointer"
>
  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
    <Package className="w-6 h-6 text-orange-600" />
  </div>
  <div>
    <p className="text-gray-500 text-sm">Stock Value</p>
    <p className="text-gray-900 mt-1 font-semibold">₹456,789</p>
  </div>
</motion.div>

</div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg">
          <div className="p-4 ">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-800">Sales & Profit Trend</h3>
            </div>
          </div>

          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesReportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-4 ">
            <h3 className="text-sm font-medium text-gray-800">Purchase Trend</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={purchaseReportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="purchases" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stock Movement Report */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 ">
          <h3 className="text-sm font-medium text-gray-800">Stock Movement Report</h3>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50  border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-500">Product</th>
                <th className="px-6 py-3 text-left text-gray-500">Opening Stock</th>
                <th className="px-6 py-3 text-left text-gray-500">Inward</th>
                <th className="px-6 py-3 text-left text-gray-500">Outward</th>
                <th className="px-6 py-3 text-left text-gray-500">Closing Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockMovementData.map((item) => (
                <tr key={item.product} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{item.product}</td>
                  <td className="px-6 py-4 text-gray-600">{item.closing + item.outward - item.inward}</td>
                  <td className="px-6 py-4 text-green-600">{item.inward}</td>
                  <td className="px-6 py-4 text-red-600">{item.outward}</td>
                  <td className="px-6 py-4 text-gray-900">{item.closing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 ">
          <h3 className="text-sm font-medium text-gray-800">Top Selling Products</h3>
        </div>

        <div className="p-4 space-y-3">
          {topSellingProducts.map((product) => (
            <div key={product.rank} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">#{product.rank}</span>
                </div>
                <div>
                  <p className="text-gray-900">{product.product}</p>
                  <p className="text-gray-500 text-sm">{product.units} units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-900">{product.revenue}</p>
                <p className="text-gray-500 text-sm">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-800">Quick Report Templates</h3>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-left">
            <FileText className="w-5 h-5 mr-3 text-blue-600" />
            <div>
              <p className="text-gray-900">Daily Sales Report</p>
              <p className="text-gray-500 text-sm">Generate today's sales summary</p>
            </div>
          </button>

          <button className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-left">
            <FileText className="w-5 h-5 mr-3 text-purple-600" />
            <div>
              <p className="text-gray-900">Monthly P&amp;L Statement</p>
              <p className="text-gray-500 text-sm">Profit &amp; loss for this month</p>
            </div>
          </button>

          <button className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-left">
            <FileText className="w-5 h-5 mr-3 text-green-600" />
            <div>
              <p className="text-gray-900">Stock Valuation Report</p>
              <p className="text-gray-500 text-sm">Current inventory valuation</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
