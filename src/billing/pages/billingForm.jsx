// billingForm.jsx
import React, { useEffect, useState, useRef } from "react";
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
  Card,
  List,
  Badge,
  Space,
} from "antd";
import dayjs from "dayjs";
import productService from "../../Product/services/productService";
import billingService from "../service/billingService";
import { Trash } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

function BillingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [preview, setPreview] = useState({ items: [], customer_name: "", billing_date: dayjs() });

  // product search
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const searchTimeout = useRef(null);

  // summary similar to InwardForm
  const [summary, setSummary] = useState({
    items: [],
    count: 0,
    qty: 0,
    value: 0,
    lastAddedIndex: -1,
  });

  useEffect(() => {
    form.setFieldsValue({ billing_date: dayjs(), status: "pending", items: [] });
    setPreview({ items: [], billing_date: dayjs(), customer_name: "" });
    // initialize summary
    const items = form.getFieldValue("items") || [];
    updateSummary(items, -1);
    // cleanup on unmount
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
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

    item.tax_amount = parseFloat((isFinite(tax) ? tax : 0).toFixed(2));
    item.total_price = parseFloat((isFinite(total) ? total : 0).toFixed(2));
    return item;
  };

  // ADD PRODUCT BY CODE (scanner / Enter)
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
        form.setFieldsValue({ items });
        updateSummary(items, index);
      } else {
        const newItem = updateItemCalculations({
          product_id: String(resolvedProductId),
          product_code: product.product_code,
          product_name: product.product_name || product.name || "",
          quantity: 1,
          unit_price: Number(product.selling_price) || 0,
          discount_amount: 0,
          tax_percentage: Number(product.tax_percentage || product.tax || 0),
          tax_amount: 0,
          total_price: 0,
          unit: product.unit || "",
          isManual: false,
        });
        items = [...items, newItem];
        form.setFieldsValue({ items });
        updateSummary(items, items.length - 1);
      }

      setPreview((p) => ({ ...p, items: form.getFieldValue("items") || [] }));
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
    updateSummary(items, -1);
  };

  const removeItem = (index) => {
    const items = (form.getFieldValue("items") || []).slice();
    items.splice(index, 1);
    form.setFieldsValue({ items });
    setPreview((p) => ({ ...p, items }));
    updateSummary(items, -1);
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
    updateSummary(items, -1);
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

  /**
   * Product fetching (robust): tries common shapes so productService implementations don't break
   * query: search string
   */
  const fetchProducts = async (query = "", limit = 50) => {
    setProductsLoading(true);
    try {
      const q = encodeURIComponent(query || "");
      const queryString = `?search=${q}&limit=${limit}`;

      const tryCalls = [
        // 1) productService.getAll(queryString)
        async () => {
          if (typeof productService.getAll === "function") {
            return await productService.getAll(queryString);
          }
          throw new Error("getAll(string) not available");
        },
        // 2) productService.get(`/product${queryString}`)
        async () => {
          if (typeof productService.get === "function") {
            return await productService.get(`/product${queryString}`);
          }
          throw new Error("get not available");
        },
        // 3) productService.getAll({ params: { search, limit } })
        async () => {
          if (typeof productService.getAll === "function") {
            return await productService.getAll({ search: query || undefined, limit });
          }
          throw new Error("getAll(params) not available");
        },
        // 4) productService.search(query, opts)
        async () => {
          if (query && typeof productService.search === "function") {
            return await productService.search(query, { limit });
          }
          throw new Error("search not available");
        },
        // 5) fallback: getAll() and client-side filter
        async () => {
          if (typeof productService.getAll === "function") {
            return await productService.getAll();
          }
          throw new Error("final fallback failed");
        },
      ];

      let response = null;
      let success = false;
      // run calls sequentially until one returns
      for (const call of tryCalls) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const res = await call();
          if (res) {
            response = res;
            success = true;
            break;
          }
        } catch (err) {
          // ignore and try next
        }
      }

      if (!success || !response) {
        setProducts([]);
        return;
      }

      let list = response?.data ?? response;
      if (!Array.isArray(list)) {
        if (list && Array.isArray(list.items)) list = list.items;
        else list = [];
      }

      if (!query) setProducts(list.slice(0, 10));
      else setProducts(list.slice(0, limit));
    } catch (err) {
      console.error("Failed to fetch products:", err);
      message.error("Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  /** Add a new product-selection row (select from dropdown) */
  const handleAddProduct = () => {
    const items = form.getFieldValue("items") || [];
    items.push({
      product_id: null,
      product_code: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      unit: "",
      discount_amount: 0,
      tax_percentage: 0,
      tax_amount: 0,
      total_price: 0,
      expiry_date: null,
      isManual: false,
    });
    form.setFieldsValue({ items });
    updateSummary(items, items.length - 1);
  };

  /** Add manual product row */
  const handleAddManualProduct = () => {
    const items = form.getFieldValue("items") || [];
    items.push({
      product_id: null,
      product_code: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      unit: "",
      discount_amount: 0,
      tax_percentage: 0,
      tax_amount: 0,
      total_price: 0,
      expiry_date: null,
      isManual: true,
    });
    form.setFieldsValue({ items });
    updateSummary(items, items.length - 1);
  };

  /** When the user types in the Select, debounce and call backend */
  const handleSearch = (val) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts(val.trim());
    }, 300);
  };

  /** When a product is selected from dropdown for a specific row */
  const handleProductSelect = (productId, rowIndex) => {
    const items = form.getFieldValue("items") || [];
    const p = products.find((x) => String(x.id) === String(productId));
    if (!p) {
      (async () => {
        try {
          if (typeof productService.getById === "function") {
            const res = await productService.getById(productId);
            const prod = res?.data || res;
            if (prod) {
              items[rowIndex] = {
                ...items[rowIndex],
                product_id: prod.id,
                product_code: prod.product_code || "",
                product_name: prod.product_name || "",
                unit_price: Number(prod.selling_price || prod.purchase_price) || 0,
                unit: prod.unit || "",
                tax_percentage: Number(prod.tax_percentage || prod.tax || 0),
                isManual: false,
              };
              items[rowIndex] = updateItemCalculations(items[rowIndex]);
              form.setFieldsValue({ items });
              updateSummary(items, rowIndex);
              setPreview((p) => ({ ...p, items }));
            }
          }
        } catch (err) {
          console.error("Failed to load product by id:", err);
          message.error("Failed to load selected product");
        }
      })();
      return;
    }

    items[rowIndex] = {
      ...items[rowIndex],
      product_id: p.id,
      product_code: p.product_code || "",
      product_name: p.product_name || "",
      unit_price: Number(p.selling_price || p.purchase_price) || 0,
      unit: p.unit || "",
      tax_percentage: Number(p.tax_percentage || p.tax || 0),
      isManual: false,
    };
    items[rowIndex] = updateItemCalculations(items[rowIndex]);
    form.setFieldsValue({ items });
    updateSummary(items, rowIndex);
    setPreview((p) => ({ ...p, items }));
  };

  // utility to compute summary from items array and optionally set lastAddedIndex
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
      items: items || [],
      count: (items || []).length,
      qty,
      value,
      lastAddedIndex,
    });
  };

  // table columns (editable with Form.Item like InwardForm)
  const columns = [
    // {
    //   title: "Product Code",
    //   dataIndex: "product_code",
    //   key: "product_code",
    //   width: 100,
    //   render: (_, __, index) => (
    //     <Form.Item name={[index, "product_code"]} style={{ margin: 0 }}>
    //       <Input disabled />
    //     </Form.Item>
    //   ),
    // },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      width: 360,
      render: (_, record, index) => (
        <Form.Item
          name={[index, "product_name"]}
          rules={[{ required: true, message: "Enter/select product name" }]}
          style={{ margin: 0 }}
        >
          {record?.isManual ? (
            <Input placeholder="Enter product name" onChange={(e) => handleItemChange(index, "product_name", e.target.value)} />
          ) : (
            <Select
              showSearch
              showArrow
              placeholder="Search product by name or code"
              filterOption={false}
              notFoundContent={productsLoading ? <Spin size="small" /> : null}
              onSearch={handleSearch}
              onFocus={() => {
                if (!products || products.length === 0) fetchProducts("");
              }}
              onChange={(productId) => handleProductSelect(productId, index)}
              style={{ width: "100%" }}
            >
              {products.map((p) => (
                <Option key={String(p.id)} value={String(p.id)} data-code={p.product_code}>
                  {p.product_name} {p.product_code ? ` — (${p.product_code})` : ""}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
      ),
    },
    {
      title: "Qty",
      key: "qty",
      width: 80,
      render: (_, record, index) => (
        <Form.Item
          name={[index, "quantity"]}
          rules={[{ required: true, message: "Enter qty" }]}
          style={{ margin: 0 }}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            onChange={(v) => handleItemChange(index, "quantity", v || 0)}
          />
        </Form.Item>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      key: "unit_price",
      width: 100,
      render: (_, record, index) => (
        <Form.Item
          name={[index, "unit_price"]}
          rules={[{ required: true, message: "Enter price" }]}
          style={{ margin: 0 }}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            onChange={(v) => handleItemChange(index, "unit_price", v || 0)}
            formatter={(val) => (val === undefined || val === null ? "" : `₹${Number(val).toFixed(2)}`)}
            parser={(val) => String(val).replace(/[₹,]/g, "")}
          />
        </Form.Item>
      ),
    },
    {
      title: "Discount",
      key: "disc",
      width: 60,
      render: (_, record, index) => (
        <Form.Item name={[index, "discount_amount"]} style={{ margin: 0 }}>
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            onChange={(v) => handleItemChange(index, "discount_amount", v || 0)}
          />
        </Form.Item>
      ),
    },
    {
      title: "Tax",
      dataIndex: "tax_amount",
      key: "tax",
      width: 80,
      render: (_, record, index) => (
        <Form.Item name={[index, "tax_amount"]} style={{ margin: 0 }}>
          <InputNumber value={record.tax_amount} disabled style={{ width: "100%" }} formatter={(v)=>`₹${Number(v||0).toFixed(2)}`} />
        </Form.Item>
      ),
    },
    {
      title: "Total",
      dataIndex: "total_price",
      key: "total",
      width: 140,
      render: (_, record, index) => (
        <Form.Item name={[index, "total_price"]} style={{ margin: 0 }}>
          <InputNumber value={record.total_price} disabled style={{ width: "100%" }} formatter={(v)=>`₹${Number(v||0).toFixed(2)}`} />
        </Form.Item>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 40,
      render: (_, __, idx) => (
        <Button  style={{border:"none"}} onClick={() => removeItem(idx)}>
           <Trash size={14} style={{color:"red"}} />
        </Button>
      ),
    },
  ];

  // preview columns (read-only)
  const previewColumns = [
    { title: "#", dataIndex: "_idx", key: "idx", render: (_, __, idx) => idx + 1 },
    { title: "Product", dataIndex: "product_name", key: "pname" },
    { title: "Qty", dataIndex: "quantity", key: "pq" },
    { title: "Unit", dataIndex: "unit_price", key: "pu", render: (v) => `₹${(Number(v) || 0).toFixed(2)}` },
    { title: "Tax", dataIndex: "tax_amount", key: "pt", render: (v) => `₹${(Number(v) || 0).toFixed(2)}` },
    { title: "Total", dataIndex: "total_price", key: "ptotal", render: (v) => `₹${(Number(v) || 0).toFixed(2)}` },
  ];

  const styles = {
    page: { background: "#f1f6fb", minHeight: "100vh", padding: 12 },
    container: { maxWidth: 1100, margin: "0 auto" },
    mainGrid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 },
    leftCard: { background: "#fff", borderRadius: 8, padding: 12 },
    rightCard: { background: "#fff", borderRadius: 8, padding: 12, height: "fit-content", position: "sticky", top: 24 },
    sectionTitle: { color: "#0b75ff", fontWeight: 600 },
  };

  const summaryCalc = calculateSummaryFromItems(preview.items || []);

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

                {/* Add product buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <Button type="dashed" onClick={handleAddProduct}>
                    + Add Product
                  </Button>
                </div>

                {/* Items table (editable) */}
                <Form.List name="items">
                  {(fields, { remove }) => {
                    const items = form.getFieldValue("items") || [];
                    // Table data source should include keys
                    const dataSource = (items || []).map((it, idx) => ({ ...it, key: idx }));
                    return (
                      <>
                        <Table dataSource={dataSource} columns={columns} pagination={false} rowKey={(r, idx) => idx} size="small" style={{ marginBottom: 8 }} />

                        <div style={{ display: "flex", justifyContent: "right", alignItems: "right", marginTop: 10 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <div style={{ color: "#374151" }}>Subtotal</div>
                              <div>₹{summaryCalc.subtotal.toFixed(2)}</div>
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
                      <div>₹{summaryCalc.subtotal.toFixed(2)}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>Tax</div>
                      <div>₹{summaryCalc.totalTax.toFixed(2)}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>Discount</div>
                      <div>₹{summaryCalc.totalDiscount.toFixed(2)}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 10, marginTop: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>Total Amount</div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>₹{summaryCalc.grandTotal.toFixed(2)}</div>
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

                <Divider />

                {/* Right column summary card (recent items) */}
                <Card size="small" bordered={false} style={{ marginTop: 12 }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text type="secondary">Items</Text>
                      <div style={{ marginTop: 4 }}>
                        <Title level={3} style={{ margin: 0 }}>
                          {summary.count}
                        </Title>
                      </div>
                    </Col>
                    <Col style={{ textAlign: "right" }}>
                      <Text type="secondary" style={{ display: "block" }}>
                        Total Qty
                      </Text>
                      <Text strong>{summary.qty}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ display: "block" }}>
                          Total Value
                        </Text>
                        <Text strong>₹{summary.value.toFixed(2)}</Text>
                      </div>
                    </Col>
                  </Row>

                  <Divider />

                  <Text type="secondary">Recent items</Text>
                  <div style={{ marginTop: 8 }}>
                    <List
                      size="small"
                      dataSource={summary.items.slice().reverse().slice(0, 6)} // show up to 6 recent
                      renderItem={(item, idx) => {
                        const originalIndex = summary.items.length - 1 - idx;
                        const isLast = originalIndex === summary.lastAddedIndex;
                        return (
                          <List.Item>
                            <List.Item.Meta
                              title={
                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                  <div>
                                    {isLast ? <Badge status="success" text={item.product_name || item.product_code} /> : (item.product_name || item.product_code)}
                                  </div>
                                  <div style={{ minWidth: 110, textAlign: "right" }}>
                                    <Text>{(item.quantity || 0)} × {typeof item.unit_price === "number" ? `₹${item.unit_price.toFixed(2)}` : item.unit_price}</Text>
                                  </div>
                                </div>
                              }
                              description={item.product_code ? <Text type="secondary">{item.product_code}</Text> : null}
                            />
                          </List.Item>
                        );
                      }}
                    />
                    {summary.items.length === 0 && <Text type="secondary">No items added yet</Text>}
                  </div>
                </Card>
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
