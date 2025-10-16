import { Plus, Search, Edit, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "./services/orderService";

const columns = [
  "S.No",
  "PO-No",
  "Vendor Name",
  "Order Date",
  "Total Quantity",
  "Total Amount",
  "Tax Amount",
  "Status",
  "Details",
  "Actions",
];

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // 🔹 Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page,
        limit: 10,
      };

      const response = await orderService.getAll(params);
      setOrders(response.data || []);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, page]);

  // 🔹 Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await orderService.remove(id);
        fetchOrders(); // Refresh list
      } catch (err) {
        console.error("Error deleting order:", err);
      }
    }
  };

  // 🔹 Handle Edit
  const handleEdit = (id) => {
    navigate(`/order/edit/${id}`);
  };

  // 🔹 Handle View Details
  const handleViewDetails = (id) => {
    navigate(`/order/view/${id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by PO, vendor, or status..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="outline-none text-sm"
          />
        </div>

        {/* Add Order */}
        <div
          className="bg-[#1C2244] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
          onClick={() => navigate("/order/add")}
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order, index) => (
                <tr key={order.id} className="hover:bg-[#E1E6FF]">
                  <td className="py-4 px-4 border-b border-gray-300">
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {order.po_no || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {order.vendor_name || order.vendor?.name || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {order.total_quantity || 0}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    ₹{order.total_amount || 0}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    ₹{order.tax_amount || 0}
                  </td>
                  <td
                    className={`py-4 px-4 border-b border-gray-300 capitalize font-medium ${
                      order.status === "pending"
                        ? "text-yellow-600"
                        : order.status === "completed"
                        ? "text-green-600"
                        : order.status === "cancelled"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {order.status || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      className="bg-[#1C2244] text-white py-1 px-3 text-xs font-semibold rounded-sm hover:opacity-90"
                    >
                      View
                    </button>
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300 flex gap-2">
                    <button
                      onClick={() => handleEdit(order.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      <Edit size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      <Trash2 size={16} className="text-white" />
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

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default OrderPage;
