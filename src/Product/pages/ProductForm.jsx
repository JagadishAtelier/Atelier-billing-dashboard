import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, InputNumber, Button, Select, message, Spin } from "antd";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import subcategoryService from "../services/subcategoryService";

const { TextArea } = Input;
const { Option } = Select;

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  /** 🔹 Fetch categories */
  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      const data = res?.data || res || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Category fetch error:", err);
      message.error("Failed to fetch categories");
    }
  };

  /** 🔹 Fetch subcategories by category */
const handleCategoryChange = async (categoryId) => {
  form.setFieldsValue({ subcategory_id: undefined });
  if (!categoryId) {
    setSubcategories([]);
    return;
  }
  try {
    const res = await subcategoryService.getByCategory(categoryId);
    console.log("🔹 Subcategory API response:", res);

    const data = res?.data || res || [];
    setSubcategories(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Subcategory fetch error:", err);
    message.error("Failed to fetch subcategories");
  }
};


  /** 🔹 Fetch product by ID (edit mode) */
  const fetchProduct = async () => {
    if (id) {
      setLoading(true);
      try {
        const data = await productService.getById(id);

        if (data?.category_id) {
          // Load subcategories for saved category
          await handleCategoryChange(data.category_id);
        }

        form.setFieldsValue({
          ...data,
          category_id: data?.category_id,
          subcategory_id: data?.subcategory_id,
        });
      } catch (err) {
        console.error("Product fetch error:", err);
        message.error("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  /** 🔹 Submit handler */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (id) {
        await productService.update(id, values);
        message.success("Product updated successfully");
      } else {
        await productService.create(values);
        message.success("Product created successfully");
      }
      navigate("/product/list");
    } catch (err) {
      console.error("Save error:", err);
      message.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Product" : "Add Product"}
      </h2>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "active",
            purchase_price: 0,
            selling_price: 0,
          }}
        >
          {/* Category Dropdown */}
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
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.category_name || cat.name || "Unnamed"}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Subcategory Dropdown */}
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
                option?.children
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {subcategories.map((sub) => (
                <Option key={sub.id} value={sub.id}>
                  {sub.subcategory_name || sub.name || "Unnamed"}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Product Fields */}
          <Form.Item
            label="Product Name"
            name="product_name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item label="Brand" name="brand">
            <Input placeholder="Enter brand name" />
          </Form.Item>

          <Form.Item label="Unit" name="unit">
            <Input placeholder="Enter unit (e.g., pcs, kg)" />
          </Form.Item>

          <Form.Item
            label="Purchase Price"
            name="purchase_price"
            rules={[{ type: "number", min: 0, message: "Price must be >= 0" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter purchase price"
            />
          </Form.Item>

          <Form.Item
            label="Selling Price"
            name="selling_price"
            rules={[{ type: "number", min: 0, message: "Price must be >= 0" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter selling price"
            />
          </Form.Item>

          <Form.Item
            label="Tax Percentage"
            name="tax_percentage"
            rules={[{ type: "number", min: 0, message: "Price must be >= 0" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter tax percentage"
            />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={4} placeholder="Enter product description" />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? "Update Product" : "Add Product"}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default ProductForm;
