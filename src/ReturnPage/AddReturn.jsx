import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Table,
  Divider,
  Row,
  Col,
  Typography,
  Space,
} from "antd";
import vendorService from "../components/layout/SideBarPages/services/vendorService";
import productService from "../Product/services/productService";
import returnService from "./service/returnService";

const { Title, Text } = Typography;

function AddReturn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState({ count: 0, qty: 0 });

  /** Fetch vendors */
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await vendorService.getAll();
        setVendors(res?.data || res || []);
      } catch (err) {
        console.error("Vendor load error:", err);
        message.error("Failed to load vendors");
      }
    };
    fetchVendors();
  }, []);

  /** Fetch return if editing */
  useEffect(() => {
    if (!id) return;

    const fetchReturn = async () => {
      try {
        const res = await returnService.getById(id);
        if (res) {
          // Pre-fill the form
          form.setFieldsValue({
            vendor_id: res.vendor_id,
            reason: res.reason,
            status: res.status || "pending",
            items: (res.items || []).map((it) => ({
              product_id: it.product_id,
              product_code: it.product?.product_code,
              product_name: it.product?.product_name,
              quantity: it.quantity,
            })),
          });
          updateSummary(res.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch return:", err);
        message.error("Failed to load return details");
      }
    };

    fetchReturn();
  }, [id, form]);

  /** Add product by code */
  const handleProductCode = async (e) => {
    const code = (e.target.value || "").trim();
    if (!code) return;
    e.target.value = "";

    try {
      const product = await productService.getByCode(code);
      if (!product) {
        message.error("No product found with that code");
        return;
      }

      let items = form.getFieldValue("items") || [];
      const existIndex = items.findIndex(
        (it) => it.product_code === product.product_code
      );

      if (existIndex >= 0) {
        items[existIndex].quantity += 1;
      } else {
        items.push({
          product_id: product.id,
          product_code: product.product_code,
          product_name: product.product_name,
          quantity: 1,
        });
      }

      form.setFieldsValue({ items });
      updateSummary(items);
    } catch (err) {
      console.error("Fetch product error:", err);
      message.error("Failed to fetch product");
    }
  };

  /** Submit return */
  const handleSubmit = async (values) => {
    if (!values.items?.length) {
      message.warning("Please add at least one product");
      return;
    }

    const payload = {
      vendor_id: values.vendor_id,
      reason: values.reason || "Other",
      status: values.status || "pending",
      items: values.items.map((it) => ({
        product_id: it.product_id,
        quantity: Number(it.quantity || 0),
      })),
    };

    setLoading(true);
    try {
      if (id) {
        await returnService.update(id, payload);
        message.success("Return updated successfully");
      } else {
        await returnService.create(payload);
        message.success("Return created successfully");
      }
      navigate("/return");
    } catch (err) {
      console.error("Save return error:", err);
      message.error("Failed to save return");
    } finally {
      setLoading(false);
    }
  };

  /** Update summary */
  const updateSummary = (items = []) => {
    const qty = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
    setSummary({ count: items.length, qty });
  };

  const onValuesChange = (_, all) => updateSummary(all.items || []);

  return (
    <div style={{ padding: 5 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            {id ? "Edit Return" : "Add Return"}
          </Title>
          <Text type="secondary">
            Manage product returns for vendors easily
          </Text>
        </Col>
        <Col>
          <button
            className="bg-[#1C2244] !text-white py-3 px-6 rounded-md"
            onClick={() => navigate("/return")}
          >
            Back to List
          </button>
        </Col>
      </Row>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={onValuesChange}
        initialValues={{ items: [], status: "pending" }}
      >
        <Row gutter={12}>
          {/* Vendor */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Vendor"
              name="vendor_id"
              rules={[{ required: true, message: "Please select vendor" }]}
            >
              <select className="w-full border border-gray-300 py-3 px-3 rounded-md">
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_name || v.name}
                  </option>
                ))}
              </select>
            </Form.Item>
          </Col>

          {/* Reason */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Reason"
              name="reason"
              rules={[{ required: true, message: "Please enter reason" }]}
            >
              <Input
                className="w-full border border-gray-300 !py-3 !px-3 rounded-md"
                placeholder="Enter return reason (e.g. Damage, Wrong item)"
              />
            </Form.Item>
          </Col>

          {/* ✅ Status (only visible in edit mode) */}
          {id && (
            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <select className="w-full border border-gray-300 py-3 px-3 rounded-md">
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Form.Item>
            </Col>
          )}

          {/* Product Code Input */}
          <Col xs={24}>
            <Form.Item label="Scan / Enter Product Code">
              <input
                className="w-full border border-gray-300 py-3 px-3 rounded-md"
                placeholder="Scan or type product code, press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleProductCode(e);
                  }
                }}
              />
            </Form.Item>
          </Col>

          {/* Items Table */}
          <Col xs={24}>
            <Divider style={{ margin: "8px 0 16px 0" }} />
            <Form.List name="items">
              {(fields, { remove }) => {
                const columns = [
                  {
                    title: "Product Code",
                    dataIndex: "product_code",
                    key: "product_code",
                    render: (_, record, index) => (
                      <Form.Item name={[index, "product_code"]} style={{ margin: 0 }}>
                        <Input disabled />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Product Name",
                    dataIndex: "product_name",
                    key: "product_name",
                    render: (_, record, index) => (
                      <Form.Item name={[index, "product_name"]} style={{ margin: 0 }}>
                        <Input disabled />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                    render: (_, record, index) => (
                      <Form.Item
                        name={[index, "quantity"]}
                        rules={[{ required: true, message: "Enter qty" }]}
                        style={{ margin: 0 }}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Action",
                    key: "action",
                    render: (_, record, index) => (
                      <Button
                        danger
                        onClick={() => {
                          const items = form.getFieldValue("items") || [];
                          items.splice(index, 1);
                          form.setFieldsValue({ items });
                          updateSummary(items);
                        }}
                      >
                        Remove
                      </Button>
                    ),
                  },
                ];

                const items = form.getFieldValue("items") || [];
                return (
                  <Table
                    dataSource={items.map((item, idx) => ({ ...item, key: idx }))}
                    columns={columns}
                    pagination={false}
                    size="small"
                  />
                );
              }}
            </Form.List>
          </Col>
        </Row>

        {/* Summary */}
        <Row style={{ marginTop: 16 }}>
          <Col>
            <Text strong>Total Items:</Text> {summary.count} &nbsp;&nbsp;
            <Text strong>Total Quantity:</Text> {summary.qty}
          </Col>
        </Row>

        {/* Buttons */}
        <div className="flex justify-end mt-10">
          <Space>
            <button
              className="bg-[#0E1680] !text-white py-3 px-6 rounded-md font-semibold"
              type="submit"
              disabled={loading}
            >
              {id ? "Update Return" : "Add Return"}
            </button>
            <button
              className="bg-white border border-gray-400 text-black py-3 px-6 rounded-md"
              onClick={() => navigate("/return")}
            >
              Cancel
            </button>
          </Space>
        </div>
      </Form>
    </div>
  );
}

export default AddReturn;
