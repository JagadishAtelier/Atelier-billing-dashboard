// PackingList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tag,
  message,
  Radio,
  List,
  Card,
  Row,
  Col,
  Empty,
  Divider,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import shippingService from "./services/shippingService";
import { Table2, Book } from "lucide-react";

/* ---------- Helpers ---------- */
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const statusMeta = () => ({
  bg: "#eef2ff",
  color: "#3730a3",
  label: "Packing",
});

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
function PackingList() {
  const navigate = useNavigate();

  const [shippings, setShippings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [viewMode, setViewMode] = useState("card");

  const fetchPackings = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const req = {
          page: params.current ?? pagination.current,
          limit: params.pageSize ?? pagination.pageSize,
          status: "packing", // ✅ FIXED FILTER
        };

        const data = await shippingService.getAll(req);
        setShippings(data.data || []);
        setPagination({
          current: data.page,
          pageSize: data.limit,
          total: data.total,
        });
      } catch {
        message.error("Failed to load packing list");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPackings();
  }, [fetchPackings]);

  const handleDelete = async (id) => {
    await shippingService.remove(id);
    message.success("Deleted");
    fetchPackings();
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
      render: () => {
        const m = statusMeta();
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
          <h2 style={{ margin: 0 }}>Packing List</h2>
        </Col>
        <Col>
          <Space>

            <Radio.Group
              style={{ display: "flex" }}
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <Radio.Button value="table" style={{ display:"flex",  alignItems:"center", justifyContent:"center", width:"40px", borderTopRightRadius:"0px !important", borderBottomRightRadius:"0px !important"}}>
                <Table2 size={16} />
              </Radio.Button>
              <Radio.Button value="card" style={{ display:"flex",  alignItems:"center", justifyContent:"center", width:"40px", borderTopRightRadius:"0px !important", borderBottomRightRadius:"0px !important"}}>
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
          onChange={(p) => fetchPackings({ current: p.current, pageSize: p.pageSize })}
          bordered
        />
      ) : (
        <List
          grid={{ gutter: 18, xs: 1, sm: 2, lg: 3 }}
          dataSource={shippings}
          locale={{ emptyText: <Empty description="No packing orders" /> }}
          renderItem={(s) => {
            const meta = statusMeta();
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
                      <div
                        key={idx}
                        style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
                      >
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

export default PackingList;
