// src/inward/pages/InwardForm.jsx
import { useEffect, useState, useRef } from "react";
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
  Card,
  Row,
  Col,
  Divider,
  Space,
  Typography,
  List,
  Badge,
} from "antd";
import inwardService from "../service/inwardService";
import orderService from "../../components/layout/SideBarPages/services/orderService";
import vendorService from "../../components/layout/SideBarPages/services/vendorService";
import productService from "../../Product/services/productService";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const InwardForm = () => {
  const { id } = useParams(); // future edit support
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // summary now stores items array plus totals and lastAdded index
  const [summary, setSummary] = useState({
    items: [],
    count: 0,
    qty: 0,
    value: 0,
    lastAddedIndex: -1,
  });

  // purchase orders list for selector
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poLoading, setPoLoading] = useState(false);

  // vendors for vendor select
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  // products for dropdown search
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const searchTimeout = useRef(null);

  /** 🔹 Fetch purchase orders on mount (for selector) */
  useEffect(() => {
    const fetchPOs = async () => {
      setPoLoading(true);
      try {
        const res = await orderService.getAll({ limit: 100, page: 1 });
        const data = res?.data ?? res;
        setPurchaseOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load purchase orders:", err);
        setPurchaseOrders([]);
      } finally {
        setPoLoading(false);
      }
    };

    fetchPOs();
  }, []);

  /** 🔹 Fetch vendors for vendor select */
  useEffect(() => {
    const fetchVendors = async () => {
      setVendorsLoading(true);
      try {
        const res = await vendorService.getAll();
        const data = res?.data ?? res;
        setVendors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load vendors:", err);
        setVendors([]);
      } finally {
        setVendorsLoading(false);
      }
    };
    fetchVendors();
  }, []);

  /**
   * Fetch products from backend using query-string style:
   *    GET /product?search=value&limit=50
   * Attempts a few call shapes so it works with common wrappers.
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
        // 4) productService.getAll({ search, limit })
        async () => {
          if (typeof productService.getAll === "function") {
            return await productService.getAll({ search: query || undefined, limit });
          }
          throw new Error("getAll({search}) not available");
        },
        // 5) productService.search(query, opts)
        async () => {
          if (query && typeof productService.search === "function") {
            return await productService.search(query, { limit });
          }
          throw new Error("search not available");
        },
        // 6) fallback: getAll() and client-side filter
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

  /** 🔹 Add product by code (keeps original behavior for scanner) */
  const handleProductCode = async (e) => {
    const code = (e?.target?.value || "").trim();
    if (!code) return;
    e.target.value = ""; // reset input

    try {
      const product = await productService.getByCode(code);

      if (!product) {
        message.error("No product found with that code");
        return;
      }

      let items = form.getFieldValue("items") || [];

      // check if product already exists
      const existingIndex = items.findIndex(
        (item) => item.product_code === product.product_code
      );

      if (existingIndex >= 0) {
        // increase quantity
        items[existingIndex].quantity += 1;
        form.setFieldsValue({ items });
        // update summary: last added is that index
        updateSummary(items, existingIndex);
      } else {
        // add new row
        items.push({
          product_id: product.id,
          product_code: product.product_code,
          product_name: product.product_name,
          quantity: 1,
          unit_price: Number(product.purchase_price) || 0,
          unit: product.unit || "",
          expiry_date: null,
          isManual: false,
        });
        form.setFieldsValue({ items });
        // update summary: last added is last index
        updateSummary(items, items.length - 1);
      }
    } catch (err) {
      console.error("Fetch product error:", err);
      message.error("Failed to fetch product");
    }
  };

  /** 🔹 When a purchase order is selected: fetch its details and populate form */
  const handleSelectPO = async (poId) => {
    if (!poId) {
      // clear supplier, vendor and items
      form.setFieldsValue({
        supplier_name: "",
        items: [],
        order_id: undefined,
        vendor_id: undefined,
      });
      updateSummary([], -1);
      return;
    }

    setLoading(true);
    try {
      const res = await orderService.getById(poId);
      const orderData = res?.data ?? res;

      if (!orderData) {
        message.error("Selected PO not found");
        setLoading(false);
        return;
      }

      const mappedItems = (orderData.items || []).map((it) => ({
        product_id: it.product_id,
        product_code: it.product?.product_code || "",
        product_name: it.product?.product_name || "",
        quantity: Number(it.pending_quantity ?? it.quantity ?? 0),
        unit_price: Number(it.unit_price ?? it.product?.purchase_price ?? 0),
        unit: it.product?.unit || "",
        expiry_date: null,
        isManual: false,
      }));

      const supplierName = orderData.vendor?.name || orderData.vendor_id || "";
      const receivedDate = orderData.order_date ? dayjs(orderData.order_date) : null;

      form.setFieldsValue({
        supplier_name: supplierName,
        received_date: receivedDate,
        items: mappedItems,
        order_id: orderData.id,
        vendor_id: orderData.vendor?.id ?? orderData.vendor_id ?? undefined,
      });

      updateSummary(mappedItems, mappedItems.length - 1);
    } catch (err) {
      console.error("Failed to fetch PO details:", err);
      message.error("Failed to load purchase order details");
    } finally {
      setLoading(false);
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
                unit_price: Number(prod.purchase_price) || 0,
                unit: prod.unit || "",
                isManual: false,
              };
              form.setFieldsValue({ items });
              updateSummary(items, rowIndex);
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
      unit_price: Number(p.purchase_price) || 0,
      unit: p.unit || "",
      isManual: false,
    };
    form.setFieldsValue({ items });
    updateSummary(items, rowIndex);
  };

  /** Submit Handler (send payload matching DTO: vendor_id + inward_items) */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const vendorId = values.vendor_id;
      if (!vendorId) {
        message.error(
          "Unable to save: vendor is required. Select a Purchase Order or select a Vendor."
        );
        setLoading(false);
        return;
      }

      const items = (values.items || []).map((it) => {
        const mapped = {
          product_id: it.product_id,
          quantity: Number(it.quantity || 0),
          unit_price: Number(it.unit_price || 0),
        };

        if (it.unit) mapped.unit = String(it.unit);
        if (it.total_price !== undefined) mapped.total_price = Number(it.total_price);
        if (it.batch_number) mapped.batch_number = String(it.batch_number);
        if (it.unused_quantity !== undefined) mapped.unused_quantity = Number(it.unused_quantity);
        if (it.excess_quantity !== undefined) mapped.excess_quantity = Number(it.excess_quantity);

        if (it.expiry_date) {
          try {
            mapped.expiry_date = typeof it.expiry_date === "string"
              ? it.expiry_date
              : it.expiry_date.toISOString();
          } catch (e) {
            // ignore invalid expiry_date
          }
        }

        return mapped;
      });

      const payload = {
        order_id: values.order_id || undefined,
        vendor_id: vendorId,
        supplier_name: values.supplier_name || undefined,
        received_date: values.received_date
          ? (typeof values.received_date === "string" ? values.received_date : values.received_date.toISOString())
          : undefined,
        supplier_invoice: values.supplier_invoice || undefined,
        total_amount: values.total_amount !== undefined ? Number(values.total_amount) : undefined,
        total_quantity: values.total_quantity !== undefined ? Number(values.total_quantity) : undefined,
        status: values.status || "pending",
        items,
      };

      await inwardService.create(payload);
      message.success("Inward entry created successfully");
      navigate("/inward/list");
    } catch (err) {
      console.error("Save error:", err);
      if (err?.response?.data) {
        console.error("Server response:", err.response.data);
        const serverMsg =
          err.response.data.message ||
          err.response.data.error ||
          (typeof err.response.data === "string" ? err.response.data : null);
        message.error(serverMsg || "Failed to save inward entry");
      } else {
        message.error("Failed to save inward entry");
      }
    } finally {
      setLoading(false);
    }
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

  // Called whenever any form value changes — keeps right column live
  const onValuesChange = (_, allValues) => {
    const items = allValues.items || [];
    updateSummary(items, -1);
  };

  // initial summary load
  useEffect(() => {
    const items = form.getFieldValue("items") || [];
    updateSummary(items, -1);
    // cleanup search timeout on unmount
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      title: "Product Code",
      dataIndex: "product_code",
      key: "product_code",
      width: 140,
      render: (_, __, index) => (
        <Form.Item name={[index, "product_code"]} style={{ margin: 0 }}>
          <Input disabled className="w-full" />
        </Form.Item>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      width: 400,
      render: (_, record, index) => (
        <Form.Item
          name={[index, "product_name"]}
          rules={[{ required: true, message: "Enter/select product name" }]}
          style={{ margin: 0 }}
        >
          {record?.isManual ? (
            <Input placeholder="Enter product name" />
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
      title: "Quantity",
      key: "quantity",
      width: 120,
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
      title: "Unit Price",
      key: "unit_price",
      width: 140,
      render: (_, record, index) => (
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
      render: (_, record, index) => (
        <Form.Item name={[index, "unit"]} style={{ margin: 0 }}>
          <Input />
        </Form.Item>
      ),
    },
    {
      title: "Expiry Date",
      key: "expiry_date",
      width: 160,
      render: (_, record, index) => (
        <Form.Item name={[index, "expiry_date"]} style={{ margin: 0 }}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, __, index) => (
        <Form.Item shouldUpdate style={{ margin: 0 }}>
          {() => (
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
          )}
        </Form.Item>
      ),
    },
  ];

  return (
    <div style={{ padding: 5 }}>
      <Row gutter={16} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            {id ? "Edit Inward" : "Add Inward"}
          </Title>
          <Text type="secondary">Create inward entries quickly using product codes</Text>
        </Col>
        <Col>
          <Space>
            <Button onClick={() => navigate("/inward/list")}>Back to list</Button>
          </Space>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Row gutter={16}>
          {/* Left: form + table */}
          <Col xs={24} lg={16}>
            <Card bordered bodyStyle={{ padding: 16 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ status: "pending", items: [] }}
                onValuesChange={onValuesChange}
              >
                <Row gutter={12}>
                  {/* Purchase Order selector */}
                  <Col xs={24} sm={12}>
                    <Form.Item label="Purchase Order" name="order_id">
                      <Select
                        allowClear
                        placeholder="Select purchase order (optional)"
                        loading={poLoading}
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => handleSelectPO(value)}
                        filterOption={(input, option) =>
                          (option?.children ?? "").toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {purchaseOrders.map((po) => (
                          <Option key={po.id} value={po.id}>
                            {po.po_no} {po.vendor?.name ? `— ${po.vendor.name}` : ""}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Vendor select */}
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Vendor"
                      name="vendor_id"
                      rules={[
                        {
                          validator: (_, value) => {
                            const orderId = form.getFieldValue("order_id");
                            if (!orderId && !value) {
                              return Promise.reject(
                                new Error("Please select a Vendor or select a Purchase Order")
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select vendor (or choose PO to auto-fill)"
                        loading={vendorsLoading}
                        showSearch
                        optionFilterProp="children"
                        allowClear
                      >
                        {vendors.map((v) => (
                          <Option key={v.id} value={v.id}>
                            {v.name || v.vendor_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item label="Supplier Name" name="supplier_name">
                      <Input placeholder="Enter supplier name (optional if vendor selected)" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Received Date"
                      name="received_date"
                      rules={[{ required: true, message: "Please select date" }]}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item label="Status" name="status">
                      <Select>
                        <Option value="pending">Pending</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="cancelled">Cancelled</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Add product buttons */}
                  <Col xs={24}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <Button type="dashed" onClick={handleAddProduct}>
                        + Add Product
                      </Button>
                      <Button type="dashed" onClick={handleAddManualProduct}>
                        + Add Product Manually
                      </Button>
                    </div>
                  </Col>

                  <Col xs={24}>
                    <Divider style={{ margin: "8px 0 16px 0" }} />
                    <Form.List name="items">
                      {(fields, { remove }) => {
                        const items = form.getFieldValue("items") || [];
                        // Table expects dataSource rows; ensure each row has expected fields
                        const dataSource = (items || []).map((it, idx) => ({
                          ...it,
                          key: idx,
                        }));
                        return (
                          <Table
                            dataSource={dataSource}
                            columns={columns}
                            pagination={false}
                            rowKey={(record) => record.key}
                            size="small"
                          />
                        );
                      }}
                    </Form.List>
                  </Col>

                  <Col xs={24} style={{ marginTop: 16 }}>
                    <Space>
                      <Button style={{ backgroundColor: "#506ee4" }} type="primary" htmlType="submit" loading={loading}>
                        {id ? "Update Inward" : "Add Inward"}
                      </Button>
                      <Button onClick={() => navigate("/inward/list")}>Cancel</Button>
                    </Space>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* Right: dynamic visual summary */}
          <Col xs={24} lg={8}>
            <Card bordered size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text type="secondary">Items</Text>
                  <div style={{ marginTop: 8 }}>
                    <Title level={3} style={{ margin: 0 }}>
                      {summary.count}
                    </Title>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text type="secondary">Total Qty</Text>
                  <div>
                    <Text strong>{summary.qty}</Text>
                  </div>
                  <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                    Total Value
                  </Text>
                  <div>
                    <Text strong>{summary.value.toFixed(2)}</Text>
                  </div>
                </div>
              </div>

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
                                <Text>{(item.quantity || 0)} × {typeof item.unit_price === "number" ? item.unit_price.toFixed(2) : item.unit_price}</Text>
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

            <Card bordered size="small">
              <Text type="secondary">Guidance</Text>
              <div style={{ marginTop: 8 }}>
                <Text>
                  Use the scan field to add products quickly or click “+ Add Product” to search and select items from catalog.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default InwardForm;
