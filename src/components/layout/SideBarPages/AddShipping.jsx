// AddShipping.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  message,
  Spin,
  Table,
  Row,
  Col,
  Divider,
  Card,
} from "antd";
import dayjs from "dayjs";
import productService from "../../../Product/services/productService";
import shippingService from "./services/shippingService";

const { Option } = Select;

function AddShipping() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const searchTimeout = useRef(null);

  /* ---------- Initial ---------- */
  useEffect(() => {
    form.setFieldsValue({
      shipping_date: dayjs(),
      status: "pending",
      items: [],
    });

    if (isEdit) fetchShipping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---------- Fetch existing shipping (EDIT) ---------- */
  const fetchShipping = async () => {
    setLoading(true);
    try {
      const res = await shippingService.getById(id);
      const data = res?.data || res;

      if (!data) {
        message.error("Shipping not found");
        return;
      }

      const items =
        (data.items || []).map((i) => ({
          product_id: i.product_id,
          quantity: Number(i.quantity || 0),
          unit_price: Number(i.unit_price || 0),
          unit: i.unit || "",
          discount: Number(i.discount || 0),
          tax: Number(i.tax || 0),
          total_price: Number(i.total_price || 0),
        })) || [];

      // preload products for edit
      const productIds = [...new Set(items.map((i) => i.product_id))];
      const loadedProducts = [];

      for (const pid of productIds) {
        try {
          if (typeof productService.getById === "function") {
            // eslint-disable-next-line no-await-in-loop
            const pRes = await productService.getById(pid);
            const prod = pRes?.data || pRes;
            if (prod) loadedProducts.push(prod);
          }
        } catch {}
      }

      if (loadedProducts.length) {
        setProducts((prev) => {
          const map = new Map(prev.map((p) => [String(p.id), p]));
          loadedProducts.forEach((p) => map.set(String(p.id), p));
          return Array.from(map.values());
        });
      }

      form.setFieldsValue({
        recipient_name: data.recipient_name,
        recipient_address: data.recipient_address,
        recipient_phone: data.recipient_phone,
        recipient_email: data.recipient_email,
        shipping_date: data.shipping_date ? dayjs(data.shipping_date) : null,
        delivery_date: data.delivery_date ? dayjs(data.delivery_date) : null,
        shipping_method: data.shipping_method,
        transport_no: data.transport_no,
        shipping_cost: data.shipping_cost,
        status: data.status,
        paid_amount: data.paid_amount,
        notes: data.notes,
        items,
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to load shipping details");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Item calculation ---------- */
  const updateItem = (item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unit_price || 0);
    const discount = Number(item.discount || 0);
    const tax = Number(item.tax || 0);

    item.total_price = qty * price + tax - discount;
    return item;
  };

  /* ---------- Add / Remove item ---------- */
  const addItem = () => {
    const items = form.getFieldValue("items") || [];
    items.push({
      product_id: null,
      quantity: 1,
      unit_price: 0,
      unit: "",
      discount: 0,
      tax: 0,
      total_price: 0,
    });
    form.setFieldsValue({ items });
  };

  const removeItem = (index) => {
    const items = [...(form.getFieldValue("items") || [])];
    items.splice(index, 1);
    form.setFieldsValue({ items });
  };

  /* ---------- Product search ---------- */
  const fetchProducts = async (query = "") => {
    try {
      const res = await productService.getAll({ search: query, limit: 20 });
      setProducts(res.data || []);
    } catch {
      setProducts([]);
    }
  };

  const handleSearch = (val) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchProducts(val), 300);
  };

  const handleProductSelect = (productId, index) => {
    const items = form.getFieldValue("items") || [];
    const p = products.find((x) => String(x.id) === String(productId));
    if (!p) return;

    items[index] = updateItem({
      ...items[index],
      product_id: p.id,
      unit_price: Number(p.selling_price || 0),
      unit: p.unit || "",
      tax: Number(p.tax || 0),
    });

    form.setFieldsValue({ items });
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const rawItems = form.getFieldValue("items") || [];
      if (!rawItems.length) return message.error("Add at least one item");

      const items = rawItems.map((i) => {
        const it = updateItem({ ...i });
        return {
          product_id: String(it.product_id),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
          unit: it.unit,
          discount: Number(it.discount || 0),
          tax: Number(it.tax || 0),
          total_price: Number(it.total_price),
        };
      });

      const total_quantity = items.reduce((s, i) => s + i.quantity, 0);
      const subtotal_amount = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
      const discount_amount = items.reduce((s, i) => s + i.discount, 0);
      const tax_amount = items.reduce((s, i) => s + i.tax, 0);
      const total_amount = subtotal_amount - discount_amount + tax_amount;

      const payload = {
        recipient_name: values.recipient_name,
        recipient_address: values.recipient_address,
        recipient_phone: values.recipient_phone,
        recipient_email: values.recipient_email,
        shipping_date: values.shipping_date?.toISOString(),
        delivery_date: values.delivery_date?.toISOString(),
        shipping_method: values.shipping_method,
        transport_no: values.transport_no,
        shipping_cost: Number(values.shipping_cost || 0),
        status: values.status,
        total_quantity,
        subtotal_amount,
        discount_amount,
        tax_amount,
        total_amount,
        paid_amount: Number(values.paid_amount || 0),
        due_amount: total_amount - Number(values.paid_amount || 0),
        notes: values.notes,
        items,
        is_active: true,
      };

      if (isEdit) {
        await shippingService.update(id, payload);
        message.success("Shipping updated successfully");
      } else {
        await shippingService.create(payload);
        message.success("Shipping created successfully");
      }

      navigate("/shipping");
    } catch (err) {
      console.error(err);
      message.error("Failed to save shipping");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Table columns ---------- */
  const columns = [
    {
      title: "Product",
      render: (_, __, index) => (
        <Form.Item name={[index, "product_id"]} rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="Search product"
            filterOption={false}
            onSearch={handleSearch}
            onChange={(v) => handleProductSelect(v, index)}
          >
            {products.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.product_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      ),
    },
    {
      title: "Qty",
      render: (_, __, index) => (
        <Form.Item name={[index, "quantity"]}>
          <InputNumber min={1} />
        </Form.Item>
      ),
    },
    {
      title: "Unit Price",
      render: (_, __, index) => (
        <Form.Item name={[index, "unit_price"]}>
          <InputNumber min={0} />
        </Form.Item>
      ),
    },
    {
      title: "Discount",
      render: (_, __, index) => (
        <Form.Item name={[index, "discount"]}>
          <InputNumber min={0} />
        </Form.Item>
      ),
    },
    {
      title: "Tax",
      render: (_, __, index) => (
        <Form.Item name={[index, "tax"]}>
          <InputNumber min={0} />
        </Form.Item>
      ),
    },
    {
      title: "Total",
      render: (_, record) => `₹${record.total_price || 0}`,
    },
    {
      title: "",
      render: (_, __, index) => (
        <Button danger onClick={() => removeItem(index)}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Card title={isEdit ? "Edit Shipping" : "Add Shipping"}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Recipient Name" name="recipient_name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Recipient Phone" name="recipient_phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Recipient Address" name="recipient_address" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>

          {/* STATUS */}
          <Form.Item label="Status" name="status">
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="packing">Packing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="in_transit">In Transit</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          {/* SHIPPING METHOD & TRANSPORT NO (NO REQUIRED) */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Shipping Method" name="shipping_method">
                <Select placeholder="Select method">
                  <Option value="air">Air</Option>
                  <Option value="road">Road</Option>
                  <Option value="rail">Rail</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Transport No" name="transport_no">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Button type="dashed" onClick={addItem}>
            + Add Item
          </Button>

          <Form.List name="items">
            {() => (
              <Table
                dataSource={form.getFieldValue("items") || []}
                columns={columns}
                pagination={false}
                rowKey={(_, i) => i}
                style={{ marginTop: 12 }}
              />
            )}
          </Form.List>

          <Divider />

          <Button type="primary" htmlType="submit">
            {isEdit ? "Update Shipping" : "Create Shipping"}
          </Button>
        </Card>
      </Form>
    </Spin>
  );
}

export default AddShipping;
