import React, { useEffect, useState } from "react";
import {
  Steps,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Spin,
} from "antd";
import { LeftOutlined, RightOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { toast } from "sonner";        // ✅ NEW
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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      const data = res?.data || res || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to fetch categories");   // ✅ CHANGED
    }
  };

  // Fetch subcategories
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
      toast.error("Failed to fetch subcategories"); // ✅ CHANGED
    }
  };

  // Fetch product (edit mode)
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
        min_quantity: data.min_quantity ?? 0,
        max_quantity: data.max_quantity ?? 0,
      });

      if (Array.isArray(data.images)) {
        setFileList(
          data.images.map((url, idx) => ({
            uid: `orig-${idx}`,
            name: `image-${idx}`,
            status: "done",
            url,
          }))
        );
      }
    } catch (err) {
      toast.error("Failed to load product");        // ✅ CHANGED
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

  // Step validation mapping
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
    } catch (err) {}
  };

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  // Build payload
  const buildPayloadFromForm = () => {
    const values = form.getFieldsValue(true);
    const trim = (v) => (typeof v === "string" ? v.trim() : v);

    const images = fileList
      .filter((f) => f.status === "done" || f.url || f.thumbUrl)
      .map((f) => f.url || f.thumbUrl || f.response?.url || f.name);

    return {
      product_name: trim(values.product_name ?? ""),
      brand: trim(values.brand ?? ""),
      unit: trim(values.unit ?? ""),
      size: trim(values.size ?? ""),
      category_id: values.category_id ? String(values.category_id) : "",
      subcategory_id: values.subcategory_id ? String(values.subcategory_id) : "",
      purchase_price: values.purchase_price ?? 0,
      selling_price: values.selling_price ?? 0,
      tax_percentage: values.tax_percentage ?? 0,
      description: trim(values.description ?? ""),
      status: trim(values.status ?? "active"),
      images,
      min_quantity: Number(values.min_quantity ?? 0),
      max_quantity: Number(values.max_quantity ?? 0),
    };
  };

  // Submit form
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await form.validateFields();

      const payload = buildPayloadFromForm();

      if (routeId) {
        await productService.update(routeId, payload);
        toast.success("Product updated successfully");   // ✅ CHANGED
      } else {
        await productService.create(payload);
        toast.success("Product created successfully");   // ✅ CHANGED
      }

      navigate("/product/list");
    } catch (err) {
      const resp = err?.response?.data;

      if (resp?.error && Array.isArray(resp.error)) {
        resp.error.forEach((e) => toast.error(e.message || "Validation error"));  // ✅ CHANGED
      } else {
        toast.error(err?.message || "Failed to save product");                     // ✅ CHANGED
      }
    } finally {
      setLoading(false);
    }
  };

  const optionValue = (cat) => String(cat?.uuid ?? cat?._id ?? cat?.id ?? "");

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
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select
                placeholder="Select category"
                onChange={handleCategoryChange}
                allowClear
                showSearch
              >
                {categories.map((cat) => (
                  <Option key={optionValue(cat)} value={optionValue(cat)}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Subcategory"
              name="subcategory_id"
              rules={[{ required: true, message: "Please select subcategory" }]}
            >
              <Select allowClear placeholder="Select subcategory">
                {subcategories.map((sub) => (
                  <Option key={optionValue(sub)} value={optionValue(sub)}>
                    {sub.subcategory_name}
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
                <Input placeholder="Enter unit" />
              </Form.Item>

              <Form.Item label="Size" name="size">
                <Select allowClear placeholder="Select size">
                  <Option value="S">S</Option>
                  <Option value="M">M</Option>
                  <Option value="L">L</Option>
                </Select>
              </Form.Item>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <Form.Item label="Purchase Price" name="purchase_price">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Selling Price" name="selling_price">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Tax %" name="tax_percentage">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Form.Item label="Min Quantity" name="min_quantity">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Max Quantity" name="max_quantity">
                <InputNumber style={{ width: "100%" }} />
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
                <Step title={<StepIcon index={0} title="Category" />} />
                <Step title={<StepIcon index={1} title="Info" />} />
                <Step title={<StepIcon index={2} title="Extras" />} />
              </Steps>
            </div>

            <div style={{ flex: 1 }}>
              <h2>{routeId ? "Edit Product" : "Add Product"}</h2>

              <Form form={form} layout="vertical">
                {renderStepContent(current)}
              </Form>

              <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                {current > 0 && (
                  <Button icon={<LeftOutlined />} onClick={prev}>
                    Back
                  </Button>
                )}

                {current < STEP_COLORS.length - 1 ? (
                  <Button type="primary" onClick={next} icon={<RightOutlined />} style={{ backgroundColor: "#0E1680" }}>
                    Next
                  </Button>
                ) : (
                  <Button type="primary" onClick={handleSubmit} icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}>
                    {routeId ? "Update Product" : "Create Product"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default ProductForm;
