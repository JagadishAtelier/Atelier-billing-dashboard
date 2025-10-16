import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Space, Popconfirm, Tag, message, Modal } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

const dummyInwards = [
  {
    id: 1,
    inward_no: "INW-001",
    supplier_name: "ABC Traders",
    received_date: "2025-10-10",
    total_quantity: 50,
    total_amount: 5000,
    status: "completed",
    items: [
      {
        id: 101,
        product: { product_name: "Product A", product_code: "PA-001" },
        quantity: 10,
        unit_price: 100,
        total_price: 1000,
        batch_number: "B001",
        expiry_date: "2026-12-31",
      },
      {
        id: 102,
        product: { product_name: "Product B", product_code: "PB-002" },
        quantity: 40,
        unit_price: 100,
        total_price: 4000,
        batch_number: "B002",
        expiry_date: "2026-06-30",
      },
    ],
  },
];

const InwardList = () => {
  const navigate = useNavigate();
  const [inwards, setInwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItems, setModalItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setInwards(dummyInwards);
      setLoading(false);
    }, 500);
  }, []);

  const handleDelete = (id) => {
    message.success(`Deleted inward ${id} (dummy)`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Inward List", 14, 10);

    const tableData = inwards.map((inward) => [
      inward.inward_no,
      inward.supplier_name,
      new Date(inward.received_date).toLocaleDateString(),
      inward.total_quantity,
      inward.total_amount,
      inward.status,
    ]);

    doc.autoTable({
      head: [["Inward No", "Supplier", "Date", "Quantity", "Amount", "Status"]],
      body: tableData,
    });

    doc.save("inwards.pdf");
  };

  const openModal = (items) => {
    setModalItems(items);
    setModalVisible(true);
  };

  const filteredItems = modalItems.filter(
    (item) =>
      item.product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemDelete = (id) => {
    setModalItems(modalItems.filter((item) => item.id !== id));
  };

  const handleItemEdit = (id) => {
    alert(`Edit product with ID: ${id}`);
  };

  const columns = [
    { title: "Inward No", dataIndex: "inward_no", key: "inward_no" },
    { title: "Supplier", dataIndex: "supplier_name", key: "supplier_name" },
    {
      title: "Received Date",
      dataIndex: "received_date",
      key: "received_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: "Quantity", dataIndex: "total_quantity", key: "total_quantity" },
    {
      title: "Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<Eye />}
            onClick={() => openModal(record.items)}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/inward/edit/${record.id}`)}
          >
          </Button>
          <Popconfirm
            title="Are you sure to delete this inward?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/inward/add")}>
          Add Inward
        </Button>
        <Button type="default" onClick={exportPDF}>
          Export PDF
        </Button>
      </Space>

      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={inwards}
        loading={loading}
        bordered
        scroll={{ x: true }}
      />

      <Modal
        title="Inward Items"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
      >
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-3 mb-4 w-1/2 bg-white">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by product, code, or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm w-full"
          />
        </div>

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
                  <th key={idx} className="py-4 px-4 text-left text-white font-semibold border-b">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((row, index) => (
                  <tr key={row.id} className="hover:bg-[#E1E6FF] border-b border-gray-300">
                    <td className="py-4 px-4 ">{index + 1}</td>
                    <td className="py-4 px-4 ">{row.product.product_name}</td>
                    <td className="py-4 px-4 ">{row.product.product_code}</td>
                    <td className="py-4 px-4 ">{row.quantity}</td>
                    <td className="py-4 px-4 ">₹{row.unit_price}</td>
                    <td className="py-4 px-4 ">₹{row.total_price}</td>
                    <td className="py-4 px-4 ">{row.batch_number}</td>
                    <td className="py-4 px-4 ">
                      {row.expiry_date ? new Date(row.expiry_date).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default InwardList;
