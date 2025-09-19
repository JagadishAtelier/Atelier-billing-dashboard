import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, message, Spin } from "antd";
import categoryService from "../services/categoryService";

const { TextArea } = Input;

const CategoryForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // For edit
  const [loading, setLoading] = useState(false);

  // Fetch category data if editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      categoryService
        .getById(id)
        .then((res) => {
          form.setFieldsValue({
            category_name: res.category_name,
            description: res.description || "",
          });
        })
        .catch((err) => {
          console.error(err);
          message.error("Failed to fetch category");
        })
        .finally(() => setLoading(false));
    }
  }, [id, form]);

  // Handle form submit
  const onFinish = async (values) => {
    const payload = {
      category_name: values.category_name,
      description: values.description || "",
    };

    try {
      setLoading(true);
      if (id) {
        await categoryService.update(id, payload);
        message.success("Category updated successfully");
      } else {
        await categoryService.create(payload);
        message.success("Category added successfully");
      }
      navigate("/category/list");
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      message.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">{id ? "Edit Category" : "Add Category"}</h2>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ category_name: "", description: "" }}
        >
          <Form.Item
            label="Category Name"
            name="category_name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="Category Name" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={4} placeholder="Description (optional)" />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-2">
              <Button type="primary" htmlType="submit" loading={loading}>
                {id ? "Update Category" : "Add Category"}
              </Button>
              <Button onClick={() => navigate("/category/list")}>Cancel</Button>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default CategoryForm;
