import React, { useState } from "react";
import UserReport from "./UserReport";
import BillingReport from "./BillingReport";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("user report");

  return (
    <div className="min-h-screen">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["user report", "billing report"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? "bg-[#0E1680] !text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "user report" && <UserReport />}
      {activeTab === "billing report" && <BillingReport />}
    </div>
  );
}
