// ProductFormSimple.jsx
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";

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

  /** Fetch categories */
  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res?.data || []);
    } catch {
      message.error("Failed to load categories");
    }
  };

  /** Fetch subcategories when category changes */
  const handleCategoryChange = async (categoryId) => {
    form.setFieldsValue({ subcategory_id: undefined });
    try {
      const res = await subcategoryService.getByCategory(categoryId);
      setSubcategories(res?.data || []);
    } catch {
      message.error("Failed to load subcategories");
    }
  };

  /** Fetch product when editing */
  const fetchProduct = async () => {
    if (!routeId) return;
    setLoading(true);

    try {
      const product = await productService.getById(routeId);

      if (product.category_id) await handleCategoryChange(product.category_id);

      form.setFieldsValue({
        ...product,
        min_quantity: product.min_quantity ?? 0,
        max_quantity: product.max_quantity ?? 0,
      });
    } catch {
      message.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (routeId) fetchProduct();
  }, [routeId]);

  /** Submit */
  const onFinish = async (values) => {
    setLoading(true);

    const payload = {
      ...values,
      min_quantity: Number(values.min_quantity || 0),
      max_quantity: Number(values.max_quantity || 0),
    };

    try {
      if (routeId) {
        await productService.update(routeId, payload);
        message.success("Product updated successfully");
      } else {
        await productService.create(payload);
        message.success("Product created successfully");
      }

      navigate("/product/list");
    } catch (err) {
      console.log(err);
      message.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h2 className="text-lg font-semibold text-gray-900">{routeId ? "Edit Product" : "Add Product"}</h2>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: "active", purchase_price: 0, selling_price: 0 }}
        >

          <Form.Item
            name="product_name"
            label="Product Name"
            rules={[{ required: true, message: "Product name is required" }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          {/* Category */}
          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Select category"
              onChange={handleCategoryChange}
            >
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Subcategory */}
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

          {/* Prices */}
          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item name="purchase_price" label="Purchase Price" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="selling_price" label="Selling Price" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="tax_percentage" label="Tax %" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          {/* Min/Max Quantity */}
          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item name="min_quantity" label="Min Quantity" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="max_quantity" label="Max Quantity" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          {/* Description */}
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          {/* Status */}
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" style={{ marginTop: 10 }}>
            {routeId ? "Update Product" : "Create Product"}
          </Button>
        </Form>
      </Spin>
    </div>
  );
};

export default ProductFormSimple;
