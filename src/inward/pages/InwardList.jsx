import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Space, Popconfirm, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import inwardService from "../service/inwardService.js";
import debounce from "lodash.debounce";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const { Search } = Input;

const InwardList = () => {
  const navigate = useNavigate();
  const [inwards, setInwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [sorter, setSorter] = useState({ field: null, order: null });

  const fetchInwards = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const data = await inwardService.getAll({
          page: params.current || pagination.current,
          limit: params.pageSize || pagination.pageSize,
          search: params.search || searchText,
          sortField: params.sortField || sorter.field,
          sortOrder: params.sortOrder || sorter.order,
        });

        setInwards(data.data || []);
        setPagination((prev) => ({
          ...prev,
          current: data.page || params.current || 1,
          total: data.total || 0,
          pageSize: data.limit || params.pageSize || 10,
        }));
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch inwards");
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, searchText, sorter]
  );

  const handleSearch = debounce((value) => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setSearchText(value);
  }, 500);

  useEffect(() => {
    fetchInwards();
  }, [fetchInwards]);

  const handleTableChange = (pag, filters, sort) => {
    setPagination(pag);
    setSorter({
      field: sort.field,
      order:
        sort.order === "ascend"
          ? "asc"
          : sort.order === "descend"
          ? "desc"
          : null,
    });
  };

  const handleDelete = async (id) => {
    try {
      await inwardService.remove(id);
      message.success("Inward deleted successfully");
      fetchInwards();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete inward");
    }
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
      head: [
        ["Inward No", "Supplier", "Date", "Quantity", "Amount", "Status"],
      ],
      body: tableData,
    });

    doc.save("inwards.pdf");
  };

  const columns = [
    {
      title: "Inward No",
      dataIndex: "inward_no",
      key: "inward_no",
      sorter: true,
    },
    {
      title: "Supplier",
      dataIndex: "supplier_name",
      key: "supplier_name",
      sorter: true,
    },
    {
      title: "Received Date",
      dataIndex: "received_date",
      key: "received_date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: "Quantity",
      dataIndex: "total_quantity",
      key: "total_quantity",
      sorter: true,
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount) => `₹${amount}`,
      sorter: true,
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
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/inward/edit/${record.id}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this inward?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Space
        style={{
          marginBottom: 16,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Search
          placeholder="Search inwards..."
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          enterButton
          allowClear
          style={{ width: 300 }}
        />
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/inward/add")}
          >
            Add Inward
          </Button>
          <Button type="default" onClick={exportPDF}>
            Export PDF
          </Button>
        </Space>
      </Space>

      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={inwards}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        bordered
        expandable={{
          expandedRowRender: (record) => (
            <Table
              columns={[
                { title: "Product", dataIndex: ["product", "product_name"], key: "product_name" },
                { title: "Code", dataIndex: ["product", "product_code"], key: "product_code" },
                { title: "Quantity", dataIndex: "quantity", key: "quantity" },
                { title: "Unit Price", dataIndex: "unit_price", key: "unit_price", render: (v) => `₹${v}` },
                { title: "Total", dataIndex: "total_price", key: "total_price", render: (v) => `₹${v}` },
                { title: "Batch", dataIndex: "batch_number", key: "batch_number" },
                {
                  title: "Expiry Date",
                  dataIndex: "expiry_date",
                  key: "expiry_date",
                  render: (date) =>
                    date ? new Date(date).toLocaleDateString() : "-",
                },
              ]}
              dataSource={record.items || []}
              pagination={false}
              rowKey={(item) => item.id}
              size="small"
            />
          ),
        }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default InwardList;
