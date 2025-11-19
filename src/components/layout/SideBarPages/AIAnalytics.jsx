import React, { useState } from "react";
import {
  Brain,
  TrendingUp,
  Package,
  AlertCircle,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";

const predictedStockData = [
  { product: "iPhone 15 Pro Max", current: 35, predicted: 5, daysUntil: 12, reorderQty: 50 },
  { product: "Samsung Galaxy S24", current: 25, predicted: 3, daysUntil: 15, reorderQty: 40 },
  { product: 'MacBook Pro 14"', current: 18, predicted: 8, daysUntil: 20, reorderQty: 25 },
  { product: "AirPods Pro 2", current: 68, predicted: 15, daysUntil: 8, reorderQty: 100 },
];

const salesForecast = [
  { month: "Dec", actual: 45000, predicted: 48000 },
  { month: "Jan", actual: 52000, predicted: 55000 },
  { month: "Feb", actual: 48000, predicted: 51000 },
  { month: "Mar", predicted: 58000 },
  { month: "Apr", predicted: 62000 },
  { month: "May", predicted: 59000 },
];

const fastMovingProducts = [
  { name: "iPhone 15 Pro Max", avgSalesPerDay: 5.2, trend: "up", velocity: 95 },
  { name: "AirPods Pro 2", avgSalesPerDay: 8.5, trend: "up", velocity: 98 },
  { name: "Samsung Galaxy S24", avgSalesPerDay: 4.1, trend: "up", velocity: 88 },
  { name: "MacBook Air M2", avgSalesPerDay: 2.8, trend: "stable", velocity: 75 },
];

const slowMovingProducts = [
  { name: "Tablet Stand", avgSalesPerDay: 0.3, daysInStock: 145, value: 450 },
  { name: "HDMI Cable 10m", avgSalesPerDay: 0.5, daysInStock: 120, value: 890 },
  { name: "USB-C Hub", avgSalesPerDay: 0.4, daysInStock: 98, value: 1200 },
];

const seasonalInsights = [
  { product: "iPhone 15 Pro", season: "Holiday Season", expectedIncrease: "45%", peakMonth: "December" },
  { product: "Back to School Bundle", season: "Back to School", expectedIncrease: "78%", peakMonth: "August" },
  { product: "Air Conditioner", season: "Summer", expectedIncrease: "120%", peakMonth: "June" },
];

export default function AIAnalytics() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tab, setTab] = useState("predictions");

  const handleGenerateReorder = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Reorder suggestions generated");
    }, 2000);
  };

  return (
    <div className="p-8 space-y-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3 text-gray-900">
            <Brain className="w-8 h-8 text-purple-600" />
            AI-Powered Analytics
            <span className="px-3 py-1 text-white text-xs rounded-md bg-gradient-to-r from-purple-500 to-pink-500 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Smart Insights
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            Intelligent predictions and automated recommendations
          </p>
        </div>

        <button
          onClick={handleGenerateReorder}
          disabled={isGenerating}
          className="px-5 py-2 rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </div>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2 text-[#fff]" /><span className="text-[#fff]">Generate AI Insights</span> 
            </>
          )}
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Card */}
        <motion.div whileHover={{ scale: 1.02 }} className="p-6 rounded-xl shadow-lg text-white bg-gradient-to-br from-purple-500 to-purple-600">
          <p className="text-purple-100">Stock Runout Alerts</p>
          <p className="text-3xl mt-2">{predictedStockData.length}</p>
          <p className="text-purple-100 text-sm">Next 30 days</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="p-6 rounded-xl shadow-lg text-white bg-gradient-to-br from-blue-500 to-blue-600">
          <p className="text-blue-100">Predicted Sales</p>
          <p className="text-3xl mt-2">₹58K</p>
          <p className="text-blue-100 text-sm">Next month</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="p-6 rounded-xl shadow-lg text-white bg-gradient-to-br from-green-500 to-green-600">
          <p className="text-green-100">Fast Movers</p>
          <p className="text-3xl mt-2">{fastMovingProducts.length}</p>
          <p className="text-green-100 text-sm">High velocity</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="p-6 rounded-xl shadow-lg text-white bg-gradient-to-br from-orange-500 to-orange-600">
          <p className="text-orange-100">Slow Movers</p>
          <p className="text-3xl mt-2">{slowMovingProducts.length}</p>
          <p className="text-orange-100 text-sm">Needs Action</p>
        </motion.div>
      </div>

      {/* TABS */}
      <div>
        <div className="flex gap-3 bg-white border p-2 rounded-lg">
          {["predictions", "forecast", "velocity", "seasonal"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                tab === t
                  ? "bg-purple-600 !text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t.replace(/^\w/, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* ====================== PREDICTIONS TAB ====================== */}
        {tab === "predictions" && (
          <div className="space-y-4 mt-6">
            {predictedStockData.map((item, i) => (
              <motion.div
                key={item.product}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-900 font-medium">{item.product}</h3>
                    <p className="text-sm text-gray-600 flex gap-4">
                      Current: <strong>{item.current}</strong>
                      <span className="text-red-600">Predicted: {item.predicted}</span>
                    </p>
                    <span className="text-sm px-3 py-1 bg-orange-100 text-orange-700 rounded-md mt-2 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.daysUntil} days
                    </span>
                  </div>

                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 !text-white rounded-md">
                    Reorder {item.reorderQty} Units
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Stock Depletion Progress</span>
                    <span>
                      {(((item.current - item.predicted) / item.current) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-purple-500"
                      style={{
                        width: `${((item.current - item.predicted) / item.current) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ====================== FORECAST TAB ====================== */}
        {tab === "forecast" && (
          <div className="mt-6 p-6 bg-white shadow rounded-xl">
            <h2 className="text-xl font-medium mb-4">30-Day Sales Forecast</h2>

            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={salesForecast}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="url(#colorActual)" strokeWidth={2} />
                <Area type="monotone" dataKey="predicted" stroke="#a855f7" fill="url(#colorPredicted)" strokeWidth={2} strokeDasharray="6 6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ====================== VELOCITY TAB ====================== */}
        {tab === "velocity" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Fast-Movers */}
            <div className="p-6 bg-white rounded-xl shadow">
              <h2 className="text-xl font-medium flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-green-600" />
                Fast-Moving Products
              </h2>

              {fastMovingProducts.map((prod, i) => (
                <motion.div
                  key={prod.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 mb-4 bg-gradient-to-r from-green-50 to-blue-50 border rounded-xl"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-gray-900">{prod.name}</h3>
                      <p className="text-sm text-gray-500">{prod.avgSalesPerDay} units/day</p>
                    </div>
                    <span className="px-3 py-1 text-green-700 bg-green-100 rounded-md text-sm capitalize">
                      {prod.trend}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Velocity Score</span>
                      <span>{prod.velocity}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div
                        className="h-2 bg-green-600 rounded-full"
                        style={{ width: `${prod.velocity}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Slow Movers */}
            <div className="p-6 bg-white rounded-xl shadow">
              <h2 className="text-xl font-medium flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-600" />
                Slow-Moving Products
              </h2>

              {slowMovingProducts.map((prod, i) => (
                <motion.div
                  key={prod.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 mb-4 bg-gradient-to-r from-orange-50 to-red-50 border rounded-xl"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-gray-900">{prod.name}</h3>
                      <p className="text-sm text-gray-500">{prod.avgSalesPerDay} units/day</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-600">{prod.daysInStock} days</p>
                      <p className="text-gray-500 text-xs">in stock</p>
                    </div>
                  </div>

                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-sm text-gray-600">Stock Value: ₹{prod.value}</span>
                    <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100">
                      Create Offer
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ====================== SEASONAL TAB ====================== */}
        {tab === "seasonal" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {seasonalInsights.map((ins, i) => (
              <motion.div
                key={ins.product}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border rounded-xl shadow"
              >
                <span className="px-3 py-1 text-blue-700 bg-blue-100 rounded-md text-sm">
                  {ins.season}
                </span>

                <h3 className="text-lg font-medium mt-3 text-gray-900">{ins.product}</h3>

                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-white rounded-lg flex justify-between text-sm">
                    <span className="text-gray-600">Expected Increase</span>
                    <span className="text-green-600">{ins.expectedIncrease}</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg flex justify-between text-sm">
                    <span className="text-gray-600">Peak Month</span>
                    <span className="text-gray-900">{ins.peakMonth}</span>
                  </div>
                </div>

                <button className="mt-4 w-full py-2 border rounded-md hover:bg-gray-100">
                  Prepare Stock
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
