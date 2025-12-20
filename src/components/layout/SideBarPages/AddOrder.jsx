// AddOrder.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  InputNumber,
  Button,
  message,
  Table,
  Divider,
  Space,
  Row,
  Col,
  Typography,
  Select,
  Spin,
} from "antd";
import vendorService from "./services/vendorService";
import productService from "../../../Product/services/productService";
import orderService from "./services/orderService";
import branchService from "./services/branchService"; // <-- ADDED
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

function AddOrder() {
  const { id } = useParams(); // edit mode
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]); // products shown in dropdown
  const [productsLoading, setProductsLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // NEW: branches state
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [summary, setSummary] = useState({
    items: [],
    count: 0,
    qty: 0,
    value: 0,
    lastAddedIndex: -1,
  });

  const searchTimeout = useRef(null);

  /**
   * Fetch products from backend using query-string style:
   *    GET /product?search=value&limit=50
   *
   * This function attempts several call shapes:
   *  - productService.getAll('?search=...&limit=...')
   *  - productService.get('/product?search=...&limit=...')
   *  - productService.getAll({ params: { search, limit } })  (fallback)
   *  - productService.search(query, { limit })                (fallback)
   *  - getAll() + client-side filter (final fallback)
   */

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role && role.toLowerCase() === "super admin") {
      setIsSuperAdmin(true);
    }
  }, []);

  // Fetch branches when user is super admin
  useEffect(() => {
    if (!isSuperAdmin) return;

    let mounted = true;
    const fetchBranches = async () => {
      setBranchesLoading(true);
      try {
        // try to get many branches (adjust params if backend differs)
        const resp = await branchService.getAll({ limit: 1000 });

        // normalize
        let list = Array.isArray(resp) ? resp : resp?.data ?? resp?.results ?? resp?.items ?? [];
        if (!Array.isArray(list)) list = [];

        if (mounted) setBranches(list);
      } catch (err) {
        console.error("Failed to load branches:", err);
        message.error("Failed to load branch list");
        if (mounted) setBranches([]);
      } finally {
        if (mounted) setBranchesLoading(false);
      }
    };

    fetchBranches();
    return () => {
      mounted = false;
    };
  }, [isSuperAdmin]);

  const fetchProducts = async (query = "", limit = 50) => {
    setProductsLoading(true);
    try {
      const q = encodeURIComponent(query || "");
      const queryString = `?search=${q}&limit=${limit}`;

      // Try direct string argument (some services accept the path/query as string)
      const tryCalls = [
        // 1) common shape: productService.getAll(queryString)
        async () => {
          if (typeof productService.getAll === "function") {
            return await productService.getAll(queryString);
          }
          throw new Error("getAll(string) not available");
        },
        // 2) try productService.get(`/product${queryString}`)
        async () => {
          if (typeof productService.get === "function") {
            return await productService.get(`/product${queryString}`);
          }
          throw new Error("get not available");
        },
        // 3) try getAll with params object
        async () => {
          if (typeof productService.getAll === "function") {
            return await productService.getAll({ search: query || undefined, limit });
          }
          throw new Error("getAll(params) not available");
        },
        // 4) try alternate param signature
        async () => {
          if (typeof productService.getAll === "function") {
            return await productService.getAll({ search: query || undefined, limit });
          }
          throw new Error("getAll({search}) not available");
        },
        // 5) try productService.search
        async () => {
          if (query && typeof productService.search === "function") {
            return await productService.search(query, { limit });
          }
          throw new Error("search not available");
        },
        // 6) fallback to getAll() and client-side filter
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
          // ignore and try next
        }
      }

      if (!success || !response) {
        // nothing worked -> empty products
        setProducts([]);
        return;
      }

      // normalize list from response
      let list = response?.data ?? response;
      if (!Array.isArray(list)) {
        // if the API returned an object like { items: [...] }
        if (list && Array.isArray(list.items)) list = list.items;
        else list = [];
      }

      // If no query, return only first 10 to match earlier behaviour
      if (!query) {
        setProducts(list.slice(0, 10));
      } else {
        setProducts(list.slice(0, limit));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      message.error("Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    // initial data load: vendors and first 10 products
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
    // fetch first 10 products (no search)
    fetchProducts("");
    // cleanup debounced timer on unmount
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Fetch order data if editing */
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await orderService.getById(id);
        const orderData = res?.data || res;

        if (!orderData) return;

        const items = (orderData.items || []).map((it) => ({
          id: it.id,
          product_id: it.product_id,
          product_code: it.product?.product_code || "",
          product_name: it.product?.product_name || "",
          quantity: Number(it.quantity || 0),
          unit_price: Number(it.unit_price || 0),
          unit: it.product?.unit || "",
          isManual: false,
        }));

        // If branch id exists in order and branches loaded, set field
        form.setFieldsValue({
          vendor_id: orderData.vendor_id,
          order_date: orderData.order_date
            ? dayjs(orderData.order_date).format("YYYY-MM-DD")
            : null,
          status: orderData.status || "",
          items,
          branch_id: orderData.branch_id || form.getFieldValue("branch_id"),
        });

        updateSummary(items, -1);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        message.error("Failed to load order data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      isManual: true, // 🔹 flag to mark manually added item
    });
    form.setFieldsValue({ items });
    updateSummary(items, items.length - 1);
  };

  /** When the user types in the Select, debounce and call backend */
  const handleSearch = (val) => {
    // debounce
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts(val.trim());
    }, 300);
  };

  /** When a product is selected from dropdown for a specific row */
  const handleProductSelect = (productId, index) => {
    const items = form.getFieldValue("items") || [];
    const p = products.find((x) => String(x.id) === String(productId));
    if (!p) {
      // if not in current list, try getById
      (async () => {
        try {
          if (typeof productService.getById === "function") {
            const res = await productService.getById(productId);
            const prod = res?.data || res;
            if (prod) {
              items[index] = {
                ...items[index],
                product_id: prod.id,
                product_code: prod.product_code || "",
                product_name: prod.product_name || "",
                unit_price: Number(prod.purchase_price) || 0,
                unit: prod.unit || "",
                isManual: false,
              };
              form.setFieldsValue({ items });
              updateSummary(items, index);
            }
          }
        } catch (err) {
          console.error("Failed to load product by id:", err);
          message.error("Failed to load selected product");
        }
      })();
      return;
    }

    items[index] = {
      ...items[index],
      product_id: p.id,
      product_code: p.product_code || "",
      product_name: p.product_name || "",
      unit_price: Number(p.purchase_price) || 0,
      unit: p.unit || "",
      isManual: false,
    };
    form.setFieldsValue({ items });
    updateSummary(items, index);
  };

  /** Submit order */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let formattedItems = [];

      for (const item of values.items || []) {
        // If product added manually, create it in DB first
        let productId = item.product_id;

        if (item.isManual) {
          if (!item.product_name || !item.unit_price || !item.unit) {
            message.error("Please fill all product details for manual items");
            setLoading(false);
            return;
          }

          const newProduct = await productService.create({
            product_name: item.product_name,
            purchase_price: item.unit_price,
            unit: item.unit,
          });

          productId = newProduct?.data?.id || newProduct?.id;
        }

        formattedItems.push({
          product_id: productId,
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unit_price || 0),
        });
      }

      const payload = {
        vendor_id: values.vendor_id,
        order_date: values.order_date ? dayjs(values.order_date).toDate() : new Date(),
        status: id ? values.status : "pending",
        items: formattedItems,
        // include branch_id if present (super admin selection)
        ...(values.branch_id ? { branch_id: values.branch_id } : {}),
      };

      if (id) {
        await orderService.update(id, payload);
        message.success("Order updated successfully");
      } else {
        await orderService.create(payload);
        message.success("Order created successfully");
      }

      navigate("/order");
    } catch (err) {
      console.error("Save error:", err);
      message.error("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  /** Update summary */
  const updateSummary = (items = [], lastAddedIndex = -1) => {
    let qty = 0;
    let value = 0;
    items.forEach((it) => {
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

  return (
    <div style={{ padding: 5 }}>
      <Row gutter={16} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>{id ? "Edit Order" : "Add Order"}</Title>
          <Text type="secondary">
            {id ? "Update order details" : "Create Order entries quickly by adding products from the dropdown or manually"}
          </Text>
        </Col>
        <Col>
          <Space>
            <button
              className="bg-[#1C2244] !text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer"
              onClick={() => navigate("/order")}
            >
              Back to list
            </button>
          </Space>
        </Col>
      </Row>

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ items: [] }} onValuesChange={onValuesChange}>
        <Row gutter={12}>
          {/* Vendor */}
          <Col xs={24} sm={12}>
            <Form.Item label="Vendor Name" name="vendor_id" rules={[{ required: true, message: "Please select a vendor" }]}>
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

          {/* Order Date */}
          <Col xs={24} sm={12}>
            <Form.Item label="Order Date" name="order_date" rules={[{ required: true, message: "Please select order date" }]}>
              <input type="date" className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white" />
            </Form.Item>
          </Col>

          {id && (
            <Col xs={24} sm={12}>
              <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please select status" }]}>
                <select className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white">
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Form.Item>
            </Col>
          )}

          {isSuperAdmin && (
            <Col xs={24} sm={12}>
              <Form.Item
                label="Branch"
                name="branch_id"
                rules={[{ required: true, message: "Please select branch" }]}
              >
                <select className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white" disabled={branchesLoading}>
                  <option value="">{branchesLoading ? "Loading branches..." : "Select Branch"}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name || b.name || b.title || b.label || `Branch ${b.id}`}
                    </option>
                  ))}
                </select>
              </Form.Item>
            </Col>
          )}


          {/* Add Product Buttons (replaces scan input) */}
          <Col xs={24}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Button type="dashed" onClick={handleAddProduct}>+ Add Product</Button>
              <Button type="dashed" onClick={handleAddManualProduct}>+ Add Product Manually</Button>
            </div>
          </Col>

          {/* Items Table */}
          <Col xs={24}>
            <Divider style={{ margin: "8px 0 16px 0" }} />
            <Form.List name="items">
              {(fields, { remove }) => {
                const items = form.getFieldValue("items") || [];
                const columns = [
                  {
                    title: "Product Code",
                    dataIndex: "product_code",
                    key: "product_code",
                    render: (_, record, index) => (
                      <Form.Item name={[index, "product_code"]} style={{ margin: 0 }}>
                        <input className="w-full outline-none text-sm border border-gray-300 py-2 px-3 rounded-md bg-gray-100" disabled placeholder="Auto" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Product Name",
                    dataIndex: "product_name",
                    key: "product_name",
                    width: "30%",
                    render: (_, record, index) => (
                      <Form.Item name={[index, "product_name"]} rules={[{ required: true, message: "Enter/select product name" }]} style={{ margin: 0 }}>
                        {/* If item is manual allow text input, otherwise show Select dropdown */}
                        {items[index]?.isManual ? (
                          <input className="w-full outline-none text-sm border border-gray-300 py-2 px-3 rounded-md bg-white" placeholder="Enter name" />
                        ) : (
                          <Select
                            showSearch
                            showArrow
                            placeholder="Search product by name or code"
                            filterOption={false} // server-side filtering
                            notFoundContent={productsLoading ? <Spin size="small" /> : null}
                            onSearch={handleSearch}
                            onFocus={() => { if (!products || products.length === 0) fetchProducts(""); }}
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
                    render: (_, record, index) => (
                      <Form.Item name={[index, "quantity"]} rules={[{ required: true, message: "Enter qty" }]} style={{ margin: 0 }}>
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Unit Price",
                    dataIndex: "unit_price",
                    key: "unit_price",
                    render: (_, record, index) => (
                      <Form.Item name={[index, "unit_price"]} rules={[{ required: true, message: "Enter price" }]} style={{ margin: 0 }}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Unit",
                    dataIndex: "unit",
                    key: "unit",
                    render: (_, record, index) => (
                      <Form.Item name={[index, "unit"]} rules={[{ required: true, message: "Enter unit" }]} style={{ margin: 0 }}>
                        <input className="w-full outline-none text-sm border border-gray-300 py-2 px-3 rounded-md bg-white" placeholder="pcs / kg / box" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Action",
                    key: "action",
                    render: (_, record, index) => (
                      <Button danger onClick={() => {
                        const items = form.getFieldValue("items") || [];
                        items.splice(index, 1);
                        form.setFieldsValue({ items });
                        updateSummary(items, -1);
                      }}>
                        Remove
                      </Button>
                    ),
                  },
                ];

                return <Table dataSource={items.map((item, idx) => ({ ...item, key: idx }))} columns={columns} pagination={false} size="small" />;
              }}
            </Form.List>
          </Col>
        </Row>

        {/* Submit Buttons */}
        <div className="flex justify-end mt-10">
          <Space>
            <button className="bg-[#0E1680] !text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer" type="submit" disabled={loading}>
              {id ? "Update Order" : "Add Order"}
            </button>
            <button className="bg-white border border-gray-400 text-black py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer" onClick={() => navigate("/order")}>
              Cancel
            </button>
          </Space>
        </div>
      </Form>
    </div>
  );
}

export default AddOrder;
