import { Plus, Search, Sliders, Edit, Trash2, Eye } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import returnService from "./service/returnService";
import vendorService from "../components/layout/SideBarPages/services/vendorService";

const columns = [
  "S.No",
  "Return No",
  "Vendor Name",
  "Return Date",
  "Total Quantity",
  "Total Amount",
  "Tax Amount",
  "Status",
  "Reason",
  "Actions",
];

function ReturnPage() {
  const [returns, setReturns] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const filterRef = useRef();
  const navigate = useNavigate();

  // ✅ Fetch Returns (with flat query params)
  const fetchReturns = async () => {
    try {
      setLoading(true);
      const limit = 10;
      const offset = (page - 1) * limit;

      const params = {
        limit,
        offset,
        status: statusFilter || undefined,
        vendor_id: vendorFilter || undefined,
        search: searchTerm || undefined,
      };

      const response = await returnService.getAll(params);

      setReturns(response?.data || []);
      setTotalPages(Math.ceil((response?.total || 1) / limit));
    } catch (error) {
      console.error("Error fetching returns:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Vendors for dropdown
  const fetchVendors = async () => {
    try {
      const res = await vendorService.getAll();
      setVendors(res?.data || res || []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [searchTerm, vendorFilter, statusFilter, page]);

  useEffect(() => {
    fetchVendors();
  }, []);

  // ✅ Reset Filters
  const resetFilters = () => {
    setVendorFilter("");
    setStatusFilter("");
    setSearchTerm("");
    setPage(1);
    setFilterOpen(false);
  };

  // ✅ Close filter popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Delete Return
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this return?")) {
      try {
        await returnService.remove(id);
        fetchReturns();
      } catch (err) {
        console.error("Error deleting return:", err);
      }
    }
  };

  // ✅ Edit Return
  const handleEdit = (id) => navigate(`/return/edit/${id}`);

  // ✅ View Return
  const handleView = (id) => navigate(`/return/view/${id}`);

  // ✅ Add Return
  const handleAdd = () => navigate(`/return/add`);

  // ✅ Get Vendor Name
  const getVendorName = (vendorId) => {
    const v = vendors.find((x) => x.id === vendorId);
    return v ? v.name || v.vendor_name : "-";
  };

  return (
    <div>
      {/* Header Section */}
      
          {/* Search */}
          <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center justify-between gap-4 mb-6">

{/* LEFT — ICON + TITLE */}
<div className="flex items-center gap-3">

  {/* ICON BOX */}
  <div className="bg-white shadow-sm rounded-md p-2 border border-gray-200">
  <svg
  xmlns="http://www.w3.org/2000/svg"
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M3 7h18v13H3z" />
  <polyline points="3 7 12 3 21 7"></polyline>
  <polyline points="12 12 9 9 12 6" />
  <path d="M9 9h6" />
</svg>


  </div>

  {/* HEADING */}
  <h1 className="text-[28px] font-bold text-[#1F2937]">
    Returns
  </h1>
</div>

          {/* Filter Button */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
          >
            <Sliders size={16} />
            Filter
          </button>

          {/* Filter Popup */}
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
                  <option value="processed">Processed</option>
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

        {/* Add Button */}
        <div
  className="bg-[#506EE4] text-white py-2.5 px-6 text-[15px] font-medium flex items-center justify-center gap-2 rounded-md cursor-pointer"
  onClick={() => navigate("/order/add")}
>
  <Plus size={18} />
  Add Return
</div>

      </div>

      {/* Table Section */}
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
            ) : returns.length > 0 ? (
              returns.map((ret, index) => (
                <tr key={ret.id} className="hover:bg-[#E1E6FF] text-[#475467]">
                  <td className="py-4 px-4 border-b border-gray-300">
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {ret.return_no || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {getVendorName(ret.vendor_id)}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {ret.return_date
                      ? new Date(ret.return_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {ret.total_quantity || 0}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    ₹{ret.total_amount || 0}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    ₹{ret.total_tax || 0}
                  </td>
                  <td
                    className={`py-4 px-4 border-b border-gray-300 capitalize font-medium ${
                      ret.status === "pending"
                        ? "text-yellow-600"
                        : ret.status === "processed"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {ret.status}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {ret.reason || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300 flex gap-2">

  {/* VIEW BUTTON */}
  <button
    onClick={() => handleViewDetails(order.id)}
    className="p-2 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100"
  >
    <Eye size={18} className="text-gray-700" />
  </button>

  {/* EDIT BUTTON */}
  <button
    onClick={() => handleEdit(order.id)}
    className="p-2 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100"
  >
    <Edit size={18} className="text-gray-700" />
  </button>

  {/* DELETE BUTTON */}
  <button
    onClick={() => handleDelete(order.id)}
    className="p-2 rounded-md border border-red-400 bg-transparent hover:bg-red-50"
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
                  No returns found
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

export default ReturnPage;
