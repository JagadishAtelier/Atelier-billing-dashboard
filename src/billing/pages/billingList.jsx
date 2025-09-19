// BillingList.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Space, Popconfirm, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import billingService from "../service/billingService.js";
import debounce from "lodash.debounce";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const { Search } = Input;

const BillingList = () => {
  const navigate = useNavigate();
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [sorter, setSorter] = useState({ field: null, order: null });

  const fetchBillings = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const data = await billingService.getAll({
          page: params.current || pagination.current,
          limit: params.pageSize || pagination.pageSize,
          search: params.search || searchText,
          sortField: params.sortField || sorter.field,
          sortOrder: params.sortOrder || sorter.order,
        });

        setBillings(data.data || []);
        setPagination((prev) => ({
          ...prev,
          current: data.page || params.current || 1,
          total: data.total || 0,
          pageSize: data.limit || params.pageSize || 10,
        }));
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch billings");
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
    fetchBillings();
  }, [fetchBillings]);

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
      await billingService.remove(id);
      message.success("Billing deleted successfully");
      fetchBillings();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete billing");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Billing List", 14, 10);

    const tableData = billings.map((bill) => [
      bill.billing_no,
      bill.customer_name,
      new Date(bill.billing_date).toLocaleDateString(),
      bill.total_quantity,
      bill.total_amount,
      bill.status,
    ]);

    doc.autoTable({
      head: [
        ["Billing No", "Customer", "Date", "Quantity", "Amount", "Status"],
      ],
      body: tableData,
    });

    doc.save("billings.pdf");
  };

  const columns = [
    { title: "Billing No", dataIndex: "billing_no", key: "billing_no", sorter: true },
    { title: "Customer", dataIndex: "customer_name", key: "customer_name", sorter: true },
    {
      title: "Billing Date",
      dataIndex: "billing_date",
      key: "billing_date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    { title: "Quantity", dataIndex: "total_quantity", key: "total_quantity", sorter: true },
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
        <Tag color={status === "paid" ? "green" : status === "pending" ? "orange" : "red"}>
          {status}
        </Tag>
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
            onClick={() => navigate(`/billing/edit/${record.id}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this billing?"
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
          placeholder="Search billings..."
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
            onClick={() => navigate("/billing/add")}
          >
            Add Billing
          </Button>
          <Button type="default" onClick={exportPDF}>
            Export PDF
          </Button>
        </Space>
      </Space>

      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={billings}
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
                { title: "Discount", dataIndex: "discount_amount", key: "discount_amount", render: (v) => `₹${v}` },
                { title: "Tax", dataIndex: "tax_amount", key: "tax_amount", render: (v) => `₹${v}` },
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

export default BillingList;
