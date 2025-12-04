import { Plus, Search, Edit, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import vendorService from "./services/vendorService";
import { Building } from "lucide-react";

const columns = [
  "S.No",
  "Name",
  "Contact Person",
  "Email",
  "Phone",
  "Address",
  "GST Number",
  "Status",
  "Actions",
];

function VendorPage() {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // 🔹 Fetch vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page,
        limit: 10,
      };
      const response = await vendorService.getAll(params);
      setVendors(response.data || []);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [searchTerm, page]);

  // 🔹 Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await vendorService.remove(id);
        fetchVendors(); // Refresh list
      } catch (err) {
        console.error("Error deleting vendor:", err);
      }
    }
  };

  // 🔹 Handle Edit
  const handleEdit = (id) => {
    navigate(`/vendor/edit/${id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white  shadow-sm rounded-sm p-1.5 border border-gray-200"
          >
            <Building size={20} className="inline-block text-gray-600" />
          </div>
          <div >
            <h2 className="!text-[24px] pt-1.5  text-foreground" style={{fontWeight:700}}>Vendor</h2>
          </div>
          
        </div>
        
        {/* Add Vendor */}
        <div
        style={{ backgroundColor: "#506ee4", fontWeight: "500", fontSize: "16px", height: "40px", border: "none", color: "#fff", borderRadius: "4px", padding: "6px 16px", cursor: "pointer" }}
          className="bg-[#0E1680] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
          onClick={() => navigate("/vendor/add")}
        >
          <Plus size={16} />
          Add Vendor
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
            ) : vendors.length > 0 ? (
              vendors.map((row, index) => (
                <tr key={row.id} className="hover:bg-[#E1E6FF] text-[#475467]">
                  <td className="py-4 px-4 border-b border-gray-300">
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.name}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.contact_person || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.email || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.phone || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.address || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.gst_number || "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300 flex gap-2">
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      <Edit size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
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
                  No vendors found
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

export default VendorPage;
