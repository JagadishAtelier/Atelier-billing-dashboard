import { Plus, Search, Edit, Trash2 } from "lucide-react";
import React, { useState } from "react";

const columns = [
  "S.No",
  "Product",
  "Code",
  "Quantity",
  "Unit Price",
  "Total",
  "Batch",
  "Expiry Date",
  "Actions",
];

const dummyData = [
  {
    id: 1,
    product: {
      product_name: "Paracetamol 500mg",
      product_code: "PRC500",
    },
    quantity: 50,
    unit_price: 25,
    total_price: 1250,
    batch_number: "BATCH001",
    expiry_date: "2026-05-12",
  },
  {
    id: 2,
    product: {
      product_name: "Amoxicillin 250mg",
      product_code: "AMX250",
    },
    quantity: 100,
    unit_price: 15,
    total_price: 1500,
    batch_number: "BATCH002",
    expiry_date: "2027-02-28",
  },
  {
    id: 3,
    product: {
      product_name: "Cough Syrup 100ml",
      product_code: "CFS100",
    },
    quantity: 25,
    unit_price: 60,
    total_price: 1500,
    batch_number: "BATCH003",
    expiry_date: "2025-12-30",
  },
];

function ViewInwardData() {
     const [items, setItems] = useState(dummyData);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.product.product_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.product.product_code
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (id) => {
    alert(`Edit product with ID: ${id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-3 w-1/4 bg-white">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by product, code, or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm"
          />
        </div>

        {/* Add Product */}
        <div
          className="bg-[#1C2244] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
          onClick={() => alert("Add Product clicked")}
        >
          <Plus size={16} />
          Add Product
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
            {filteredItems.length > 0 ? (
              filteredItems.map((row, index) => (
                <tr key={row.id} className="hover:bg-[#E1E6FF]">
                  <td className="py-4 px-4 border-b border-gray-300">
                    {index + 1}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.product.product_name}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.product.product_code}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.quantity}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    ₹{row.unit_price}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    ₹{row.total_price}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.batch_number}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300">
                    {row.expiry_date
                      ? new Date(row.expiry_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-300 flex gap-2">
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-sm"
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
                <td
                  colSpan={columns.length}
                  className="py-4 text-center text-gray-500"
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ViewInwardData