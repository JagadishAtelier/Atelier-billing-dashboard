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
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";

// DATA (unchanged)
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

// ------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------
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
    <div className="p-8 bg-gray-100 min-h-screen space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
        <div className="flex items-center gap-4">
  <Brain className="w-8 h-8 text-purple-600" />
  <span className="text-[22px] font-normal text-gray-800">
    AI-Powered Analytics
  </span>
  <span
  className="flex items-center gap-2 text-white text-xs font-semibold px-3 py-1 rounded-full"
  style={{
    background: "linear-gradient(90deg, #a855f7, #ec4899)"
  }}
  >
  <Zap className="w-4 h-4 text-white" />
  Smart Insights
</span>
</div>

          <p className="text-gray-500 mt-1 text-sm">
            Intelligent predictions and automated recommendations for your business
          </p>
        </div>

        <button
  onClick={handleGenerateReorder}
  disabled={isGenerating}
  className="px-5 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 flex items-center shadow"
>
  {isGenerating ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span className="text-white">Generating...</span>
    </div>
  ) : (
    <>
      <Brain className="w-4 h-4 mr-2 text-white" />
      <span className="text-white">Generate AI Insights</span>
    </>
  )}
</button>

      </div>

      <div className="grid grid-cols-4 gap-4">

  {/* ================= STOCK RUNOUT ALERTS ================= */}
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 w-full">
    <div className="flex items-start gap-4">

      <div className="w-16 h-16 rounded-xl bg-[#FFE8D9] flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      </div>

      <div>
        <h2 className="text-3xl font-semibold text-[#1A1A1A]">4</h2>
        <h4 className="text-[16px] uppercase text-gray-600 font-medium">STOCK RUNOUT ALERTS</h4>
      </div>
    </div>

    <div className="border-t border-dashed border-gray-200 my-4"></div>

    <p className="text-gray-600 text-[15px]">Next 30 days</p>
  </div>

  {/* ================= PREDICTED SALES ================= */}
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 w-full">
    <div className="flex items-start gap-4">

      <div className="w-16 h-16 rounded-xl bg-[#DDE8FF] flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1E55FF" strokeWidth="2">
          <polyline points="4 14 10 8 14 12 20 6" />
        </svg>
      </div>

      <div>
        <h2 className="text-3xl font-semibold text-[#1A1A1A]">$58K</h2>
        <h4 className="text-[16px] uppercase text-gray-600 font-medium">PREDICTED SALES</h4>
      </div>
    </div>

    <div className="border-t border-dashed border-gray-200 my-4"></div>

    <p className="text-gray-600 text-[15px]">Next month</p>
  </div>

  {/* ================= FAST-MOVING ITEMS ================= */}
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 w-full">
    <div className="flex items-start gap-4">

      <div className="w-16 h-16 rounded-xl bg-[#D6FFE7] flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00A637" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 13 10" />
        </svg>
      </div>

      <div>
        <h2 className="text-3xl font-semibold text-[#1A1A1A]">4</h2>
        <h4 className="text-[16px] uppercase text-gray-600 font-medium">FAST-MOVING ITEMS</h4>
      </div>
    </div>

    <div className="border-t border-dashed border-gray-200 my-4"></div>

    <p className="text-gray-600 text-[15px]">High velocity</p>
  </div>

  {/* ================= SLOW MOVERS ================= */}
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 w-full">
    <div className="flex items-start gap-4">

      <div className="w-16 h-16 rounded-xl bg-[#FFE1CC] flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      <div>
        <h2 className="text-3xl font-semibold text-[#1A1A1A]">3</h2>
        <h4 className="text-[16px] uppercase text-gray-600 font-medium">SLOW MOVERS</h4>
      </div>
    </div>

    <div className="border-t border-dashed border-gray-200 my-4"></div>

    <p className="text-gray-600 text-[15px]">Needs action</p>
  </div>

</div>



<div className="bg-white rounded p-1 flex items-center gap-2">
  {[
    { key: "predictions", label: "Stock Predictions" },
    { key: "forecast", label: "Sales Forecast" },
    { key: "velocity", label: "Product Velocity" },
    { key: "seasonal", label: "Seasonal Insights" },
  ].map((t) => (
    <button
      key={t.key}
      onClick={() => setTab(t.key)}
      className={`px-4 py-2 rounded-md text-[15px] font-medium transition
        outline-none focus:outline-none focus:ring-0
        ${
          tab === t.key
            ? "bg-white text-black shadow-sm"  
            : "text-gray-800 hover:bg-gray-100"
        }`}
    >
      {t.label}
    </button>
  ))}
</div>
      {/* ------------------------------------------------------------
         PREDICTIONS TAB
      ------------------------------------------------------------ */}
  {tab === "predictions" && (
  <>
    <h2 className="text-[15px]  !font-normal font-[300] flex items-center gap-2 mb-4 text-gray-900">
      <Brain className="w-6 h-6 text-purple-600" />
      AI Stock Runout Prediction
    </h2>

    <div className="space-y-4">
      {predictedStockData.map((item, i) => (
        <motion.div
          key={item.product}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-purple-50/60 to-pink-50/60 border border-gray-200 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
            <h3 className="text-[17px] text-gray-900" style={{ fontWeight: 400 }}>
              {item.product}
              </h3>


            <div className="flex items-center gap-6 mt-1 text-[15px]">
              <span className="text-gray-900">
                Current: <span className="font-bold">{item.current}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-red-600">
                    Predicted: <span className="font-bold">{item.predicted}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FEEAD1] text-[#C86822] text-[13px] font-medium">
                      <Clock className="w-[14px] h-[14px] text-[#C86822]" />
                      {item.daysUntil} days
                      </span>
                      </div>
                      </div>

            </div>
            <button className="px-4 py-2 rounded-md text-white font-medium text-[15px] bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow">
              <span className="text-white">Reorder {item.reorderQty} Units</span>
              </button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[15px] text-white mb-1 font-medium">
                  <span className="text-white">Stock Depletion Progress</span>
              <span className="text-white">
                {(((item.current - item.predicted) / item.current) * 100).toFixed(0)}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-2 bg-[#1a1a1a] rounded-full transition-all duration-500"
                style={{
                  width: `${((item.current - item.predicted) / item.current) * 100}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </>
)}
{/* ------------------------------------------------------------
   SALES FORECAST TAB
------------------------------------------------------------ */}
{tab === "forecast" && (
  <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm">
    <h2 className="text-[16px]  !font-normal font-[300] flex items-center gap-2 mb-4 text-gray-900">
     30-Day Sales Forecast 
    </h2>
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={salesForecast}
        margin={{ top: 10, right: 40, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#d9d9d9" strokeDasharray="4" opacity={0.4} />
        <XAxis dataKey="month" stroke="#555" tickMargin={10} />
        <YAxis stroke="#555" />
        <Tooltip 
          contentStyle={{ 
            background: "white", 
            borderRadius: "10px", 
            border: "1px solid #eee" 
          }} 
        />
        <Area
          type="monotone"
          dataKey="actual"
          name="Actual Sales"
          stroke="#4F46E5"         
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#actualGradient)"
        />
        <Area
          type="monotone"
          dataKey="predicted"
          name="Predicted Sales"
          stroke="#A855F7"         
          strokeWidth={3}
          strokeDasharray="6 6"  
          fillOpacity={1}
          fill="url(#predictedGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
    <div className="grid grid-cols-3 gap-4 mt-6">
  <div className="p-5 bg-[#F0F6FF] text-[#1E40AF] rounded-2xl border border-[#E0ECFF]">
    <p className="text-[15px] font-normal">Predicted Growth</p>
    <p className="text-[28px] font-normal mt-1">+12.5%</p>
  </div>
  <div className="p-5 bg-[#F9F2FF] text-[#7E22CE] rounded-2xl border border-[#ECD8FF]">
    <p className="text-[15px] font-normal">Confidence Score</p>
    <p className="text-[28px] font-normal mt-1">87%</p>
  </div>
  <div className="p-5 bg-[#F0FFF6] text-[#0F8A4C] rounded-2xl border border-[#D7FFE9]">
    <p className="text-[15px] font-normal">Expected Revenue</p>
    <p className="text-[28px] font-normal mt-1">$179K</p>
  </div>
</div>
 </div>
)}

      {/* ------------------------------------------------------------
         VELOCITY TAB
      ------------------------------------------------------------ */}
     {tab === "velocity" && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 text-[15px] font-normal">

    <div>
    <h2 className="text-[15px]  !font-normal font-[300] flex items-center gap-2 mb-4 text-gray-900">
  <Zap className="w-5 h-5 text-green-600" />
  Fast-Moving Products
</h2>


      {fastMovingProducts.map((prod, i) => (
        <div
          key={prod.name}
          className="p-5 rounded-xl mb-4 bg-gradient-to-r from-green-50 to-blue-50 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-gray-800">{prod.name}</p>
              <p className="text-gray-600 text-[14px]">{prod.avgSalesPerDay} units/day avg</p>
            </div>
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-[13px]">
              <TrendingUp className="w-4 h-4" /> Up
            </span>
          </div>
          <p className="text-gray-600 text-[14px] mb-1">Velocity Score</p>
          <div className="w-full bg-gray-300 h-3 rounded-full">
            <div
              className="h-3 bg-black rounded-full"
              style={{ width: `${prod.velocity}%` }}
            ></div>
          </div>

          <p className="text-right text-gray-600 text-[13px] mt-1">{prod.velocity}/100</p>
        </div>
      ))}
    </div>
    <div>
    <h2 className="text-[15px]  !font-normal font-[300] flex items-center gap-2 mb-4 text-gray-900">
  <Clock className="w-5 h-5 text-orange-600" />
  Slow-Moving Products
</h2>


      {slowMovingProducts.map((prod, i) => (
        <div
          key={prod.name}
          className="p-5 rounded-xl mb-4 bg-gradient-to-r from-orange-50 to-red-50 shadow-sm"
        >
          <div className="flex justify-between mb-2">
            <div>
              <p className="text-gray-800">{prod.name}</p>
              <p className="text-[14px] text-gray-600">{prod.avgSalesPerDay} units/day</p>
            </div>

            <div className="text-right">
              <p className="text-orange-600 font-medium">{prod.daysInStock} days</p>
              <p className="text-gray-500 text-[13px]">in stock</p>
            </div>
          </div>

          <div className="border-t pt-3 flex justify-between">
            <span className="text-gray-700">Stock Value: ₹{prod.value}</span>
            <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100">
              Create Offer
            </button>
          </div>
        </div>
      ))}
    </div>

  </div>
)}
{/* ======================= Seasonal Demand Insights ======================= */}
{tab === "seasonal" && (
  <div className="mt-12 pb-10">
    <div className="flex items-center gap-2 mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="#2563eb"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="10" />
      </svg>

      <h2 className="text-[15px]  !font-normal font-[300] flex items-center gap-2 mb-4 text-gray-900">
        Seasonal Demand Insights
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 rounded-[20px] bg-gradient-to-b from-blue-50 to-purple-50 shadow-sm">
<span className="px-3 py-1 bg-blue-200 text-blue-600 text-14px rounded-lg inline-block mb-3">
  Holiday Season
</span>
<p className="text-[17px] font-normal text-gray-900 mb-4">
  iPhone 15 Pro
</p>
        <div className="mt-4 bg-white rounded-xl p-4 flex justify-between items-center">
          <span className="text-gray-700 text-[14px]">Expected Increase</span>
          <span className="text-green-600 text-[16px] font-normal text-right">45%</span>
        </div>
        <div className="mt-3 bg-white rounded-xl p-4 flex justify-between items-center">
          <span className="text-gray-700 text-[14px]">Peak Month</span>
          <span className="text-gray-800 text-[16px] font-normal text-right">December</span>
        </div>
        <button className="w-full mt-5 bg-white py-3 rounded-xl text-gray-900 font-medium shadow">
          Prepare Stock
        </button>
      </div>
      <div className="p-6 rounded-[20px] bg-gradient-to-b from-blue-50 to-purple-50 shadow-sm">

  <span className="px-3 py-1 bg-blue-200 text-blue-600 text-14px rounded-lg inline-block mb-3">
    Back to School
  </span>

  <p className="text-[17px] font-normal text-gray-900 mb-4">
    Back to School Bundle
  </p>
        <div className="mt-4 bg-white rounded-xl p-4 flex justify-between items-center">
          <span className="text-gray-700 text-[14px]">Expected Increase</span>
          <span className="text-green-600 text-[16px] font-normal text-right">78%</span>
        </div>
        <div className="mt-3 bg-white rounded-xl p-4 flex justify-between items-center">
          <span className="text-gray-700 text-[14px]">Peak Month</span>
          <span className="text-gray-800 text-[16px] font-normal text-right">August</span>
        </div>

        <button className="w-full mt-5 bg-white py-3 rounded-xl text-gray-900 font-medium shadow">
          Prepare Stock
        </button>
      </div>
      <div className="p-6 rounded-[20px] bg-gradient-to-b from-blue-50 to-purple-50 shadow-sm">

  <span className="px-3 py-1 bg-blue-200 text-blue-600 text-14px rounded-lg inline-block mb-3">
    Summer
  </span>

  <p className="text-[17px] font-normal text-gray-900 mb-4">
    Air Conditioner
  </p>
        <div className="mt-4 bg-white rounded-xl p-4 flex justify-between items-center">
          <span className="text-gray-700 text-[14px]">Expected Increase</span>
          <span className="text-green-600 text-[16px] font-normal text-right">120%</span>
        </div>
        <div className="mt-3 bg-white rounded-xl p-4 flex justify-between items-center">
          <span className="text-gray-700 text-[14px]">Peak Month</span>
          <span className="text-gray-800 text-[16px] font-normal text-right">June</span>
        </div>

        <button className="w-full mt-5 bg-white py-3 rounded-xl text-gray-900 font-medium shadow">
          Prepare Stock
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
} 