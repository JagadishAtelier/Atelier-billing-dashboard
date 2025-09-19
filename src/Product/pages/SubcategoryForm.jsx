import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, Select, message, Spin, Space } from "antd";
import categoryService from "../services/categoryService";
import subcategoryService from "../services/subcategoryService";

const { TextArea } = Input;
const { Option } = Select;

const SubcategoryForm = () => {
  const { id } = useParams(); // For edit
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  /** 🔹 Fetch all categories */
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

  /** 🔹 Fetch subcategory by ID (edit mode) */
  const fetchSubcategory = async () => {
    if (id) {
      setLoading(true);
      try {
        // Ensure categories are loaded first so Select shows correct label
        await fetchCategories();

        const data = await subcategoryService.getById(id);

        form.setFieldsValue({
          subcategory_name: data.subcategory_name,
          category_id: data.category_name, // ID as value
          description: data.description || "",
          status: data.status || "active",
        });
      } catch (err) {
        console.error("Subcategory fetch error:", err);
        message.error("Failed to fetch subcategory");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!id) fetchCategories(); // For Add mode
    fetchSubcategory(); // For Edit mode
  }, [id]);

  /** 🔹 Handle form submit */
  const handleSubmit = async (values) => {
    const payload = {
      subcategory_name: values.subcategory_name,
      category_id: values.category_id,
      description: values.description || "",
      status: values.status || "active",
    };

    try {
      setLoading(true);
      if (id) {
        await subcategoryService.update(id, payload);
        message.success("Subcategory updated successfully");
      } else {
        await subcategoryService.create(payload);
        message.success("Subcategory added successfully");
      }
      navigate("/subcategory/list");
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      message.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="mb-4">{id ? "Edit Subcategory" : "Add Subcategory"}</h2>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "active" }}
        >
          {/* Category Dropdown */}
          <Form.Item
            label="Category"
            name="category_id"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select
              placeholder="Select category"
              showSearch
              optionFilterProp="children"
              allowClear
              loading={loading && categories.length === 0}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.category_name || cat.name || "Unnamed"}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Subcategory Name */}
          <Form.Item
            label="Subcategory Name"
            name="subcategory_name"
            rules={[{ required: true, message: "Please enter subcategory name" }]}
          >
            <Input placeholder="Enter subcategory name" />
          </Form.Item>

          {/* Description */}
          <Form.Item label="Description" name="description">
            <TextArea placeholder="Enter description (optional)" rows={3} />
          </Form.Item>

          {/* Status */}
          <Form.Item label="Status" name="status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          {/* Submit / Cancel */}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {id ? "Update Subcategory" : "Add Subcategory"}
              </Button>
              <Button onClick={() => navigate("/subcategory/list")}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default SubcategoryForm;
