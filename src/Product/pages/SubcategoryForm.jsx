import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Card,
  Form,
  Input,
  Button,
  Select,
  message,
  Spin,
  Avatar,
  Typography,
  Divider,
  Space,
  Tooltip,
  Result,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, TagsOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import categoryService from "../services/categoryService";
import subcategoryService from "../services/subcategoryService";
import { Replace } from "lucide-react";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * Polished SubcategoryForm
 * - Responsive layout with gradient header + icon
 * - Category select (searchable)
 * - Client + server validation mapping to form fields
 * - Sticky action footer and success result with auto-redirect
 */
const SubcategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState([]);
  const [descCount, setDescCount] = useState(0);
  const optionValue = (obj) => (obj ? String(obj.uuid ?? obj._id ?? obj.id ?? "") : "");
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
  const fetchSubcategory = async (subId) => {
    setLoading(true);
    try {
      await fetchCategories();

      const res = await subcategoryService.getById(subId);
      const data = res?.data ?? res ?? {};
      const categoryId = data.category_id ?? (data.category ? (data.category.uuid ?? data.category._id ?? data.category.id) : "");

      form.setFieldsValue({
        subcategory_name: data.subcategory_name ?? "",
        category_id: categoryId ?? "",
        description: data.description ?? "",
        status: data.status ?? "active",
      });

      setDescCount((data.description || "").length);
    } catch (err) {
      console.error("Subcategory fetch error:", err);
      message.error("Failed to fetch subcategory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      fetchCategories();
    } else {
      fetchSubcategory(id);
    }
  }, [id]);
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

  const onDescriptionChange = (e) => setDescCount(e.target.value.length);

  const onCancel = () => navigate("/subcategory/list");

  const handleSubmit = async (values) => {
    const payload = {
      subcategory_name: (values.subcategory_name || "").trim(),
      category_id: String(values.category_id || ""),
      description: (values.description || "").trim(),
      status: values.status || "active",
    };
    const clientErrors = [];
    if (!payload.subcategory_name) clientErrors.push({ name: ["subcategory_name"], errors: ["Subcategory name is required"] });
    if (!payload.category_id) clientErrors.push({ name: ["category_id"], errors: ["Please select a category"] });

    if (clientErrors.length) {
      form.setFields(clientErrors);
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await subcategoryService.update(id, payload);
        message.success("Subcategory updated successfully");
      } else {
        await subcategoryService.create(payload);
        message.success("Subcategory created successfully");
      }

      // ssuccess page
      setSaved(true);
      setTimeout(() => navigate("/subcategory/list"), 1000);
    } catch (err) {
      console.error("Submit error:", err);
      const resp = err?.response?.data;
      if (resp?.error && Array.isArray(resp.error)) {
        applyServerValidationToForm(resp.error);
        resp.error.forEach((e) => message.error(e.message || JSON.stringify(e)));
      } else {
        message.error(err?.message || "Operation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div style={{ padding: 28, display: "flex", justifyContent: "center" }}>
        <Card style={{ width: 680, textAlign: "center", borderRadius: 12, boxShadow: "0 8px 30px rgba(2,6,23,0.08)" }}>
          <Result
            icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
            title={id ? "Subcategory updated" : "Subcategory created"}
            subTitle="Redirecting to subcategory list..."
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 980 }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 8 }}>
            <div
      initial={{ rotate: -45, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-white shadow-sm rounded-sm p-1.5 border border-gray-200"
    >
      <Replace size={20} className="inline-block text-gray-600" />
    </div>

            <div style={{ flex: 1 }}>
              <Title level={4} style={{ margin: 0 }}>
                {id ? "Edit Subcategory" : "Add Subcategory"}
              </Title>
              <Text type="secondary">Attach a subcategory to an existing category. Keep names descriptive.</Text>
            </div>

            <div>
              <Tooltip title="Back to list">
                <Button onClick={onCancel} icon={<ArrowLeftOutlined />} />
              </Tooltip>
            </div>
          </div>

          <Divider style={{ marginTop: 12, marginBottom: 20 }} />

          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ status: "active" }}
            >
              <div style={{ display: "grid", gap: 16 }}>
                <Form.Item
                  label="Category"
                  name="category_id"
                  rules={[{ required: true, message: "Please select category" }]}
                >
                  <Select
                    placeholder="Select category"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    notFoundContent={categories.length === 0 ? <Spin size="small" /> : null}
                  >
                    {categories.map((cat) => (
                      <Option key={optionValue(cat)} value={optionValue(cat)}>
                        {cat.category_name || cat.name || "Unnamed"}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Subcategory Name"
                  name="subcategory_name"
                  rules={[{ required: true, message: "Please enter subcategory name" }]}
                >
                  <Input placeholder="e.g., T-Shirts" size="large" />
                </Form.Item>
                <Form.Item label="Description" name="description">
                  <TextArea rows={4} placeholder="Optional description" onChange={(e) => onDescriptionChange(e)} />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{descCount} characters</Text>
                  </div>
                </Form.Item>
              </div>

              {/* Sticky action bar */}
              <div
                style={{
                  position: "sticky",
                  bottom: 12,
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Tip: Subcategories help users filter products quickly.
                  </Text>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Button style={{height: "40px", padding: "6px 16px"}} onClick={onCancel}>Cancel</Button>
                  <Button
                    style={{ backgroundColor: "#506ee4", fontWeight: "500", fontSize: "16px", height: "40px", border: "none", color: "#fff", borderRadius: "4px", padding: "6px 16px", cursor: "pointer" }}
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    loading={loading}
                  >
                    {id ? "Update Subcategory" : "Add Subcategory"}
                  </Button>
                </div>
              </div>
            </Form>
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default SubcategoryForm;
