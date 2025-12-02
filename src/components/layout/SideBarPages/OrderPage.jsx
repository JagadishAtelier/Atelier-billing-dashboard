import { Plus, Search, Sliders, Edit, Trash2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "./services/orderService";
import vendorService from "./services/vendorService";

const columns = [
  "S.No",
  "PO-No",
  "Vendor Name",
  "Order Date",
  "Total Quantity",
  "Total Penning Quantity",
  "Total Amount",
  "Tax Amount",
  "Status",
  "Details",
  "Actions",
];

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const filterRef = useRef();

  // 🔹 Fetch orders with filters
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page,
        limit: 10,
      };
      if (vendorFilter) params.vendor_id = vendorFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await orderService.getAll(params);
      setOrders(response.data || []);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch vendors for filter dropdown
  const fetchVendors = async () => {
    try {
      const res = await vendorService.getAll();
      setVendors(res?.data || res || []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, vendorFilter, statusFilter, page]);

  useEffect(() => {
    fetchVendors();
  }, []);

  // 🔹 Reset filters
  const resetFilters = () => {
    setVendorFilter("");
    setStatusFilter("");
    setSearchTerm("");
    setPage(1);
    setFilterOpen(false);
  };

  // 🔹 Close filter popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await orderService.remove(id);
        fetchOrders();
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
        <div className="flex items-center gap-3 relative">
        <h1 className="text-[30px] font-bold text-[#1F2937]">
  Purchases / Orders
</h1>



          {/* Filter button */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
          >
            <Sliders size={16} />
            Filter
          </button>

          {/* Filter popup */}
          {filterOpen && (
            <div
              ref={filterRef}
              className="absolute top-10 left-0 bg-white border border-gray-300 rounded-md p-4 shadow-lg z-50 w-64"
            >
              {/* Vendor Filter */}
              <div className="mb-2">
                <label className="text-sm font-medium">Vendor:</label>
                <select
                  value={vendorFilter}
                  onChange={(e) => {
                    setVendorFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm ml-2 w-full"
                >
                  <option value="">All Vendors</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vendor_name || v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="mb-2">
                <label className="text-sm font-medium">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm ml-2 w-full"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="px-3 py-1 bg-gray-200 rounded text-sm"
                >
                  Close
                </button>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Order */}
<div
  className="bg-[#506EE4] text-white py-2.5 px-6 text-[15px] font-medium flex items-center justify-center gap-2 rounded-md cursor-pointer"
  onClick={() => navigate("/order/add")}
>
  <Plus size={18} />
  Add Order
</div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-[#E5E7FB] text-[#475467]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="py-4 px-4 text-left text-[#475467] font-semibold border-b"
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
                <tr key={order.id} className="hover:bg-[#E1E6FF] text-[#475467]">
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
                    {order.total_penning_quantity || 0}
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
                      className="bg-[#1C2244] !text-white py-1 px-3 text-xs font-semibold rounded-sm hover:opacity-90"
                    >
                      View
                    </button>
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300 flex gap-2">

{/* EDIT BUTTON — light gray background */}
<button
  onClick={() => handleEdit(order.id)}
  className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-[#F5F6FA] hover:bg-gray-200 transition"
>
  <Edit size={18} className="text-gray-700" />
</button>

{/* DELETE BUTTON — white background + RED border */}
<button
  onClick={() => handleDelete(order.id)}
  className="flex items-center justify-center w-10 h-10 rounded-lg border border-red-400 bg-white hover:bg-red-50 transition"
>
  <Trash2 size={18} className="text-red-500" />
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
