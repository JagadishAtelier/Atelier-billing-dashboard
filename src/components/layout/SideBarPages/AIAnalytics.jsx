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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();


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
        <div className="flex items-center gap-3">
  <Brain className="w-8 h-8 text-purple-600" />

  <h1 className="text-[30px] font-bold text-[#1F2937]">
    AI-Powered Analytics
  </h1>

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

<p className="text-gray-500 text-sm mt-1">
  Intelligent predictions and automated recommendations for your business
</p>

        </div>

        <button
  onClick={handleGenerateReorder}
  disabled={isGenerating}
  className="px-5 py-2 rounded-lg text-white font-medium 
  flex items-center shadow 
  bg-[#4C6EF5] hover:bg-[#3f5cd6]"
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
  <div className="bg-white rounded-2xl shadow-sm p-4 w-[270px] h-[130px] border border-gray-200">
  <div className="flex items-start justify-between">

    {/* ICON + NUMBER */}
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-[#FFE7DA] rounded-xl flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
 stroke="#FF6A00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 19h18L12 4 3 19z"/>
  <path d="M12 10v4"/>
  <path d="M12 16h0.01"/>
</svg>

      </div>
      <h2 className="text-3xl font-bold text-[#1F2937]">4</h2>
    </div>

    {/* ARROW → */}
    <div className="w-10 h-10 rounded-full bg-[#F5F5FF] shadow flex items-center justify-center cursor-pointer">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B3F51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </div>

  </div>
  <p className="text-[13px] text-[#475467] font-semibold mt-1 ml-[4.5rem]">
</p>

  <p className="text-gray-600 text-sm">Stock alerts</p>
</div>

  {/* ================= PREDICTED SALES ================= */}
  <div className="bg-white rounded-2xl shadow-sm p-4 w-[270px] h-[130px] border border-gray-200">
  <div className="flex items-start justify-between">

    {/* ICON + NUMBER */}
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-[#E7EBFF] rounded-xl flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1E55FF" strokeWidth="2">
          <rect x="3" y="14" width="3" height="7" rx="1" fill="#1E55FF" />
          <rect x="9" y="10" width="3" height="11" rx="1" fill="#1E55FF" />
          <rect x="15" y="6" width="3" height="15" rx="1" fill="#1E55FF" />
          <polyline points="3 14 9 8 15 12 21 6" stroke="#00A637" strokeWidth="2" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-[#1F2937]">$58K</h2>
    </div>

    {/* ARROW → */}
    <div className="w-10 h-10 rounded-full bg-[#F0F2FF] shadow flex items-center justify-center cursor-pointer">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B3F51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </div>

  </div>

  <p className="text-[13px] text-[#475467] font-semibold mt-1 ml-[4.5rem]">
</p>

  <p className="text-gray-600 text-sm">Predicted sales</p></div>


  {/* ================= FAST-MOVING ITEMS ================= */}
  <div className="bg-white rounded-2xl shadow-sm p-4 w-[270px] h-[130px] border border-gray-200">
  <div className="flex items-start justify-between">

    {/* ICON + NUMBER */}
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-[#E8FFEF] rounded-xl flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
  stroke="#FF6A00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 5h2l2 10h11l2-6H8" />
  <circle cx="9" cy="18" r="1.8" />
  <circle cx="17" cy="18" r="1.8" />
  <path d="M1.5 8h2.5" />
  <path d="M1.5 11h2" />
</svg>


      </div>
      <h2 className="text-3xl font-bold text-[#1F2937]">4</h2>
    </div>

    {/* ARROW → */}
    <div className="w-10 h-10 rounded-full bg-[#F3FFF5] shadow flex items-center justify-center cursor-pointer">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B3F51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </div>

  </div>
  <p className="text-[13px] text-[#475467] font-semibold mt-1 ml-[4.5rem]">
</p>
  <p className="text-gray-600 text-sm">Fastmoving items</p>
</div>


  {/* ================= SLOW MOVERS ================= */}
  <div className="bg-white rounded-2xl shadow-sm p-4 w-[270px] h-[130px] border border-gray-200">
  <div className="flex items-start justify-between">

    {/* ICON + NUMBER */}
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-[#FFE7DA] rounded-xl flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
 stroke="#FF1493" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 12l-3 3"/>
  <path d="M12 7v5"/>
  <path d="M4 12h2"/>
</svg>
</div>
      <h2 className="text-3xl font-bold text-[#1F2937]">3</h2>
    </div>

    {/* ARROW → */}
    <div className="w-10 h-10 rounded-full bg-[#FFF1E9] shadow flex items-center justify-center cursor-pointer">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B3F51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </div>

  </div>
  <p className="text-[13px] text-[#475467] font-semibold mt-1 ml-[4.5rem]">
</p>
  <p className="text-gray-600 text-sm">Slow movers</p>
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
   <h2 className="text-base font-medium text-gray-900 flex items-center gap-2 mb-4">
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
            <button
  className="px-4 py-2 rounded-md text-white font-medium text-[15px] hover:bg-[#3f5cd6] shadow"
  style={{ background: "#4C6EF5" }}
>
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