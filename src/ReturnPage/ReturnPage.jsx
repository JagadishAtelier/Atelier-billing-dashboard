import { Plus, Search, Edit, Trash2 } from "lucide-react";
import React, { useState } from "react";

const columns = [
  "S.No",
  "Vendor Name",
  "Order Date",
  "Total Quantity",
  "Total Amount",
  "Tax Amount",
  "Status",
  "Details",
  "Actions",
];

const dummyData = [
  {
    id: 1,
    vendor_name: "A-One Traders",
    order_date: "2025-10-12",
    total_quantity: 50,
    total_amount: 1250,
    tax_amount: 150,
    status: "Completed",
    details: "Order delivered",
  },
  {
    id: 2,
    vendor_name: "MediCare Supplies",
    order_date: "2025-10-10",
    total_quantity: 100,
    total_amount: 3000,
    tax_amount: 360,
    status: "Pending",
    details: "Awaiting delivery",
  },
  {
    id: 3,
    vendor_name: "HealthPlus Pharma",
    order_date: "2025-10-08",
    total_quantity: 25,
    total_amount: 750,
    tax_amount: 90,
    status: "Cancelled",
    details: "Order cancelled by vendor",
  },
];

function ReturnPage() {
  const [items, setItems] = useState(dummyData);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (id) => {
    alert(`Edit order with ID: ${id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-3 w-1/4 bg-white">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by vendor, status, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm"
          />
        </div>

        {/* Add Order */}
        <div
          className="bg-[#1C2244] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
          onClick={() => alert("Add Order clicked")}
        >
          <Plus size={16} />
          Add Order
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-[#1C2244] text-white">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="py-4 px-4 text-left text-white font-semibold border-b"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((row, index) => (
                <tr key={row.id} className="hover:bg-[#E1E6FF]">
                  <td className="py-4 px-4 border-b border-gray-300">
                    {index + 1}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.vendor_name}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {new Date(row.order_date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.total_quantity}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    ₹{row.total_amount}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    ₹{row.tax_amount}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.status}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.details}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300 flex gap-2">
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-4 text-center text-gray-500"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReturnPage;
