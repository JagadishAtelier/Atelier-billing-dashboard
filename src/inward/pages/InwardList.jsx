// src/inward/pages/InwardList.jsx
import React, { useEffect, useState, useRef } from "react";
import { Plus, Search, Sliders, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import inwardService from "../service/inwardService"; // adjust path if needed
import vendorService from "../../components/layout/SideBarPages/services/vendorService"; // adjust path if needed
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const columns = [
  "S.No",
  "Inward No",
  "PO-No",
  "Vendor",
  "Received Date",
  "Total Qty",
  "Total Amount",
  "Status",
  "Details",
  "Actions",
];

function InwardList() {
  const [inwards, setInwards] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItems, setModalItems] = useState([]);
  const [modalInward, setModalInward] = useState(null);
  const [modalSearch, setModalSearch] = useState("");
  const filterRef = useRef();
  const navigate = useNavigate();

  // -------------------------
  // Fetch list of inwards
  // -------------------------
  const fetchInwards = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        page,
        limit,
      };
      if (vendorFilter) params.vendor_id = vendorFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await inwardService.getAll(params);
      // support both wrapped (res.data.{total,page,limit,data}) or direct {total,page,limit,data}
      const total = res?.data?.total ?? res?.total ?? 0;
      const currentPage = res?.data?.page ?? res?.page ?? page;
      const pageLimit = res?.data?.limit ?? res?.limit ?? limit;
      const data = res?.data?.data ?? res?.data ?? [];

      setInwards(Array.isArray(data) ? data : []);
      setTotalPages(Math.max(1, Math.ceil(total / (pageLimit || limit))));
      setPage(currentPage || page);
    } catch (err) {
      console.error("Failed to load inwards:", err);
      setInwards([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Fetch vendors for mapping
  // -------------------------
  const fetchVendors = async () => {
    try {
      const res = await vendorService.getAll();
      const v = res?.data ?? res ?? [];
      setVendors(Array.isArray(v) ? v : []);
    } catch (err) {
      console.error("Failed to load vendors:", err);
      setVendors([]);
    }
  };

  useEffect(() => {
    fetchInwards();
  }, [searchTerm, vendorFilter, statusFilter, page]);

  useEffect(() => {
    fetchVendors();
  }, []);

  // -------------------------
  // Filter UI helpers
  // -------------------------
  const resetFilters = () => {
    setVendorFilter("");
    setStatusFilter("");
    setSearchTerm("");
    setPage(1);
    setFilterOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------------------------
  // Actions: delete, edit, view
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inward entry?")) return;
    try {
      await inwardService.remove(id);
      fetchInwards();
    } catch (err) {
      console.error("Failed to delete inward:", err);
      alert("Failed to delete. See console for details.");
    }
  };

  const handleEdit = (id) => navigate(`/inward/edit/${id}`);
  const handleAdd = () => navigate("/inward/add");

  // -------------------------
  // View modal: fetch a single inward and show items
  // -------------------------
  const handleView = async (id) => {
    try {
      setLoading(true);
      const res = await inwardService.getById(id);
      const data = res?.data ?? res;
      setModalInward(data || null);
      // items shape is data.items
      setModalItems(Array.isArray(data?.items) ? data.items : []);
      setModalSearch("");
      setModalVisible(true);
    } catch (err) {
      console.error("Failed to fetch inward details:", err);
      alert("Failed to load inward details");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalItems([]);
    setModalInward(null);
    setModalSearch("");
  };

  const filteredModalItems = modalItems.filter((item) => {
    const pname = item?.product?.product_name?.toString()?.toLowerCase() ?? "";
    const pcode = item?.product?.product_code?.toString()?.toLowerCase() ?? "";
    const batch = (item?.batch_number ?? "").toString().toLowerCase();
    const q = modalSearch.toLowerCase();
    return pname.includes(q) || pcode.includes(q) || batch.includes(q);
  });

  // -------------------------
  // Helper: vendor name by id
  // -------------------------
  const getVendorName = (vendor_id) => {
    if (!vendor_id) return "-";
    const v = vendors.find((x) => x.id === vendor_id);
    return v?.name || v?.vendor_name || vendor_id;
  };

  // -------------------------
  // Export full inward list to PDF
  // -------------------------
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Inward List", 14, 16);

    const tableBody = inwards.map((inv) => [
      inv.inward_no ?? "-",
      inv.order_id ?? (inv.order?.po_no ?? "-"),
      getVendorName(inv.vendor_id),
      inv.received_date ? new Date(inv.received_date).toLocaleDateString() : "-",
      inv.total_quantity ?? 0,
      `₹${inv.total_amount ?? "0.00"}`,
      inv.status ?? "-",
    ]);

    doc.autoTable({
      startY: 22,
      head: [
        [
          "Inward No",
          "PO-No",
          "Vendor",
          "Received Date",
          "Total Qty",
          "Total Amount",
          "Status",
        ],
      ],
      body: tableBody,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [28, 34, 68], textColor: 255 },
    });

    doc.save("inwards.pdf");
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
              placeholder="Search by Inward No, PO-No, vendor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="outline-none text-sm"
            />
          </div>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
          >
            <Sliders size={16} />
            Filter
          </button>

          {filterOpen && (
            <div
              ref={filterRef}
              className="absolute top-10 left-0 bg-white border border-gray-300 rounded-md p-4 shadow-lg z-50 w-72"
            >
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
                      {v.name || v.vendor_name}
                    </option>
                  ))}
                </select>
              </div>

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

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            className="bg-white border border-gray-300 py-2 px-3 rounded text-sm"
            onClick={exportPDF}
          >
            Export PDF
          </button>

          <div
            className="bg-[#1C2244] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
            onClick={handleAdd}
          >
            <Plus size={16} />
            Add Inward
          </div>
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
            ) : inwards.length > 0 ? (
              inwards.map((inv, index) => (
                <tr key={inv.id} className="hover:bg-[#E1E6FF]">
                  <td className="py-4 px-4 border-b border-gray-300">
                    {(page - 1) * limit + index + 1}
                  </td>

                  <td className="py-4 px-4 border-b border-gray-300">
                    {inv.inward_no || "-"}
                  </td>

                  <td className="py-4 px-4 border-b border-gray-300">
                    {inv.po_no || (inv.order?.po_no ?? "-")}
                  </td>

                  <td className="py-4 px-4 border-b border-gray-300">
                    {getVendorName(inv.vendor_id)}
                  </td>

                  <td className="py-4 px-4 border-b border-gray-300">
                    {inv.received_date
                      ? new Date(inv.received_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="py-4 px-4 border-b border-gray-300">
                    {inv.total_quantity ?? 0}
                  </td>

                  <td className="py-4 px-4 border-b border-gray-300">
                    ₹{inv.total_amount ?? "0.00"}
                  </td>

                  <td
                    className={`py-4 px-4 border-b border-gray-300 capitalize font-medium ${
                      inv.status === "pending"
                        ? "text-yellow-600"
                        : inv.status === "completed"
                        ? "text-green-600"
                        : inv.status === "cancelled"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {inv.status ?? "-"}
                  </td>

                  <td className="py-4 px-4 border-b border-gray-300">
                    <button
                      onClick={() => handleView(inv.id)}
                      className="bg-[#1C2244] !text-white py-1 px-3 text-xs font-semibold rounded-sm hover:opacity-90 inline-flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>

                  <td className="py-4 px-4 border-b border-gray-300 flex gap-2">
                    <button
                      onClick={() => handleEdit(inv.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      <Edit size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
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
                  No inward entries found
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
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* ---------- Modal (simple custom modal) ---------- */}
      {modalVisible && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-auto"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-5xl rounded shadow-lg mt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">
                  Inward Items - {modalInward?.inward_no || ""}
                </h3>
                <p className="text-sm text-gray-600">
                  Supplier: {modalInward?.supplier_name || getVendorName(modalInward?.vendor_id)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search product/code/batch..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="outline-none border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={closeModal}
                  className="bg-gray-200 px-3 py-2 rounded text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-[#1C2244] text-white">
                    <tr>
                      {[
                        "S.No",
                        "Product",
                        "Code",
                        "Quantity",
                        "Unit Price",
                        "Total",
                        "Batch",
                        "Expiry Date",
                      ].map((col, idx) => (
                        <th key={idx} className="py-3 px-3 text-left text-white font-semibold border-b">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalItems.length > 0 ? (
                      filteredModalItems.map((row, idx) => (
                        <tr key={row.id ?? idx} className="hover:bg-[#E1E6FF] border-b">
                          <td className="py-3 px-3">{idx + 1}</td>
                          <td className="py-3 px-3">{row.items?.product_name ?? "-"}</td>
                          <td className="py-3 px-3">{row.product?.product_code ?? "-"}</td>
                          <td className="py-3 px-3">{row.quantity ?? 0}</td>
                          <td className="py-3 px-3">₹{row.unit_price ?? "0.00"}</td>
                          <td className="py-3 px-3">₹{row.total_price ?? "0.00"}</td>
                          <td className="py-3 px-3">{row.batch_number ?? "-"}</td>
                          <td className="py-3 px-3">
                            {row.expiry_date ? new Date(row.expiry_date).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <button
                onClick={() => {
                  // Export selected inward items to PDF
                  const doc = new jsPDF();
                  doc.text(`Inward Items - ${modalInward?.inward_no || ""}`, 14, 16);

                  const tableData = (filteredModalItems || []).map((it) => [
                    it.product?.product_name ?? "-",
                    it.product?.product_code ?? "-",
                    it.quantity ?? 0,
                    it.unit_price ?? 0,
                    it.total_price ?? 0,
                    it.batch_number ?? "-",
                    it.expiry_date ? new Date(it.expiry_date).toLocaleDateString() : "-",
                  ]);

                  doc.autoTable({
                    startY: 22,
                    head: [["Product", "Code", "Qty", "Unit Price", "Total", "Batch", "Expiry"]],
                    body: tableData,
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: [28, 34, 68], textColor: 255 },
                  });

                  doc.save(`${modalInward?.inward_no ?? "inward"}_items.pdf`);
                }}
                className="bg-[#1C2244] text-white px-4 py-2 rounded"
              >
                Export Items PDF
              </button>

              <button onClick={closeModal} className="bg-gray-200 px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InwardList;
