import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  message,
  Spin,
  Table,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import dayjs from "dayjs";
import productService from "../../Product/services/productService";
import billingService from "../service/billingService";

const { Title } = Typography;
const { Option } = Select;

function BillingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [preview, setPreview] = useState({ items: [], customer_name: "", billing_date: dayjs() });

  useEffect(() => {
    form.setFieldsValue({ billing_date: dayjs(), status: "pending", items: [] });
    setPreview({ items: [], billing_date: dayjs(), customer_name: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ensure item calculations are up-to-date
  const updateItemCalculations = (item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unit_price || 0);
    const discount = Number(item.discount_amount || 0);
    // tax_percentage is used to compute tax_amount; numeric percent (e.g. 7.5)
    const taxPerc = Number(item.tax_percentage || 0);

    const tax = ((qty * price * taxPerc) / 100);
    const total = qty * price + tax - discount;

    item.tax_amount = parseFloat(tax.toFixed(2));
    item.total_price = parseFloat(total.toFixed(2));
    return item;
  };

  // ADD PRODUCT BY CODE
  const handleProductCode = async (code) => {
    const trimmed = String(code || "").trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const product = await productService.getByCode(trimmed);

      if (!product || !product.product_code) {
        message.error("No product found for code: " + trimmed);
        return;
      }

      // resolve product id from common property names
      const resolvedProductId =
        product.id ||
        product._id ||
        product.uuid ||
        product.product_uuid ||
        product.productId ||
        null;

      if (!resolvedProductId) {
        message.error("Product is missing an id/uuid and cannot be added to the bill.");
        console.error("Product payload missing id/uuid:", product);
        return;
      }

      let items = form.getFieldValue("items") || [];
      const index = items.findIndex((i) => i.product_code === product.product_code);

      if (index >= 0) {
        items[index].quantity = (items[index].quantity || 0) + 1;
        items[index] = updateItemCalculations(items[index]);
      } else {
        const newItem = updateItemCalculations({
          product_id: String(resolvedProductId),
          product_code: product.product_code,
          product_name: product.product_name || product.name || "",
          quantity: 1,
          unit_price: product.selling_price || product.price || 0,
          discount_amount: 0,
          tax_percentage: product.tax_percentage || product.tax || 0,
          tax_amount: 0,
          total_price: 0,
        });
        items = [...items, newItem];
      }

      form.setFieldsValue({ items });
      setPreview((p) => ({ ...p, items }));

      message.success(`${product.product_name || product.product_code} added`);
      setProductCode("");
    } catch (err) {
      console.error("handleProductCode error:", err);
      message.error(
        (err && err.response && err.response.data && (err.response.data.message || err.response.data.error)) ||
          "Failed to fetch product"
      );
    } finally {
      setLoading(false);
    }
  };

  // update a single item field (qty/discount/price)
  const handleItemChange = (index, field, value) => {
    let items = form.getFieldValue("items") || [];
    if (!items[index]) return;
    const item = { ...items[index], [field]: value };
    items[index] = updateItemCalculations(item);
    form.setFieldsValue({ items });
    setPreview((p) => ({ ...p, items }));
  };

  const removeItem = (index) => {
    const items = (form.getFieldValue("items") || []).slice();
    items.splice(index, 1);
    form.setFieldsValue({ items });
    setPreview((p) => ({ ...p, items }));
  };

  // calculate invoice summary
  const calculateSummaryFromItems = (items) => {
    const subtotal = items.reduce((sum, i) => sum + (Number(i.unit_price) || 0) * (Number(i.quantity) || 0), 0);
    const totalDiscount = items.reduce((sum, i) => sum + (Number(i.discount_amount) || 0), 0);
    const totalTax = items.reduce((sum, i) => sum + (Number(i.tax_amount) || 0), 0);
    const grandTotal = subtotal - totalDiscount + totalTax;
    return { subtotal, totalDiscount, totalTax, grandTotal };
  };

  // when form changes, keep preview in sync and make sure computed fields exist
  const onValuesChange = (changed, all) => {
    const items = (all.items || []).map((it) => updateItemCalculations({ ...it }));
    form.setFieldsValue({ items });
    setPreview({ ...all, items });
  };

  // SUBMIT -> send payload shape backend expects
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const itemsRaw = form.getFieldValue("items") || [];

      if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
        message.error("Add at least one product/item before submitting the bill.");
        setLoading(false);
        return;
      }

      for (const it of itemsRaw) {
        if (!it.product_id) {
          message.error("One or more items are missing product_id. Remove and re-add them.");
          console.error("Invalid item (missing product_id):", it);
          setLoading(false);
          return;
        }
      }

      // Build items using backend field names: discount_amount, tax_amount, total_price
      const items = itemsRaw.map((i) => {
        // ensure computed fields exist
        const item = updateItemCalculations({ ...i });
        return {
          product_id: String(item.product_id),
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unit_price || 0),
          unit: item.unit || "",
          discount_amount: Number(item.discount_amount || 0),
          tax_amount: Number(item.tax_amount || 0),
          total_price: Number(item.total_price || (item.quantity * item.unit_price + item.tax_amount - item.discount_amount) || 0),
        };
      });

      // Summaries
      const subtotal = items.reduce((s, it) => s + (it.unit_price * it.quantity), 0);
      const discount_amount = items.reduce((s, it) => s + (it.discount_amount || 0), 0);
      const tax_amount = items.reduce((s, it) => s + (it.tax_amount || 0), 0);
      const totalQuantity = items.reduce((s, it) => s + (it.quantity || 0), 0);
      const totalAmount = subtotal - discount_amount + tax_amount;

      // bill_no is optional — server generates billing_no; keep client-side id in bill_no if provided
      const bill_no = values.bill_no || `BILL-${Date.now()}`;

      // Build final payload that matches backend.createBillingWithItems
      const payload = {
        // server will create billing_no; sending bill_no is harmless if you want to keep client id
        bill_no,
        status: "paid",
        customer_name: values.customer_name || "",
        customer_phone: values.customer_phone || "",
        billing_date: values.billing_date ? dayjs(values.billing_date).toISOString() : new Date().toISOString(),
        counter_no: values.counter_no || null,
        discount_amount,
        tax_amount,
        total_amount: totalAmount,
        paid_amount: Number(values.paid_amount || 0),
        payment_method: values.payment_method || "cash",
        notes: values.remarks || "",
        total_quantity: totalQuantity, // backend expects `status`
        is_active: true,
        items, // IMPORTANT: name is `items` not `billing_items`
      };

      console.log("Billing payload ->", payload);

      if (!Array.isArray(payload.items) || payload.items.length === 0) {
        message.error("No billing items detected. Please add items to the bill.");
        setLoading(false);
        return;
      }

      await billingService.create(payload);

      message.success("Billing created successfully");
      navigate("/billing/list");
    } catch (err) {
      console.error("create billing error:", err);
      const serverMsg =
        err &&
        err.response &&
        (err.response.data?.error || err.response.data?.message || JSON.stringify(err.response.data));
      message.error(serverMsg || "Failed to create billing");
    } finally {
      setLoading(false);
    }
  };

  // table columns (editable)
  const columns = [
    { title: "Product Code", dataIndex: "product_code", key: "code" },
    { title: "Product Name", dataIndex: "product_name", key: "name" },
    {
      title: "Qty",
      key: "qty",
      render: (_, record, idx) => (
        <InputNumber min={1} value={record.quantity} onChange={(v) => handleItemChange(idx, "quantity", v || 0)} />
      ),
    },
    { title: "Unit Price", dataIndex: "unit_price", key: "price", render: (v) => `₹${(Number(v) || 0).toFixed(2)}` },
    {
      title: "Discount",
      key: "disc",
      render: (_, record, idx) => (
        <InputNumber min={0} value={record.discount_amount} onChange={(v) => handleItemChange(idx, "discount_amount", v || 0)} />
      ),
    },
    { title: "Tax", dataIndex: "tax_amount", key: "tax", render: (v) => `₹${(Number(v) || 0).toFixed(2)}` },
    { title: "Total", dataIndex: "total_price", key: "total", render: (v) => `₹${(Number(v) || 0).toFixed(2)}` },
    {
      title: "",
      key: "actions",
      render: (_, __, idx) => (
        <Button danger size="small" onClick={() => removeItem(idx)}>
          Remove
        </Button>
      ),
    },
  ];

  // preview (read-only)
  const previewColumns = [
    { title: "#", dataIndex: "_idx", key: "idx", render: (_, __, idx) => idx + 1 },
    { title: "Product", dataIndex: "product_name", key: "pname" },
    { title: "Qty", dataIndex: "quantity", key: "pq" },
    { title: "Unit", dataIndex: "unit_price", key: "pu", render: (v) => `₹${(Number(v) || 0).toFixed(2)}` },
    { title: "Tax", dataIndex: "tax_amount", key: "pt", render: (v) => `₹${(Number(v) || 0).toFixed(2)}` },
    { title: "Total", dataIndex: "total_price", key: "ptotal", render: (v) => `₹${(Number(v) || 0).toFixed(2)}` },
  ];

  const summary = calculateSummaryFromItems(preview.items || []);

  const styles = {
    page: { background: "#f1f6fb", minHeight: "100vh", padding: 12 },
    container: { maxWidth: 1100, margin: "0 auto" },
    mainGrid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 },
    leftCard: { background: "#fff", borderRadius: 8, padding: 12 },
    rightCard: { background: "#fff", borderRadius: 8, padding: 12, height: "fit-content", position: "sticky", top: 24 },
    sectionTitle: { color: "#0b75ff", fontWeight: 600 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Spin spinning={loading}>
          <Form
            form={form}
            className="form"
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ status: "pending", items: [] }}
            onValuesChange={onValuesChange}
          >
            <div style={styles.mainGrid}>
              <div style={styles.leftCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={styles.sectionTitle}>Billing Details</div>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Bill no" name="bill_no">
                      <Input placeholder="" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Billing Date" name="billing_date" rules={[{ required: true, message: "Select billing date" }]}>
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Customer Name" name="customer_name" rules={[{ required: true, message: "Enter customer name" }]}>
                      <Input placeholder="Enter customer name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Customer phone no" name="customer_phone">
                      <Input placeholder="Enter Customer phone no" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Counter No" name="counter_no" placeholder="Select">
                      <Select>
                        <Option value="Counter 1">Counter 1</Option>
                        <Option value="Counter 2">Counter 2</Option>
                        <Option value="Counter 3">Counter 3</Option>
                        <Option value="Counter 4">Counter 4</Option>
                        <Option value="Counter 5">Counter 5</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Payment Method" name="payment_method" placeholder="Select">
                      <Select>
                        <Option value="cash">Cash</Option>
                        <Option value="card">Card</Option>
                        <Option value="upi">UPI</Option>
                        <Option value="netbanking">Net Banking</Option>
                        <Option value="wallet">Wallet</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Scan / Enter Product Code">
                  <Input
                    placeholder="Scan or type code and press Enter"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleProductCode(productCode);
                      }
                    }}
                  />
                </Form.Item>

                {/* Items table (editable) */}
                <Form.List name="items">
                  {(fields, { remove }) => {
                    const items = form.getFieldValue("items") || [];
                    return (
                      <>
                        <Table dataSource={items} columns={columns} pagination={false} rowKey={(r, idx) => idx} size="small" style={{ marginBottom: 8 }} />

                        <div style={{ display: "flex", justifyContent: "right", alignItems: "right", marginTop: 10 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <div style={{ color: "#374151" }}>Subtotal</div>
                              <div>₹{summary.subtotal.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>

                        <Divider />
                      </>
                    );
                  }}
                </Form.List>
              </div>

              {/* RIGHT: live preview */}
              <div style={styles.rightCard}>
                <Title level={5} style={{ marginBottom: 6 }}>
                  Bill Preview
                </Title>

                <style>{`
                  .invoiceHeader{background: gray; padding:12px; border-radius:6px; color:#fff}
                  .invoiceHeader .company{font-weight:800; font-size:16px}
                  .invoiceHeader .meta{font-size:12px; opacity:0.95}
                  .previewTable .ant-table-thead > tr > th{background:transparent; color:#0b75ff}
                  .previewTable .even-row{background:rgba(11,117,255,0.04)}
                  .previewTotals{background:#ffffff; padding:12px; border-radius:8px; box-shadow:0 6px 18px rgba(11,117,255,0.06)}
                  .badge{display:inline-block; padding:4px 8px; border-radius:999px; font-weight:700}
                  .badge-paid{background:#bbf7d0; color:#065f46}
                  .badge-pending{background:#fee2e2; color:#991b1b}
                `}</style>

                <div className="invoiceHeader">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="company">Atelier Tech</div>
                      <div className="meta">Eldeco corporate, Saravanampatti</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>{preview.billing_date ? dayjs(preview.billing_date).format("DD MMM YYYY") : "-"}</div>
                      <div style={{ fontSize: 12 }}>{preview.customer_name || "-"}</div>
                      <div style={{ fontSize: 12 }}>📞 {preview.customer_phone || preview.customer_phone_nu || "-"}</div>
                      <div style={{ fontSize: 12 }}>⌖ {preview.counter_no || preview.couner || "-"}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <Table
                    className="previewTable"
                    dataSource={(preview.items || []).map((it, i) => ({ ...it, key: i }))}
                    columns={previewColumns}
                    pagination={false}
                    size="small"
                    rowClassName={(record, idx) => (idx % 2 === 0 ? "even-row" : "")}
                    style={{ marginBottom: 8, borderRadius: 6, overflow: "hidden" }}
                  />

                  <div className="previewTotals" style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ color: "#374151" }}>Subtotal</div>
                      <div>₹{summary.subtotal.toFixed(2)}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>Tax</div>
                      <div>₹{summary.totalTax.toFixed(2)}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>Discount</div>
                      <div>₹{summary.totalDiscount.toFixed(2)}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 10, marginTop: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>Total Amount</div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>₹{summary.grandTotal.toFixed(2)}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "right", marginTop: 10, alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button onClick={() => form.resetFields()}>Save To Draft</Button>
                        <Button type="primary" htmlType="submit" style={{ background: "#0b75ff", borderColor: "#0b75ff" }}>
                          Add Bill
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: 18 }} />
          </Form>
        </Spin>
      </div>
    </div>
  );
}

export default BillingForm;
