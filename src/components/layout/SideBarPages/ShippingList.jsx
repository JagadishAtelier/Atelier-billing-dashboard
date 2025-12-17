// ShippingList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Tag,
  message,
  Tabs,
  Radio,
  List,
  Card,
  Row,
  Col,
  Empty,
  Divider,
  Modal,
  Tooltip,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import shippingService from "./services/shippingService";
import debounce from "lodash.debounce";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Table2, Book } from "lucide-react";

const { Search } = Input;

/* ---------- Helpers ---------- */
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const statusMeta = (status = "") => {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return { bg: "#dcfce7", color: "#166534", label: "Delivered" };
  if (s === "in_transit") return { bg: "#e0f2fe", color: "#075985", label: "In Transit" };
  if (s === "shipped") return { bg: "#fef3c7", color: "#92400e", label: "Shipped" };
  if (s === "packing") return { bg: "#eef2ff", color: "#3730a3", label: "Packing" };
  if (s === "cancelled") return { bg: "#fee2e2", color: "#7f1d1d", label: "Cancelled" };
  return { bg: "#f3f4f6", color: "#374151", label: "Pending" };
};

const cardStyles = {
  cardWrap: {
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(16,24,40,0.06)",
    border: "1px solid #f1f5f9",
  },
  header: { display: "flex", justifyContent: "space-between", gap: 12 },
  left: { display: "flex", gap: 12, alignItems: "center" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 10,
    background: "#0ea5a4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
  },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
};

/* ---------- Component ---------- */
function ShippingList() {
  const navigate = useNavigate();

  const [shippings, setShippings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("card");

  const fetchShippings = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const req = {
          page: params.current ?? pagination.current,
          limit: params.pageSize ?? pagination.pageSize,
          search: params.search ?? searchText,
        };
        if (statusFilter !== "all") req.status = statusFilter;

        const data = await shippingService.getAll(req);
        setShippings(data.data || []);
        setPagination({
          current: data.page,
          pageSize: data.limit,
          total: data.total,
        });
      } catch {
        message.error("Failed to load shippings");
      } finally {
        setLoading(false);
      }
    },
    [searchText, statusFilter]
  );

  useEffect(() => {
    fetchShippings();
  }, [fetchShippings]);

  const doSearch = debounce((v) => {
    setPagination((p) => ({ ...p, current: 1 }));
    setSearchText(v);
  }, 500);

  const handleDelete = async (id) => {
    await shippingService.remove(id);
    message.success("Deleted");
    fetchShippings();
  };

  const columns = [
    { title: "Shipping No", dataIndex: "shipping_no" },
    { title: "Recipient", dataIndex: "recipient_name" },
    { title: "Quantity", dataIndex: "total_quantity" },
    {
      title: "Amount",
      dataIndex: "total_amount",
      render: (v) => `₹${v}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => {
        const m = statusMeta(s);
        return <Tag style={{ background: m.bg, color: m.color }}>{m.label}</Tag>;
      },
    },
    {
      title: "Actions",
      render: (_, r) => (
        <Space>
          <Button icon={<EyeOutlined />} />
          <Button icon={<EditOutlined />} onClick={() => navigate(`/shipping/edit/${r.id}`)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 min-h-screen">
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Tabs
            activeKey={statusFilter}
            onChange={(k) => setStatusFilter(k)}
            items={[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "packing", label: "Packing" },
              { key: "shipped", label: "Shipped" },
              { key: "in_transit", label: "In Transit" },
              { key: "delivered", label: "Delivered" },
            ]}
          />
        </Col>
        <Col>
          <Space>
            {/* <Search placeholder="Search shipping" onChange={(e) => doSearch(e.target.value)} /> */}
            <Button style={{backgroundColor: "#506ee4", color:"#fff", height: "40px"}} icon={<PlusOutlined />} onClick={() => navigate("/shipping/add")}>
              Add Shipping
            </Button>
            <Radio.Group style={{display:"flex"}} value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <Radio.Button value="table" style={{display:"flex",  alignItems:"center", justifyContent:"center", width:"40px", borderTopRightRadius:"0px !important", borderBottomRightRadius:"0px !important"}}>
                <Table2 size={16} />
              </Radio.Button>
              <Radio.Button value="card" style={{display:"flex",  alignItems:"center", justifyContent:"center", width:"40px", borderTopRightRadius:"0px !important", borderBottomRightRadius:"0px !important"}}>
                <Book size={16} />
              </Radio.Button>
            </Radio.Group>
          </Space>
        </Col>
      </Row>

      {/* Content */}
      {viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={shippings}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(p) => fetchShippings({ current: p.current, pageSize: p.pageSize })}
          bordered
        />
      ) : (
        <List
          grid={{ gutter: 18, xs: 1, sm: 2, lg: 3 }}
          dataSource={shippings}
          locale={{ emptyText: <Empty description="No shippings" /> }}
          renderItem={(s) => {
            const meta = statusMeta(s.status);
            return (
              <List.Item>
                <Card style={cardStyles.cardWrap} bodyStyle={{ padding: 16 }}>
                  <div style={cardStyles.header}>
                    <div style={cardStyles.left}>
                      <div style={cardStyles.avatar}>{getInitials(s.recipient_name)}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{s.recipient_name}</div>
                        <div style={{ color: "#6b7280", fontSize: 12 }}>{s.shipping_no}</div>
                      </div>
                    </div>
                    <Tag style={{ background: meta.bg, color: meta.color, height: 24 }}>{meta.label}</Tag>
                  </div>

                  <Divider style={{ margin: "12px 0" }} />

                  <div style={{ maxHeight: 90, overflowY: "auto" }}>
                    {(s.items || []).map((it, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span>{it.product?.product_name || "—"}</span>
                        <span>
                          {it.quantity} × ₹{it.unit_price}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Divider />

                  <div style={cardStyles.footer}>
                    <div>
                      <div style={{ color: "#6b7280", fontSize: 12 }}>Total</div>
                      <div style={{ fontWeight: 800 }}>₹{s.total_amount}</div>
                    </div>
                    <Space>
                      <Button icon={<EyeOutlined />} />
                      <Button icon={<EditOutlined />} onClick={() => navigate(`/shipping/edit/${s.id}`)} />
                      <Popconfirm title="Delete?" onConfirm={() => handleDelete(s.id)}>
                        <Button danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
}

export default ShippingList;
