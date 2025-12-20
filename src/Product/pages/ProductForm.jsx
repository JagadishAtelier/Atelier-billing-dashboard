// ProductFormSimple.jsx
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";  // <-- Using Sonner

import productService from "../services/productService";
import categoryService from "../services/categoryService";
import subcategoryService from "../services/subcategoryService";

const { TextArea } = Input;
const { Option } = Select;

const ProductFormSimple = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res?.data || res || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const handleCategoryChange = async (categoryId) => {
    form.setFieldsValue({ subcategory_id: undefined });
    try {
      const res = await subcategoryService.getByCategory(categoryId);
      setSubcategories(res?.data || res || []);
    } catch {
      toast.error("Failed to load subcategories");
    }
  };

  const fetchProduct = async () => {
    if (!routeId) return;
    setLoading(true);

    try {
      // productService.getById may return the product directly or as { data: product }
      const raw = await productService.getById(routeId);
      const product = raw?.data ?? raw;

      if (!product) {
        throw new Error("No product returned");
      }

      // ensure numeric fields are numbers and strings are sane
      const normalized = {
        product_name: product.product_name ?? product.name ?? "",
        category_id: product.category_id ?? product.categoryId ?? null,
        subcategory_id: product.subcategory_id ?? product.subcategoryId ?? null,
        brand: product.brand ?? "",
        unit: product.unit ?? "",
        purchase_price:
          product.purchase_price !== undefined && product.purchase_price !== null
            ? Number(product.purchase_price)
            : 0,
        selling_price:
          product.selling_price !== undefined && product.selling_price !== null
            ? Number(product.selling_price)
            : 0,
        tax_percentage:
          product.tax_percentage !== undefined && product.tax_percentage !== null
            ? Number(product.tax_percentage)
            : 0,
        min_quantity:
          product.min_quantity !== undefined && product.min_quantity !== null
            ? Number(product.min_quantity)
            : 0,
        max_quantity:
          product.max_quantity !== undefined && product.max_quantity !== null
            ? Number(product.max_quantity)
            : 0,
        description: product.description ?? "",
        status: product.status ?? "active",
      };

      // If category exists, load subcategories
      if (normalized.category_id) {
        await handleCategoryChange(normalized.category_id);
      }

      // Set form with normalized values (no raw nulls / strings)
      form.setFieldsValue({
        ...normalized,
      });
    } catch (err) {
      console.error("Failed to load product", err);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (routeId) fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  const onFinish = async (values) => {
    setLoading(true);

    // coerce numeric fields and ensure description is string
    const payload = {
      ...values,
      purchase_price: Number(values.purchase_price || 0),
      selling_price: Number(values.selling_price || 0),
      tax_percentage: Number(values.tax_percentage || 0),
      min_quantity: Number(values.min_quantity || 0),
      max_quantity: Number(values.max_quantity || 0),
      description: values.description ?? "",
    };

    try {
      if (routeId) {
        await productService.update(routeId, payload);
        toast.success("Product updated successfully");
      } else {
        await productService.create(payload);
        toast.success("Product created successfully");
      }

      navigate("/product/list");
    } catch (err) {
      console.error(err);
      // attempt to surface server message if any
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to save";
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h2 className="text-lg font-semibold text-gray-900">
        {routeId ? "Edit Product" : "Add Product"}
      </h2>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: "active",
            purchase_price: 0,
            selling_price: 0,
            tax_percentage: 0,
            min_quantity: 0,
            max_quantity: 0,
            description: "",
          }}
        >
          <Form.Item
            name="product_name"
            label="Product Name"
            rules={[{ required: true, message: "Product name is required" }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item
              name="category_id"
              label="Category"
              rules={[{ required: true, message: "Please select category" }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select category" onChange={handleCategoryChange}>
                {categories.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.category_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="subcategory_id"
              label="Subcategory"
              rules={[{ required: true, message: "Please select subcategory" }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select subcategory">
                {subcategories.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.subcategory_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item name="brand" label="Brand" style={{ flex: 1 }}>
              <Input placeholder="Brand" />
            </Form.Item>

            <Form.Item name="unit" label="Unit" style={{ flex: 1 }}>
              <Input placeholder="pcs, kg etc." />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item
              name="purchase_price"
              label="Purchase Price"
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="selling_price"
              label="Selling Price"
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="tax_percentage"
              label="Tax %"
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item name="min_quantity" label="Min Quantity" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="max_quantity" label="Max Quantity" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Button
            htmlType="submit"
            style={{
              backgroundColor: "#506ee4",
              fontWeight: "500",
              fontSize: "16px",
              height: "40px",
              border: "none",
              color: "#fff",
              borderRadius: "4px",
              padding: "6px 16px",
              cursor: "pointer",
            }}
          >
            {routeId ? "Update Product" : "Create Product"}
          </Button>
        </Form>
      </Spin>
    </div>
  );
};

export default ProductFormSimple;
