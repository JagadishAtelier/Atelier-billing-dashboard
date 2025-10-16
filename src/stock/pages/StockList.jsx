import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Upload, Download, Settings } from "lucide-react";
import * as XLSX from "xlsx";

const allColumns = [
  { title: "Product Name", key: "product_name" },
  { title: "Product Code", key: "product_code" },
  { title: "Quantity", key: "quantity" },
  { title: "Unit", key: "unit" },
  { title: "Cost Price", key: "cost_price" },
  { title: "Selling Price", key: "selling_price" },
  { title: "Warehouse ID", key: "warehouse_id" },
  { title: "Supplier", key: "supplier" },
  { title: "Inward Qty", key: "inward_quantity" },
  { title: "Billing Qty", key: "billing_quantity" },
  { title: "Customer Billing Qty", key: "customer_billing_quantity" },
];

const dummyData = [
  {
    id: 1,
    product_name: "Paracetamol 500mg",
    product_code: "MED-001",
    quantity: 150,
    unit: "Box",
    cost_price: 45,
    selling_price: 60,
    warehouse_id: "WH-101",
    supplier: "MediLife Distributors",
    inward_quantity: 200,
    billing_quantity: 50,
    customer_billing_quantity: 20,
  },
  {
    id: 2,
    product_name: "Vitamin C Tablets",
    product_code: "SUP-045",
    quantity: 80,
    unit: "Bottle",
    cost_price: 120,
    selling_price: 150,
    warehouse_id: "WH-102",
    supplier: "HealthCorp Pharma",
    inward_quantity: 100,
    billing_quantity: 20,
    customer_billing_quantity: 10,
  },
];

function StockListTailwind() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  useEffect(() => {
    setItems(dummyData);
    setSelectedColumns(allColumns.map((col) => col.key));
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (id) => {
    alert(`Edit product with ID: ${id}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setBulkData(jsonData);
      alert("Excel uploaded successfully! Click save to confirm.");
    };
    reader.readAsArrayBuffer(file);
  };

  const saveBulkUpload = () => {
    if (bulkData.length > 0) {
      setItems([...items, ...bulkData]);
      setBulkData([]);
      setShowUploadModal(false);
      alert("Bulk upload successful!");
    } else {
      alert("No data to save!");
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-3 w-full md:w-1/4 bg-white">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by product, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <div
            className="bg-[#0E1680] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
            onClick={() => setShowColumnModal(true)}
          >
            <Settings size={16} /> Customize Columns
          </div>
          <div
            className="bg-[#0E1680] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={16} /> Bulk Upload Excel
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-[#E5E7FB] text-[#475467]">
            <tr>
              {selectedColumns.map((col) => (
                <th key={col} className="py-4 px-4 text-left font-semibold border-b">
                  {allColumns.find((c) => c.key === col).title}
                </th>
              ))}
              <th className="py-4 px-4 text-left font-semibold border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((row) => (
                <tr key={row.id} className="hover:bg-[#E1E6FF] border-b border-gray-300 text-[#475467]">
                  {selectedColumns.map((col) => (
                    <td key={col} className="py-4 px-4 ">
                      {row[col] !== undefined
                        ? col.includes("price")
                          ? `₹${row[col]}`
                          : row[col]
                        : "-"}
                    </td>
                  ))}
                  <td className="py-4 px-4  flex gap-2">
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-[#0E1680] text-white rounded text-sm"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={selectedColumns.length + 1} className="py-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customize Columns Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

          {/* Modal content */}
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
                        setSelectedColumns([...selectedColumns, col.key]);
                      } else {
                        setSelectedColumns(selectedColumns.filter((c) => c !== col.key));
                      }
                    }}
                  />
                  {col.title}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowColumnModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#0E1680] text-white rounded"
                onClick={() => setShowColumnModal(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

          {/* Modal content */}
          <div className="relative bg-white p-6 rounded-md w-96 flex flex-col gap-4 z-10">
            <h2 className="text-lg font-semibold">Bulk Upload Stock</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-200 px-4 py-2 rounded">
                <Download size={16} /> Download Sample Excel
              </label>
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#0E1680] text-white rounded"
                onClick={saveBulkUpload}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockListTailwind;
