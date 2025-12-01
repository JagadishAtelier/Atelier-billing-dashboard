// AddReturn.jsx
import { useEffect, useRef, useState } from "react";
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
  Select,
  Spin,
  Card,
  List,
  Badge,
} from "antd";
import vendorService from "../components/layout/SideBarPages/services/vendorService";
import productService from "../Product/services/productService";
import returnService from "./service/returnService";

const { Title, Text } = Typography;
const { Option } = Select;

function AddReturn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // products for dropdown search
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const searchTimeout = useRef(null);

  // vendors
  const [vendors, setVendors] = useState([]);

  // enhanced summary storing items + totals + lastAddedIndex
  const [summary, setSummary] = useState({
    items: [],
    count: 0,
    qty: 0,
    lastAddedIndex: -1,
  });

  /** Fetch vendors */
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await vendorService.getAll();
        setVendors(res?.data ?? res ?? []);
      } catch (err) {
        console.error("Vendor load error:", err);
        message.error("Failed to load vendors");
        setVendors([]);
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
        const data = res?.data ?? res;
        if (data) {
          const mappedItems = (data.items || []).map((it) => ({
            product_id: it.product_id,
            product_code: it.product?.product_code || it.product_code || "",
            product_name: it.product?.product_name || it.product_name || "",
            quantity: Number(it.quantity || 0),
            unit_price: Number(it.unit_price ?? it.product?.purchase_price ?? 0),
            unit: it.unit || it.product?.unit || "",
            isManual: false,
          }));

          form.setFieldsValue({
            vendor_id: data.vendor_id,
            reason: data.reason,
            status: data.status || "pending",
            items: mappedItems,
          });

          updateSummary(mappedItems, mappedItems.length - 1);
        }
      } catch (err) {
        console.error("Failed to fetch return:", err);
        message.error("Failed to load return details");
      }
    };

    fetchReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Fetch products from backend using robust attempt list (works with common wrappers)
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
          // ignore and continue
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

  /** Add product by code (scanner or enter) */
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
      const existIndex = items.findIndex(
        (it) => it.product_code === product.product_code
      );

      if (existIndex >= 0) {
        items[existIndex].quantity = Number(items[existIndex].quantity || 0) + 1;
        form.setFieldsValue({ items });
        updateSummary(items, existIndex);
      } else {
        const newItem = {
          product_id: product.id,
          product_code: product.product_code,
          product_name: product.product_name,
          quantity: 1,
          unit_price: Number(product.purchase_price) || 0,
          unit: product.unit || "",
          isManual: false,
        };
        items.push(newItem);
        form.setFieldsValue({ items });
        updateSummary(items, items.length - 1);
      }
    } catch (err) {
      console.error("Fetch product error:", err);
      message.error("Failed to fetch product");
    }
  };

  /** Add an empty product row with Select (to search/select) */
  const handleAddProduct = () => {
    const items = form.getFieldValue("items") || [];
    items.push({
      product_id: null,
      product_code: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      unit: "",
      isManual: false,
    });
    form.setFieldsValue({ items });
    updateSummary(items, items.length - 1);
  };

  /** Add manual product row (free text) */
  const handleAddManualProduct = () => {
    const items = form.getFieldValue("items") || [];
    items.push({
      product_id: null,
      product_code: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      unit: "",
      isManual: true,
    });
    form.setFieldsValue({ items });
    updateSummary(items, items.length - 1);
  };

  /** When the user types in the Select search input, debounce and call backend */
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

  // utility to compute summary from items array and optionally set lastAddedIndex
  const updateSummary = (items = [], lastAddedIndex = -1) => {
    let qty = 0;
    (items || []).forEach((it) => {
      qty += Number(it.quantity || 0);
    });
    setSummary({
      items: items || [],
      count: (items || []).length,
      qty,
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
      width: 160,
      render: (_, record, index) => (
        <Form.Item name={[index, "product_code"]} style={{ margin: 0 }}>
          <Input disabled className="w-full" />
        </Form.Item>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      width: 420,
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
      dataIndex: "quantity",
      key: "quantity",
      width: 140,
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            {id ? "Edit Return" : "Add Return"}
          </Title>
          <Text type="secondary">Manage product returns for vendors easily</Text>
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

      <Row gutter={16}>
        {/* Left: form + table */}
        <Col xs={24} lg={16}>
          <Card bordered bodyStyle={{ padding: 16 }}>
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

                

                {/* Add product buttons */}
                <Col xs={24}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <Button type="dashed" onClick={handleAddProduct}>
                      + Add Product
                    </Button>
                  </div>
                </Col>

                {/* Items Table */}
                <Col xs={24}>
                  <Divider style={{ margin: "8px 0 16px 0" }} />
                  <Form.List name="items">
                    {(fields, { remove }) => {
                      const items = form.getFieldValue("items") || [];
                      const dataSource = (items || []).map((it, idx) => ({ ...it, key: idx }));
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
              </div>
            </div>

            <Divider />

            <Text type="secondary">Recent items</Text>
            <div style={{ marginTop: 8 }}>
              <List
                size="small"
                dataSource={summary.items.slice().reverse().slice(0, 6)}
                renderItem={(item, idx) => {
                  const originalIndex = summary.items.length - 1 - idx;
                  const isLast = originalIndex === summary.lastAddedIndex;
                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                            <div>
                              {isLast ? (
                                <Badge status="success" text={item.product_name || item.product_code} />
                              ) : (
                                item.product_name || item.product_code
                              )}
                            </div>
                            <div style={{ minWidth: 110, textAlign: "right" }}>
                              <Text>{(item.quantity || 0)}</Text>
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
    </div>
  );
}

export default AddReturn;
