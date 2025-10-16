import { ChevronDown, Plus, Search, Sliders, Edit, Trash2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import userService from "./services/userService";

const columns = ["S.No", "Name", "Email", "Phone", "Role", "Status", "Actions"];

function UserPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const filterRef = useRef();
  const navigate = useNavigate();

  // Fetch users with filters
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {
        search: searchTerm,
        page,
        limit: 10,
      };
      if (roleFilter) params.role_id = roleFilter;
      if (statusFilter) params.is_active = statusFilter === "Active";

      const response = await userService.getAll(params);
      setUsers(response.data);
      setTotalPages(response.meta.total_pages || 1);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  // Fetch roles for filter dropdown
  const fetchRoles = async () => {
    try {
      const res = await userService.getAll({});
      const uniqueRoles = [...new Map(res.data.map(u => [u.role?.id, u.role?.role_name])).entries()];
      setRoles(uniqueRoles);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  useEffect(() => { fetchUsers(); }, [searchTerm, roleFilter, statusFilter, page]);
  useEffect(() => { fetchRoles(); }, []);

  // Reset filters
  const resetFilters = () => {
    setRoleFilter("");
    setStatusFilter("");
    setSearchTerm("");
    setPage(1);
    setFilterOpen(false);
  };

  // Close filter popup on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle edit
  const handleEdit = (id) => {
    navigate(`/user/edit/${id}`);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.remove(id);
        fetchUsers(); // refresh list
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Search + Filter */}
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="outline-none text-sm"
            />
          </div>

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
              {/* Role Filter */}
              <div className="mb-2">
                <label className="text-sm font-medium">Role:</label>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm ml-2 w-full"
                >
                  <option value="">All Roles</option>
                  {roles.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="mb-2">
                <label className="text-sm font-medium">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm ml-2 w-full"
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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

        {/* Add Users */}
        <div
          className="bg-[#0E1680] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
          onClick={() => navigate("/user/add")}
        >
          <Plus size={16} />
          Add Users
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-[#E5E7FB] text-[#475467]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-4 px-4 text-left text-[#475467] font-semibold border-b">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-4 text-center">Loading...</td>
              </tr>
            ) : users.length > 0 ? (
              users.map((row, index) => (
                <tr key={row.id} className="hover:bg-[#E1E6FF] text-[#475467]">
                  <td className="py-4 px-4 border-b border-gray-300">{(page - 1) * 10 + index + 1}</td>
                  <td className="py-4 px-4 border-b border-gray-300">{row.username}</td>
                  <td className="py-4 px-4 border-b border-gray-300">{row.email}</td>
                  <td className="py-4 px-4 border-b border-gray-300">{row.phone}</td>
                  <td className="py-4 px-4 border-b border-gray-300">{row.role?.role_name || "-"}</td>
                  <td className="py-4 px-4 border-b border-gray-300">{row.is_active ? "Active" : "Inactive"}</td>
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
                <td colSpan={columns.length} className="py-4 text-center text-gray-500">No data available</td>
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
        <span>Page {page} of {totalPages}</span>
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

export default UserPage;
