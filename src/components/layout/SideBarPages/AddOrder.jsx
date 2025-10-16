import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  InputNumber,
  Button,
  DatePicker,
  message,
  Table,
  Divider,
  Space,
  Row,
  Col,
  Typography,
} from "antd";
import vendorService from "./services/vendorService";
import productService from "../../../Product/services/productService";
import orderService from "./services/orderService";
import dayjs from "dayjs";

const { Title, Text } = Typography;

function AddOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState({
    items: [],
    count: 0,
    qty: 0,
    value: 0,
    lastAddedIndex: -1,
  });

  /** 🔹 Fetch vendors list */
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await vendorService.getAll();
        setVendors(res?.data || res || []);
      } catch (err) {
        console.error("Failed to load vendors:", err);
        message.error("Failed to load vendor list");
      }
    };
    fetchVendors();
  }, []);

  /** 🔹 Add product by code */
  const handleProductCode = async (e) => {
    const code = (e?.target?.value || "").trim();
    if (!code) return;
    e.target.value = "";

    try {
      const product = await productService.getByCode(code);
      if (!product) {
        message.error("No product found with that code");
        return;
      }

      let items = form.getFieldValue("items") || [];
      const existingIndex = items.findIndex(
        (item) => item.product_code === product.product_code
      );

      if (existingIndex >= 0) {
        items[existingIndex].quantity += 1;
        form.setFieldsValue({ items });
        updateSummary(items, existingIndex);
      } else {
        items.push({
          product_id: product.id,
          product_code: product.product_code,
          product_name: product.product_name,
          quantity: 1,
          unit_price: Number(product.purchase_price) || 0,
          unit: product.unit || "",
          expiry_date: null,
        });
        form.setFieldsValue({ items });
        updateSummary(items, items.length - 1);
      }
    } catch (err) {
      console.error("Fetch product error:", err);
      message.error("Failed to fetch product");
    }
  };

  /** 🔹 Submit order */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formattedItems = (values.items || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity || 0),
        unit_price: Number(item.unit_price || 0),
      }));

      const payload = {
        vendor_id: values.vendor_id,
        order_date: values.order_date
          ? dayjs(values.order_date).toDate()
          : new Date(),
        status: "pending", // ✅ always set to pending
        items: formattedItems,
      };

      await orderService.create(payload);
      message.success("Order created successfully");
      navigate("/order/list");
    } catch (err) {
      console.error("Save error:", err);
      message.error("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Update summary */
  const updateSummary = (items = [], lastAddedIndex = -1) => {
    let qty = 0;
    let value = 0;
    (items || []).forEach((it) => {
      const q = Number(it.quantity || 0);
      const p = Number(it.unit_price || 0);
      qty += q;
      value += q * p;
    });
    setSummary({
      items,
      count: items.length,
      qty,
      value,
      lastAddedIndex,
    });
  };

  const onValuesChange = (_, allValues) => {
    updateSummary(allValues.items || [], -1);
  };

  useEffect(() => {
    const items = form.getFieldValue("items") || [];
    updateSummary(items, -1);
  }, []);

  const columns = [
    {
      title: "Product Code",
      dataIndex: "product_code",
      key: "product_code",
      width: 140,
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Quantity",
      key: "quantity",
      width: 120,
      render: (_, __, index) => (
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
      title: "Unit Price",
      key: "unit_price",
      width: 140,
      render: (_, __, index) => (
        <Form.Item
          name={[index, "unit_price"]}
          rules={[{ required: true, message: "Enter price" }]}
          style={{ margin: 0 }}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      ),
    },
    {
      title: "Unit",
      key: "unit",
      width: 110,
      render: (_, __, index) => (
        <Form.Item name={[index, "unit"]} style={{ margin: 0 }}>
          <input className="w-full outline-none text-sm border border-gray-300 py-2 px-3 rounded-md bg-white" />
        </Form.Item>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, __, index) => (
        <Button
          danger
          onClick={() => {
            const items = form.getFieldValue("items") || [];
            items.splice(index, 1);
            form.setFieldsValue({ items });
            updateSummary(items, -1);
          }}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 5 }}>
      <Row
        gutter={16}
        align="middle"
        justify="space-between"
        style={{ marginBottom: 16 }}
      >
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            {id ? "Edit Order" : "Add Order"}
          </Title>
          <Text type="secondary">
            Create Order entries quickly using product codes
          </Text>
        </Col>
        <Col>
          <Space>
            <button
              className="bg-[#1C2244] !text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
              onClick={() => navigate("/order/list")}
            >
              Back to list
            </button>
          </Space>
        </Col>
      </Row>

      <div className="mt-10">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ items: [] }}
          onValuesChange={onValuesChange}
        >
          <Row gutter={12}>
            {/* ✅ Vendor dropdown (show name, send id) */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Vendor Name"
                name="vendor_id"
                rules={[{ required: true, message: "Please select a vendor" }]}
              >
                <select className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white">
                  <option value="">Select Vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vendor_name || v.name}
                    </option>
                  ))}
                </select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Order Date"
                name="order_date"
                rules={[{ required: true, message: "Please select order date" }]}
              >
                <input
                  type="date"
                  className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white"
                />
              </Form.Item>
            </Col>

            {/* 🟢 Removed the Status dropdown */}

            {/* Product code input */}
            <Col xs={24}>
              <Form.Item label="Scan/Enter Product Code">
                <input
                  className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white"
                  placeholder="Scan or type code, press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleProductCode(e);
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Divider style={{ margin: "8px 0 16px 0" }} />
              <Form.List name="items">
                {(fields, { remove }) => {
                  const items = form.getFieldValue("items") || [];
                  return (
                    <Table
                      dataSource={items}
                      columns={columns}
                      pagination={false}
                      rowKey={(record, idx) => idx}
                      size="small"
                    />
                  );
                }}
              </Form.List>
            </Col>
          </Row>

          {/* Submit buttons */}
          <div className="flex justify-end mt-10">
            <Space>
              <button
                className="bg-[#1C2244] !text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
                type="submit"
                disabled={loading}
              >
                {id ? "Update Order" : "Add Order"}
              </button>
              <button
                className="bg-white border border-gray-400 text-black py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
                onClick={() => navigate("/order")}
              >
                Cancel
              </button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default AddOrder;
