import { ChevronDown, Plus, Search, MoreVertical } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const columns = [
  "PO-No",
  "Vendor Name",
  "Order Date",
  "Product Id",
  "Total Quantity",
  "Total Amount",
  "Tax Amount",
  "Status",
  "Action"
];

const orders = [
  {
    po_no: "PO-001",
    vendor_name: "A-One Traders",
    order_date: "2025-10-10",
    total_quantity: 120,
    total_amount: 54000,
    tax_amount: 2700,
    status: "pending",
    productId: "PROD-1"
  },
  {
    po_no: "PO-002",
    vendor_name: "Bright Supplies",
    order_date: "2025-10-12",
    total_quantity: 80,
    total_amount: 41000,
    tax_amount: 2050,
    status: "completed",
    productId: "PROD-2"
  },
  {
    po_no: "PO-003",
    vendor_name: "City Hardware",
    order_date: "2025-10-13",
    total_quantity: 60,
    total_amount: 30500,
    tax_amount: 1525,
    status: "approval",
    productId: "PROD-3"
  },
  {
    po_no: "PO-004",
    vendor_name: "Delta Enterprises",
    order_date: "2025-10-13",
    total_quantity: 200,
    total_amount: 105000,
    tax_amount: 5250,
    status: "cancelled",
    productId: "PROD-4"
  },
];

function OrderPage() {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenu, setActionMenu] = useState(null); // Track which row’s menu is open
  const navigate = useNavigate();

  // Filter orders by search term
  const filteredOrders = orders.filter(
    (order) =>
      order.po_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (order) => {
    navigate(`/order/edit/${order.po_no}`);
  };

  const handleDelete = (order) => {
    if (window.confirm(`Are you sure you want to delete order ${order.po_no}?`)) {
      console.log("Deleted:", order.po_no);
      // Here you can call your API to delete the order
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between relative">
        <div
          className="relative flex items-center gap-2 cursor-pointer"
          onClick={() => setDropDownOpen(!dropDownOpen)}
        >
          <p className="text-2xl font-semibold my-0">All Orders</p>
          <div className="mt-2">
            <ChevronDown />
          </div>
        </div>

        {/* Search Dropdown */}
        {dropDownOpen && (
          <div className="absolute bg-white shadow-lg w-60 top-12 left-0 rounded-lg border border-gray-200 p-3 z-10">
            <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>

            <div className="mt-2 max-h-48 overflow-y-auto">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, i) => (
                  <p
                    key={i}
                    className="p-2 hover:bg-[#E1E6FF] cursor-pointer rounded-md text-base"
                    onClick={() => {
                      setSearchTerm(order.vendor_name);
                      setDropDownOpen(false);
                    }}
                  >
                    {order.vendor_name}
                  </p>
                ))
              ) : (
                <p className="p-2 text-gray-500 text-sm">No results found</p>
              )}
            </div>
          </div>
        )}

        {/* Add Order Button */}
        <div
          className="bg-[#1C2244] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
          onClick={() => navigate("/order/add")}
        >
          <Plus size={16} />
          <button>Add Order</button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto mt-10">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg relative">
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr
                  key={index}
                  className="hover:bg-[#E1E6FF] border-b border-gray-300 relative"
                >
                  <td className="py-4 px-4 ">{order.po_no}</td>
                  <td className="py-4 px-4 ">{order.vendor_name}</td>
                  <td className="py-4 px-4 ">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 ">{order.productId}</td>
                  <td className="py-4 px-4 ">{order.total_quantity}</td>
                  <td className="py-4 px-4 ">₹{order.total_amount}</td>
                  <td className="py-4 px-4 ">₹{order.tax_amount}</td>
                  <td
                    className={`py-4 px-4 capitalize font-medium ${
                      order.status === "pending"
                        ? "text-yellow-600"
                        : order.status === "completed"
                        ? "text-green-600"
                        : order.status === "cancelled"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {order.status}
                  </td>

                  {/* Action Menu */}
                  <td className="py-4 px-4 text-center relative">
                    <div
                      className="inline-block cursor-pointer"
                      onClick={() =>
                        setActionMenu(actionMenu === index ? null : index)
                      }
                    >
                      <MoreVertical size={20} />
                    </div>

                    {/* Dropdown for Edit/Delete */}
                    {actionMenu === index && (
                      <div className="absolute right-4 top-12 bg-white border border-gray-300 rounded-md shadow-md w-28 z-20">
                        <p
                          className="p-2 hover:bg-[#E1E6FF] cursor-pointer text-gray-800 text-sm"
                          onClick={() => handleEdit(order)}
                        >
                          Edit
                        </p>
                        <p
                          className="p-2 hover:bg-red-100 cursor-pointer text-red-600 text-sm"
                          onClick={() => handleDelete(order)}
                        >
                          Delete
                        </p>
                      </div>
                    )}
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

export default OrderPage;
