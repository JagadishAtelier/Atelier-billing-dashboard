// ReportPage.jsx
import React from "react";
import { Table, Tabs, Button, Space, Tag, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

// Billing table columns
const billingColumns = [
  { title: "S.No", dataIndex: "sno", key: "sno" },
  { title: "PO-No", dataIndex: "po_no", key: "po_no" },
  { title: "Vendor Name", dataIndex: "vendor_name", key: "vendor_name" },
  { title: "Order Date", dataIndex: "order_date", key: "order_date" },
  { title: "Total Quantity", dataIndex: "total_quantity", key: "total_quantity" },
  { title: "Total Amount", dataIndex: "total_amount", key: "total_amount" },
  { title: "Tax Amount", dataIndex: "tax_amount", key: "tax_amount" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const color = status === "Paid" ? "green" : status === "Pending" ? "orange" : "red";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Details",
    key: "details",
    render: (_, record) => <Button type="link">View</Button>,
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Tooltip title="View">
          <Button icon={<EyeOutlined />} />
        </Tooltip>
        <Button icon={<EditOutlined />} type="primary" />
        <Button icon={<DeleteOutlined />} danger />
      </Space>
    ),
  },
];

// User table columns
const userColumns = [
  { title: "S.No", dataIndex: "sno", key: "sno" },
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Role", dataIndex: "role", key: "role", render: (role) => <Tag color={role === "Admin" ? "blue" : "green"}>{role}</Tag> },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button icon={<EditOutlined />} type="primary" />
        <Button icon={<DeleteOutlined />} danger />
      </Space>
    ),
  },
];

// Dummy billing data
const billingData = Array.from({ length: 10 }, (_, i) => ({
  key: i,
  sno: i + 1,
  po_no: `PO-00${i + 1}`,
  vendor_name: `Vendor ${i + 1}`,
  order_date: new Date().toLocaleDateString(),
  total_quantity: Math.floor(Math.random() * 100),
  total_amount: Math.floor(Math.random() * 10000),
  tax_amount: Math.floor(Math.random() * 1000),
  status: ["Paid", "Pending", "Failed"][i % 3],
}));

// Dummy user data
const userData = Array.from({ length: 5 }, (_, i) => ({
  key: i,
  sno: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 2 === 0 ? "Admin" : "Customer",
}));

function ReportPage() {
  return (
    <div className="p-4 min-h-screen">
      <Tabs defaultActiveKey="all">
        <TabPane tab="User" key="user">
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <h3>User Report</h3>
            <Button type="primary">Add User</Button>
          </div>
          <Table
            columns={userColumns}
            dataSource={userData}
            pagination={{ pageSize: 5 }}
            bordered
          />
        </TabPane>

        <TabPane tab="Billing" key="billing">
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <h3>Billing Report</h3>
            <Button type="primary">Add Billing</Button>
          </div>
          <Table
            columns={billingColumns}
            dataSource={billingData}
            pagination={{ pageSize: 5 }}
            bordered
          />
        </TabPane>

        <TabPane tab="All" key="all">
          <h3>All Reports</h3>
          <div style={{ marginBottom: 24 }}>
            <h4>Users</h4>
            <Table columns={userColumns} dataSource={userData} pagination={{ pageSize: 5 }} bordered />
          </div>
          <div>
            <h4>Billing</h4>
            <Table columns={billingColumns} dataSource={billingData} pagination={{ pageSize: 5 }} bordered />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default ReportPage;
