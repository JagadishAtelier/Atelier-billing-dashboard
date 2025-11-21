// src/stock/pages/StockListTailwind.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Plus, Search as SearchIcon, Edit, Trash2, Upload as UploadIcon, Download, Settings } from "lucide-react";
import * as XLSX from "xlsx";
import stockService from "../service/stockService"; // adjust path if needed
import { jsPDF } from "jspdf"; // optional, remove if you don't use jsPDF

const allColumns = [
  { title: "Product Name", key: "product_name" },
  { title: "Product Code", key: "product_code" },
  { title: "Quantity", key: "quantity" },
  { title: "Cost Price", key: "cost_price" },
  // { title: "Warehouse ID", key: "warehouse_id" },
  { title: "Return Qty", key: "return_quantity" },
  { title: "Inward Qty", key: "inward_quantity" },
  { title: "Billing Qty", key: "billing_quantity" },
];

export default function StockListTailwind() {
  const [items, setItems] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState(allColumns.map((c) => c.key));
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // server / pagination / search states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // bulk upload states
  const [bulkData, setBulkData] = useState([]);
  const [uploadedPreview, setUploadedPreview] = useState([]);

  // fetch stocks from backend
  const fetchStocks = useCallback(
    async (p = page, q = searchTerm) => {
      setLoading(true);
      try {
        const res = await stockService.getAll({
          page: p,
          limit: pageSize,
          search: q || undefined,
        });
        const payload = res?.data.data ?? res;
        const arr = payload?.data ?? [];
        setItems(Array.isArray(arr) ? arr : []);
        setTotal(payload?.total ?? 0);
        setPage(payload?.page ?? p);
      } catch (err) {
        console.error("Failed to fetch stocks", err);
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, searchTerm]
  );

  useEffect(() => {
    fetchStocks(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when search or page changes
  useEffect(() => {
    fetchStocks(page, searchTerm);
  }, [page, searchTerm, fetchStocks]);

  // client-side filter for currently loaded page
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const pname = (item?.product?.product_name ?? item.product_name ?? "").toString().toLowerCase();
    const pcode = (item?.product?.product_code ?? item.product_code ?? "").toString().toLowerCase();
    return pname.includes(q) || pcode.includes(q);
  });

  // helper to return value for a column (supports nested product.* or flat fields)
  const getCellValue = (row, key) => {
    if (key === "product_name") return row?.product?.product_name ?? row.product_name ?? "-";
    if (key === "product_code") return row?.product?.product_code ?? row.product_code ?? "-";
    return row?.[key] ?? (row?.[key] === 0 ? 0 : "-");
  };

  // file upload handler (reads excel to preview but doesn't save automatically)
  const handleFileInput = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setBulkData(jsonData);
        setUploadedPreview(jsonData);
        alert("Excel uploaded. Preview shown. Click Save to commit.");
      } catch (err) {
        console.error(err);
        alert("Invalid Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const saveBulkUpload = async () => {
    if (!bulkData || bulkData.length === 0) {
      alert("No uploaded data to save.");
      return;
    }
    try {
      await stockService.createBulk(bulkData);
      alert("Bulk upload saved successfully");
      setShowUploadModal(false);
      setBulkData([]);
      setUploadedPreview([]);
      fetchStocks(1, "");
    } catch (err) {
      console.error("Bulk save failed", err);
      alert("Failed to save bulk upload. See console.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await stockService.remove(id);
      fetchStocks(page, searchTerm);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed. See console.");
    }
  };

  const handleEdit = (id) => {
    // modify if you use react-router navigate
    window.location.href = `/stock/edit/${id}`;
  };

  const handleDownloadSample = () => {
    const a = document.createElement("a");
    a.href = "/bulk_stock_upload.xlsx"; // place sample in public folder
    a.download = "bulk_stock_upload.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // simple pagination UI handlers
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // optional: export to PDF of current list
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Stock List", 14, 16);
      const body = filteredItems.map((r) =>
        selectedColumns.map((col) => {
          const v = getCellValue(r, col);
          return typeof v === "number" ? v.toString() : (v ?? "-");
        })
      );
      doc.autoTable({
        startY: 22,
        head: [selectedColumns.map((c) => allColumns.find((a) => a.key === c).title)],
        body,
        styles: { fontSize: 8 },
      });
      doc.save("stock_list.pdf");
    } catch (e) {
      console.warn("PDF export requires jspdf + autotable", e);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-3 w-full md:w-1/3 bg-white">
          <SearchIcon size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by product, code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="outline-none text-sm w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <div
            className="bg-[#0E1680] text-white py-3 px-4 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
            onClick={() => setShowColumnModal(true)}
            title="Customize Columns"
          >
            <Settings size={16} /> Customize Columns
          </div>

          <div
            className="bg-[#0E1680] text-white py-3 px-4 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
            onClick={() => setShowUploadModal(true)}
            title="Bulk Upload Excel"
          >
            <UploadIcon size={16} /> Bulk Upload Excel
          </div>

          <div
            className="bg-white border border-gray-300 py-3 px-4 flex items-center gap-2 rounded-md cursor-pointer"
            onClick={() => fetchStocks(1, "")}
            title="Refresh"
          >
            <Download size={16} />
            Refresh
          </div>

          <div
            className="bg-white border border-gray-300 py-3 px-4 flex items-center gap-2 rounded-md cursor-pointer"
            onClick={exportPDF}
            title="Export PDF (visible columns)"
          >
            Export PDF
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-[#E5E7FB] text-[#475467]">
            <tr>
              {selectedColumns.map((col) => (
                <th key={col} className="py-3 px-4 text-left font-semibold border-b">
                  {allColumns.find((c) => c.key === col).title}
                </th>
              ))}
              {/* <th className="py-3 px-4 text-left font-semibold border-b">Actions</th> */}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={selectedColumns.length + 1} className="py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((row) => (
                <tr key={row.id} className="hover:bg-[#E1E6FF] border-b border-gray-300 text-[#475467]">
                  {selectedColumns.map((col) => (
                    <td key={col} className="py-3 px-4">
                      {(() => {
                        const val = getCellValue(row, col);
                        if (val === "-" || val === undefined || val === null) return "-";
                        if (col.includes("price")) return `₹${val}`;
                        return val;
                      })()}
                    </td>
                  ))}
                  {/* <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-[#0E1680] text-white rounded text-sm"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={selectedColumns.length + 1} className="py-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing page {page} of {totalPages} — {total} items
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={goPrev}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={goNext}
          >
            Next
          </button>
        </div>
      </div>

      {/* Customize Columns Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white p-6 rounded-md w-96 z-10">
            <h2 className="text-lg font-semibold mb-4">Customize Table Columns</h2>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {allColumns.map((col) => (
                <label key={col.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedColumns((prev) => [...prev, col.key]);
                      } else {
                        setSelectedColumns((prev) => prev.filter((c) => c !== col.key));
                      }
                    }}
                  />
                  {col.title}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowColumnModal(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-[#0E1680] text-white rounded" onClick={() => setShowColumnModal(false)}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white p-6 rounded-md w-11/12 md:w-3/4 lg:w-1/2 z-10">
            <h2 className="text-lg font-semibold mb-4">Bulk Upload Stock</h2>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-2 bg-[#0E1680] !text-white px-3 py-2 rounded"
                  onClick={handleDownloadSample}
                >
                  <Download size={16} /> Download Sample Excel
                </button>

                <label className="flex items-center gap-2 cursor-pointer bg-gray-200 px-3 py-2 rounded">
                  <UploadIcon size={16} />
                  <span>Select Excel</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileInput(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <p className="text-sm text-gray-600">Preview (first 20 rows):</p>
                <div className="max-h-48 overflow-auto border rounded mt-2">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        {uploadedPreview.length > 0 ? (
                          Object.keys(uploadedPreview[0]).slice(0, 10).map((k) => (
                            <th key={k} className="py-2 px-3 border-b text-left">{k}</th>
                          ))
                        ) : (
                          <th className="py-2 px-3">No file selected</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedPreview.slice(0, 20).map((row, rIdx) => (
                        <tr key={rIdx}>
                          {Object.values(row).slice(0, 10).map((val, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 border-b">{val?.toString?.() ?? "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => { setShowUploadModal(false); setBulkData([]); setUploadedPreview([]); }}
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-[#0E1680] !text-white rounded" onClick={saveBulkUpload}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
