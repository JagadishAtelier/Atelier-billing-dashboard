import React, { useEffect, useState } from "react";
import reportService from "./service/reportService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import BASE_API from "../api/api.js";

export default function UserReport() {
  const [userData, setUserData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    role_id: "",
    is_active: "",
    start_date: "",
    end_date: "",
    sort_by: "createdAt",
    sort_order: "DESC",
  });

  // Fetch roles from backend
  const fetchRoles = async () => {
    try {
      const res = await reportService.getRoles(); // <-- implement API call in reportService
      setRoles(res || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  // Fetch Users with filters
  const fetchUsers = async (pageNumber = 1, download_type) => {
  setLoading(true);
  try {
    const res = await reportService.getUserReport({
      ...filters,
      page: pageNumber,
      limit: 10,
      download_type,
    });

    if (download_type) {
      // Fetch file as blob for download
      const url = `${BASE_API}/report/users?search=${filters.search}&role_id=${filters.role_id}&is_active=${filters.is_active}&start_date=${filters.start_date}&end_date=${filters.end_date}&sort_by=${filters.sort_by}&sort_order=${filters.sort_order}&page=${pageNumber}&limit=10&download_type=${download_type}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // if needed
        },
      });

      const blob = await response.blob();
      const fileName = `User_Report_${Date.now()}.${download_type === "pdf" ? "pdf" : "xlsx"}`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return; // skip table update
    }

    // Normal table update
    setUserData(res.data);
    setTotalPages(res.meta.total_pages);
    setPage(res.meta.current_page);
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchRoles(); // load roles once
    fetchUsers(); // load initial users
  }, []);

  useEffect(() => {
    fetchUsers(); 
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">User Report</h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by name/email/phone"
          className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="is_active"
          value={filters.is_active}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <select
          name="role_id"
          value={filters.role_id}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.role_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2"
        />

        {/* Export Buttons */}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => fetchUsers(page, "excel")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Export Excel
          </button>
          <button
            onClick={() => fetchUsers(page, "pdf")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["S.No", "Name", "Email", "Phone", "Role", "Status"].map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : userData.length ? (
              userData.map((user, idx) => (
                <tr key={user.id} className="hover:bg-blue-50 transition duration-150">
                  <td className="px-4 py-3">{(page - 1) * 10 + idx + 1}</td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone}</td>
                  <td className={`px-4 py-3 font-medium ${user.role?.role_name === "Admin" ? "text-blue-600" : "text-green-600"}`}>
                    {user.role?.role_name || "-"}
                  </td>
                  <td className={`px-4 py-3 font-medium ${user.is_active ? "text-green-600" : "text-red-600"}`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => fetchUsers(page - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Prev
        </button>
        <span className="text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => fetchUsers(page + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
