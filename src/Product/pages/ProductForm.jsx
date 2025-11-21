// ProductForm.jsx
import React, { useEffect, useState } from "react";
import {
  Steps,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Spin,
} from "antd";
import { LeftOutlined, RightOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import subcategoryService from "../services/subcategoryService";

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const STEP_COLORS = ["#FF7A7A", "#FFB86B", "#7BD389"];

const isUUID = (v) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const ProductForm = () => {
  const { id: routeId } = useParams() || {};
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  // Fetch categories (with debug log)
  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      const data = res?.data || res || [];
      console.log("DEBUG: categories:", data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Category fetch error:", err);
      message.error("Failed to fetch categories");
    }
  };

  // Fetch subcategories for category
  const handleCategoryChange = async (categoryId) => {
    form.setFieldsValue({ subcategory_id: undefined });
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      const res = await subcategoryService.getByCategory(categoryId);
      const data = res?.data || res || [];
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Subcategory fetch error:", err);
      message.error("Failed to fetch subcategories");
    }
  };

  // Fetch existing product when editing
  const fetchProduct = async (productId) => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await productService.getById(productId);
      if (data?.category_id) await handleCategoryChange(data.category_id);
      form.setFieldsValue({
        product_name: data.product_name,
        brand: data.brand,
        unit: data.unit,
        size: data.size,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        purchase_price: data.purchase_price,
        selling_price: data.selling_price,
        tax_percentage: data.tax_percentage,
        description: data.description,
        status: data.status || "active",
        // <-- set min and max quantity when editing
        min_quantity: data.min_quantity ?? 0,
        max_quantity: data.max_quantity ?? 0,
      });
      if (Array.isArray(data.images)) {
        const files = data.images.map((url, idx) => ({
          uid: `orig-${idx}`,
          name: `image-${idx}`,
          status: "done",
          url,
        }));
        setFileList(files);
      }
    } catch (err) {
      console.error("Product fetch error:", err);
      message.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (routeId) fetchProduct(routeId);
  }, [routeId]);

  // Validation groups
  const stepFieldMap = [
    ["category_id", "subcategory_id"],
    ["product_name", "brand", "unit", "size", "purchase_price", "selling_price", "tax_percentage"],
    ["description", "status"],
  ];

  const next = async () => {
    try {
      const fields = stepFieldMap[current] || [];
      if (fields.length) await form.validateFields(fields);
      setCurrent((c) => Math.min(c + 1, STEP_COLORS.length - 1));
    } catch (err) {
      console.log("Validation failed for step", current, err);
    }
  };

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleUploadChange = ({ fileList: newList }) => setFileList(newList);

  // Build payload from current Form state (always pull current values from the Form)
  const buildPayloadFromForm = () => {
    // get all fields (latest form state)
    const values = form.getFieldsValue(true); // true => include all controlled fields
    // Trim strings and coerce IDs to strings
    const trim = (v) => (typeof v === "string" ? v.trim() : v);

    const images = fileList
      .filter((f) => f.status === "done" || f.url || f.thumbUrl)
      .map((f) => f.url || f.thumbUrl || f.response?.url || f.name);

    const payload = {
      product_name: trim(values.product_name ?? ""),
      brand: trim(values.brand ?? ""),
      unit: trim(values.unit ?? ""),
      size: trim(values.size ?? ""),
      // ensure category/subcategory values are strings (Select value may be number or uuid)
      category_id: values.category_id != null ? String(values.category_id) : "",
      subcategory_id: values.subcategory_id != null ? String(values.subcategory_id) : "",
      purchase_price: values.purchase_price ?? 0,
      selling_price: values.selling_price ?? 0,
      tax_percentage: values.tax_percentage ?? 0,
      description: trim(values.description ?? ""),
      status: trim(values.status ?? "active"),
      images,
      // <-- include min and max quantities in payload
      min_quantity: typeof values.min_quantity === "number" ? values.min_quantity : Number(values.min_quantity ?? 0),
      max_quantity: typeof values.max_quantity === "number" ? values.max_quantity : Number(values.max_quantity ?? 0),
    };

    return payload;
  };

  // Map backend validation to form fields
  const applyServerValidationToForm = (errorArray) => {
    if (!Array.isArray(errorArray)) return;
    const fieldErrors = errorArray
      .map((e) => {
        const name = Array.isArray(e.path) ? e.path : (e.path ? [e.path] : [""]);
        return { name, errors: [e.message || "Invalid value"] };
      })
      .filter(Boolean);
    if (fieldErrors.length) form.setFields(fieldErrors);
  };

  // Final submit: validate client-side, then build payload from form state, guard common problems,
  // then send. This prevents "empty payload" being sent.
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // run validation for entire form (ensures required fields flagged)
      await form.validateFields();

      // build payload from form (fresh)
      const payload = buildPayloadFromForm();
      console.log("FINAL PAYLOAD:", payload);

      // client-side guard: check critical server validations
      const clientFieldErrors = [];
      if (!payload.product_name || payload.product_name.length === 0) {
        clientFieldErrors.push({ name: ["product_name"], errors: ["Product name is required"] });
      }
      // If your backend expects a UUID for category_id, check format
      if (!payload.category_id || payload.category_id.length === 0) {
        clientFieldErrors.push({ name: ["category_id"], errors: ["Please select category"] });
      } else if (!isUUID(payload.category_id)) {
        // Only enforce UUID format if your categories are expected to be UUIDs.
        // If your category IDs are numeric or other format, remove this check.
        clientFieldErrors.push({ name: ["category_id"], errors: ["Category ID must be a valid UUID"] });
      }

      if (clientFieldErrors.length) {
        form.setFields(clientFieldErrors);
        setLoading(false);
        // bring the user to the step containing the first error
        const firstField = clientFieldErrors[0].name[0];
        if (["category_id", "subcategory_id"].includes(firstField)) setCurrent(0);
        else if (["product_name", "brand", "unit", "size", "purchase_price", "selling_price", "tax_percentage"].includes(firstField)) setCurrent(1);
        else setCurrent(2);
        return;
      }

      // send payload
      if (routeId) {
        await productService.update(routeId, payload);
        message.success("Product updated successfully");
      } else {
        await productService.create(payload);
        message.success("Product created successfully");
      }

      navigate("/product/list");
    } catch (err) {
      console.error("Save error:", err);

      // handle axios backend validation
      const resp = err?.response?.data;
      if (resp?.error && Array.isArray(resp.error)) {
        applyServerValidationToForm(resp.error);
        resp.error.forEach((e) => message.error(e.message || JSON.stringify(e)));
      } else if (err?.message) {
        message.error(err.message);
      } else {
        message.error("Failed to save product");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to pick a string value from category object (use uuid if available)
  const optionValue = (cat) => {
    // prefer uuid or _id if present, otherwise id
    if (!cat) return "";
    return String(cat.uuid ?? cat._id ?? cat.id ?? "");
  };

  const StepIcon = ({ index, title }) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          background: STEP_COLORS[index],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
        }}
      >
        {index + 1}
      </div>
      <div style={{ fontWeight: 700 }}>{title}</div>
    </div>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Form.Item
              label="Category"
              name="category_id"
              rules={[
                { required: true, message: "Please select category" },
                {
                  validator: (_, v) => {
                    if (!v || String(v).trim() === "") return Promise.reject(new Error("Please select category"));
                    // only validate UUID if categories are UUIDs; skip if your categories are numeric
                    if (v && !isUUID(String(v))) {
                      // if your API expects uuid, uncomment next line
                      // return Promise.reject(new Error("Category ID must be a valid UUID"));
                      return Promise.resolve(); // comment out if you want UUID enforcement client-side
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                placeholder="Select category"
                onChange={handleCategoryChange}
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {categories.map((cat) => (
                  // value always a string (helps avoid numeric vs uuid mismatches)
                  <Option key={optionValue(cat)} value={optionValue(cat)}>
                    {cat.category_name || cat.name || "Unnamed"}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Subcategory"
              name="subcategory_id"
              rules={[{ required: true, message: "Please select subcategory" }]}
            >
              <Select
                placeholder="Select subcategory"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {subcategories.map((sub) => (
                  <Option key={optionValue(sub)} value={optionValue(sub)}>
                    {sub.subcategory_name || sub.name || "Unnamed"}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );

      case 1:
        return (
          <>
            <Form.Item
              label="Product Name"
              name="product_name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input placeholder="Enter product name" />
            </Form.Item>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <Form.Item label="Brand" name="brand">
                <Input placeholder="Enter brand name" />
              </Form.Item>

              <Form.Item label="Unit" name="unit">
                <Input placeholder="Enter unit (e.g., pcs, kg)" />
              </Form.Item>

              <Form.Item label="Size" name="size">
                <Select placeholder="Select size" allowClear>
                  <Option value="XS">XS</Option>
                  <Option value="S">S</Option>
                  <Option value="M">M</Option>
                  <Option value="L">L</Option>
                  <Option value="XL">XL</Option>
                  <Option value="XXL">XXL</Option>
                </Select>
              </Form.Item>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
              <Form.Item
                label="Purchase Price"
                name="purchase_price"
                rules={[{ type: "number", min: 0, message: "Price must be >= 0" }]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="Enter purchase price" />
              </Form.Item>

              <Form.Item
                label="Selling Price"
                name="selling_price"
                rules={[{ type: "number", min: 0, message: "Price must be >= 0" }]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="Enter selling price" />
              </Form.Item>

              <Form.Item
                label="Tax %"
                name="tax_percentage"
                rules={[{ type: "number", min: 0, message: "Tax must be >= 0" }]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="Enter tax percentage" />
              </Form.Item>
            </div>

            {/* NEW: min/max quantity row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 16 }}>
              <Form.Item
                label="Min Quantity"
                name="min_quantity"
                rules={[{ type: "number", min: 0, message: "Min quantity must be >= 0" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} step={1} placeholder="Minimum quantity" />
              </Form.Item>

              <Form.Item
                label="Max Quantity"
                name="max_quantity"
                rules={[{ type: "number", min: 0, message: "Max quantity must be >= 0" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} step={1} placeholder="Maximum quantity" />
              </Form.Item>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <Form.Item label="Description" name="description">
              <TextArea rows={4} placeholder="Enter product description" />
            </Form.Item>

            <Form.Item label="Status" name="status">
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <Spin spinning={loading}>
        <div style={{ maxWidth: 1100, margin: "0 auto", background: "white", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ width: 260 }}>
              <Steps direction="vertical" current={current} onChange={(idx) => setCurrent(idx)}>
                <Step title={<StepIcon index={0} title="Category" />} description="Choose category & subcategory" />
                <Step title={<StepIcon index={1} title="Info" />} description="Product details + pricing" />
                <Step title={<StepIcon index={2} title="Extras" />} description="Description & status" />
              </Steps>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ margin: 0 }}>{routeId ? "Edit Product" : "Add Product"}</h2>
                  <div style={{ color: "#666", fontSize: 13 }}>Step {current + 1} of {STEP_COLORS.length}</div>
                </div>
              </div>

              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  status: "active",
                  purchase_price: 0,
                  selling_price: 0,
                  // initial values for the new fields
                  min_quantity: 0,
                  max_quantity: 0,
                }}
              >
                {renderStepContent(current)}
              </Form>

              <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                <div>
                  {current > 0 && (
                    <Button icon={<LeftOutlined />} onClick={prev} style={{ marginRight: 8 }}>
                      Back
                    </Button>
                  )}
                </div>

                <div>
                  {current < STEP_COLORS.length - 1 && (
                    <Button style={{backgroundColor:"#0E1680"}} type="primary" onClick={next} icon={<RightOutlined />}>
                      Next
                    </Button>
                  )}

                  {current === STEP_COLORS.length - 1 && (
                    <Button type="primary" onClick={handleSubmit} icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}>
                      {routeId ? "Update Product" : "Create Product"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default ProductForm;
