// BillingReport.jsx
import React, { useEffect, useState } from "react";
import reportService from "./service/reportService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import BASE_API from "../api/api.js";


export default function BillingReport() {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
    start_date: "",
    end_date: "",
    sort_by: "billing_date",
    sort_order: "DESC",
  });

  // Fetch Billings with filters
  const fetchBillings = async (pageNumber = 1, download_type) => {
    setLoading(true);
    try {
      const res = await reportService.getBillingReport({
        ...filters,
        page: pageNumber,
        limit: 10,
        download_type,
      });

      if (download_type) {
        // handle file download
        const url = `${BASE_API}/billing?search=${filters.search}&status=${filters.status}&type=${filters.type}&start_date=${filters.start_date}&end_date=${filters.end_date}&sort_by=${filters.sort_by}&sort_order=${filters.sort_order}&page=${pageNumber}&limit=10&download_type=${download_type}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // if needed
          },
        });
        const blob = await response.blob();
        const fileName = `Billing_Report_${Date.now()}.${download_type === "pdf" ? "pdf" : "xlsx"}`;
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      setBillingData(res.data);
      setTotalPages(res.meta.total_pages);
      setPage(res.meta.current_page);
    } catch (err) {
      console.error("Error fetching billings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillings(); // initial fetch
  }, []);

  useEffect(() => {
    fetchBillings(); // refetch when filters change
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Billing Report", 14, 10);

    const tableData = billingData.map((b, idx) => [
      idx + 1,
      b.billing_no,
      b.customer_name,
      new Date(b.billing_date).toLocaleDateString(),
      b.total_quantity,
      b.total_amount,
      b.status,
      b.type,
    ]);

    autoTable(doc, {
      head: [["S.No", "Billing No", "Customer", "Date", "Quantity", "Amount", "Status", "Type"]],
      body: tableData,
    });

    doc.save("billing_report.pdf");
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">Billing Report</h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by customer/billing no"
          className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="overdue">Overdue</option>
        </select>

        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Types</option>
          <option value="Customer Billing">Mobile</option>
          <option value="Casier Billing">Casier</option>
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
        {/* <div className="ml-auto flex gap-2">
          <button
            onClick={() => fetchBillings(page, "excel")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Export Excel
          </button>
          <button
            onClick={() => fetchBillings(page, "pdf")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Export PDF
          </button>
        </div> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["S.No", "Billing No", "Customer", "Date", "Quantity", "Amount", "Status", "Type"].map((col, idx) => (
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
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : billingData.length ? (
              billingData.map((bill, idx) => (
                <tr key={bill.id} className="hover:bg-blue-50 transition duration-150">
                  <td className="px-4 py-3">{(page - 1) * 10 + idx + 1}</td>
                  <td className="px-4 py-3">{bill.billing_no}</td>
                  <td className="px-4 py-3">{bill.customer_name}</td>
                  <td className="px-4 py-3">{new Date(bill.billing_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{bill.total_quantity}</td>
                  <td className="px-4 py-3">₹{bill.total_amount}</td>
                  <td className={`px-4 py-3 font-medium ${bill.status === "paid" ? "text-green-600" : bill.status === "pending" ? "text-orange-600" : bill.status === "failed" ? "text-red-600" : "text-gray-600"}`}>
                    {bill.status}
                  </td>
                  <td className="px-4 py-3">{bill.type === "Customer Billing" ? "Mobile" : bill.type === "Casier Billing" ? "Casier" : bill.type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No billings found
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
          onClick={() => fetchBillings(page - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Prev
        </button>
        <span className="text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => fetchBillings(page + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
