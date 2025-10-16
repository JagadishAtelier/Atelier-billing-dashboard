// ReportPageTailwindStyled.jsx
import React, { useState } from "react";
import { Plus, Eye } from "lucide-react";

const billingFilters = ["All", "Paid", "Pending", "Failed"];

const userData = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  sno: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `98765432${i}${i}`,
  role: i % 2 === 0 ? "Admin" : "Customer",
  is_active: i % 3 !== 0,
}));

const billingData = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  sno: i + 1,
  po_no: `PO-00${i + 1}`,
  vendor_name: `Vendor ${i + 1}`,
  order_date: new Date().toLocaleDateString(),
  total_quantity: Math.floor(Math.random() * 100),
  total_amount: Math.floor(Math.random() * 10000),
  tax_amount: Math.floor(Math.random() * 1000),
  status: ["Paid", "Pending", "Failed"][i % 3],
}));

export default function ReportPageTailwindStyled() {
  const [activeTab, setActiveTab] = useState("user");
  const [billingFilter, setBillingFilter] = useState("All");

  const getStatusColor = (status) => {
    if (status === "Paid") return "text-green-600";
    if (status === "Pending") return "text-yellow-600";
    if (status === "Failed") return "text-red-600";
    return "text-gray-600";
  };

  const handleView = (id) => alert("View " + id);

  const filteredBillingData =
    billingFilter === "All"
      ? billingData
      : billingData.filter((b) => b.status === billingFilter);

  return (
    <div className="min-h-screen">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["user", "billing"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-[#1C2244] text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* User Table */}
      {activeTab === "user" && (
        <div>
          <h3 className="text-xl font-semibold mb-2">User Report</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-[#1C2244] text-white">
                <tr>
                  {["S.No", "Name", "Email", "Phone", "Role", "Status"].map((col, idx) => (
                    <th key={idx} className="py-4 px-4 text-left font-semibold border-b">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userData.map((user) => (
                  <tr key={user.id} className="hover:bg-[#E1E6FF] border-b border-gray-300">
                    <td className="py-4 px-4">{user.sno}</td>
                    <td className="py-4 px-4">{user.name}</td>
                    <td className="py-4 px-4">{user.email}</td>
                    <td className="py-4 px-4">{user.phone}</td>
                    <td
                      className={`py-4 px-4 font-medium ${
                        user.role === "Admin" ? "text-blue-600" : "text-green-600"
                      }`}
                    >
                      {user.role}
                    </td>
                    <td
                      className={`py-4 px-4 font-medium ${
                        user.is_active ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billing Table */}
      {activeTab === "billing" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Billing Report</h3>
            <div className="flex gap-2 items-center">
              <select
                value={billingFilter}
                onChange={(e) => setBillingFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 bg-white"
              >
                {billingFilters.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <button className="bg-[#1C2244] text-white py-2 px-4 flex items-center gap-1 rounded">
                <Plus size={16} /> Add Billing
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-[#1C2244] text-white">
                <tr>
                  {[
                    "S.No",
                    "PO-No",
                    "Vendor Name",
                    "Order Date",
                    "Total Quantity",
                    "Total Amount",
                    "Tax Amount",
                    "Status",
                    "Details",
                  ].map((col, idx) => (
                    <th key={idx} className="py-4 px-4 text-left font-semibold border-b">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBillingData.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#E1E6FF] border-b border-gray-300">
                    <td className="py-4 px-4">{bill.sno}</td>
                    <td className="py-4 px-4">{bill.po_no}</td>
                    <td className="py-4 px-4">{bill.vendor_name}</td>
                    <td className="py-4 px-4">{bill.order_date}</td>
                    <td className="py-4 px-4">{bill.total_quantity}</td>
                    <td className="py-4 px-4">₹{bill.total_amount}</td>
                    <td className="py-4 px-4">₹{bill.tax_amount}</td>
                    <td className={`py-4 px-4 font-medium capitalize ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleView(bill.id)}
                        className="bg-[#1C2244] text-white py-1 px-3 text-xs rounded flex items-center justify-center"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
