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
  Switch,
} from "antd";
import dayjs from "dayjs";
import productService from "../../../Product/services/productService";
import shippingService from "./services/shippingService";
import customersService from "./services/customersService";

const { Option } = Select;

function AddShipping() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]); // product options shown in Select
  const [customers, setCustomers] = useState([]);

  const searchTimeout = useRef(null);

  /* ---------- Helpers ---------- */
  const normalizeList = (resp) => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.data?.data)) return resp.data.data;
    if (Array.isArray(resp.results)) return resp.results;
    if (Array.isArray(resp.items)) return resp.items;
    return [];
  };

  const fetchProductById = async (pid) => {
    if (!pid) return null;
    try {
      if (typeof productService.getById === "function") {
        const pres = await productService.getById(pid);
        return pres?.data ?? pres ?? null;
      }
      // fallback: try fetching a page and matching id
      const resp = await productService.getAll({ limit: 50 });
      const list = normalizeList(resp);
      return list.find((p) => String(p.id) === String(pid)) || null;
    } catch (err) {
      console.error("fetchProductById failed", err);
      return null;
    }
  };

  /* ---------- Initial ---------- */
  useEffect(() => {
    form.setFieldsValue({
      shipping_date: dayjs(),
      status: "pending",
      already_customer: false,
      items: [],
    });

    fetchCustomers();

    // preload a page of products so the dropdown shows items before user types
    fetchProducts("");

    if (isEdit) fetchShipping();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---------- Fetch customers ---------- */
  const fetchCustomers = async () => {
    try {
      const res = await customersService.getAll({ limit: 200 });
      const list = normalizeList(res);
      setCustomers(list);
    } catch (err) {
      console.error("customers fetch failed", err);
      setCustomers([]);
    }
  };

  /* ---------- When a customer is selected, autofill recipient fields ---------- */
  const handleCustomerSelect = async (customerId) => {
    if (!customerId) return;
    // try to find in loaded customers first
    let cust = customers.find((c) => String(c.id) === String(customerId));
    if (!cust) {
      try {
        const res = await customersService.getById(customerId);
        cust = res?.data || res;
      } catch (err) {
        // ignore — we won't autofill if fetch fails
      }
    }

    if (cust) {
      // pick common fields (customer_name | name), phone, address
      const name = cust.customer_name || cust.name || cust.full_name || "";
      const phone = cust.phone || cust.mobile || cust.contact || "";
      const address =
        cust.address ||
        cust.address_line ||
        cust.address1 ||
        (cust.addresses && cust.addresses[0] && cust.addresses[0].full_address) ||
        "";

      form.setFieldsValue({
        recipient_name: name,
        recipient_phone: phone,
        recipient_address: address,
        recipient_email: cust.email || cust.contact_email || form.getFieldValue("recipient_email"),
      });
    }
  };

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

      form.setFieldsValue({
        // recipient fields will be overwritten below if customer exists
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
        already_customer: Boolean(data.customer_id),
        customer_id: data.customer_id || null,
        items,
      });

      // Ensure Select options include the selected products so Select shows names (not raw ids)
      const productIds = [
        ...new Set((items || []).map((it) => it.product_id).filter(Boolean)),
      ];

      if (productIds.length > 0) {
        // fetch details for each productId in parallel and merge into products state
        const fetched = await Promise.all(productIds.map((pid) => fetchProductById(pid)));
        const valid = fetched.filter(Boolean);

        if (valid.length > 0) {
          setProducts((prev) => {
            const prevArr = Array.isArray(prev) ? prev : [];
            const combined = [...prevArr];
            valid.forEach((p) => {
              if (!combined.some((c) => String(c.id) === String(p.id))) combined.push(p);
            });
            return combined;
          });

          // enrich items with unit_price/unit/tax if missing
          const enrichedItems = (form.getFieldValue("items") || []).map((it) => {
            const p = valid.find((x) => String(x.id) === String(it.product_id));
            if (p) {
              return {
                ...it,
                unit_price: Number(it.unit_price || p.selling_price || p.purchase_price || 0),
                unit: it.unit || p.unit || "",
                tax: Number(it.tax || p.tax || p.tax_percentage || 0),
                total_price: Number(
                  (Number(it.quantity || 0) * Number(it.unit_price || 0) + Number(it.tax || 0) - Number(it.discount || 0)).toFixed(2)
                ),
              };
            }
            return it;
          });

          form.setFieldsValue({ items: enrichedItems });
        }
      }

      // if edit and customer exists, ensure autofill (and load customer if needed)
      if (data.customer_id) {
        // try autofill (this will fetch customer if not in customers list)
        await handleCustomerSelect(data.customer_id);
      }
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
    // preload products if empty so the new row has options immediately
    if (!products || products.length === 0) fetchProducts("");
  };

  const removeItem = (index) => {
    const items = [...(form.getFieldValue("items") || [])];
    items.splice(index, 1);
    form.setFieldsValue({ items });
  };

  /* ---------- Product search ---------- */
  const fetchProducts = async (query = "") => {
    try {
      const res = await productService.getAll({ search: query, limit: 50 });
      const list = normalizeList(res);
      setProducts(list);
    } catch (err) {
      console.error("product fetch failed", err);
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
      unit_price: Number(p.selling_price || p.purchase_price || 0),
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
        already_customer: values.already_customer,
        customer_id: values.already_customer ? values.customer_id : null,
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
            onFocus={() => {
              // preload if empty
              if (!products || products.length === 0) fetchProducts("");
            }}
            onChange={(v) => handleProductSelect(v, index)}
            optionLabelProp="label" // show the friendly label when selected
          >
            {products.map((p) => (
              <Option
                key={p.id}
                value={p.id}
                label={`${p.product_name || "Unnamed"}${p.product_code ? ` (${p.product_code})` : ""}`}
              >
                {p.product_name} {p.product_code ? ` — (${p.product_code})` : ""} {p.selling_price ? ` — ₹${p.selling_price}` : ""}
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
      title: "Tax",
      render: (_, __, index) => (
        <Form.Item name={[index, "tax"]}>
          <InputNumber min={0} />
        </Form.Item>
      ),
    },
    {
      title: "Total",
      render: (_, record) => `₹${Number(record.total_price || 0).toFixed(2)}`,
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
          {/* --- Already customer on TOP --- */}
          <Row gutter={16} style={{ marginBottom: 8 }}>
            <Col span={12}>
              <Form.Item
                label="Already Customer"
                name="already_customer"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              {/* Show customer select next to switch when true */}
              <Form.Item shouldUpdate={(p, c) => p.already_customer !== c.already_customer} noStyle>
                {({ getFieldValue }) =>
                  getFieldValue("already_customer") ? (
                    <Form.Item
                      label="Customer"
                      name="customer_id"
                      rules={[{ required: true, message: "Please select a customer" }]}
                    >
                      <Select
                        placeholder="Select customer"
                        showSearch
                        optionFilterProp="children"
                        onChange={(val) => handleCustomerSelect(val)}
                      >
                        {customers.map((c) => (
                          <Option key={c.id} value={c.id}>
                            {c.customer_name || c.name} {c.phone ? `(${c.phone})` : ""}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>
          </Row>

          {/* Recipient fields (will be auto-filled when customer selected) */}
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
