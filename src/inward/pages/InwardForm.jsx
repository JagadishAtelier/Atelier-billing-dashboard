// src/inward/pages/InwardForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  message,
  Spin,
  Table,
} from "antd";
import inwardService from "../service/inwardService";
import productService from "../../Product/services/productService";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const InwardForm = () => {
  const { id } = useParams(); // future edit support
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /** 🔹 Add product by code */
  const handleProductCode = async (e) => {
    const code = e.target.value.trim();
    if (!code) return;
    e.target.value = ""; // reset input

    try {
      const product = await productService.getByCode(code);

      if (!product) {
        message.error("No product found with that code");
        return;
      }

      let items = form.getFieldValue("items") || [];

      // check if product already exists
      const existingIndex = items.findIndex(
        (item) => item.product_code === product.product_code
      );

      if (existingIndex >= 0) {
        // increase quantity
        items[existingIndex].quantity += 1;
      } else {
        // add new row
        items.push({
          product_id: product.id,
          product_code: product.product_code,
          product_name: product.product_name,
          quantity: 1,
          unit_price: product.purchase_price || 0,
          unit: product.unit || "",
          expiry_date: null,
        });
      }

      form.setFieldsValue({ items });
    } catch (err) {
      console.error("Fetch product error:", err);
      message.error("Failed to fetch product");
    }
  };

  /** 🔹 Submit Handler */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        supplier_name: values.supplier_name,
        received_date: values.received_date
          ? dayjs(values.received_date).toDate()
          : new Date(),
        remarks: values.remarks,
        status: values.status || "pending",
        created_by: "1", // you can set from auth context
        created_by_name: "Admin",
        created_by_email: "admin@example.com",
        items: values.items || [],
      };

      await inwardService.create(payload);
      message.success("Inward entry created successfully");
      navigate("/inward/list");
    } catch (err) {
      console.error("Save error:", err);
      message.error("Failed to save inward entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Inward" : "Add Inward"}
      </h2>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "pending", items: [] }}
        >
          {/* Supplier */}
          <Form.Item
            label="Supplier Name"
            name="supplier_name"
            rules={[{ required: true, message: "Please enter supplier name" }]}
          >
            <Input placeholder="Enter supplier name" />
          </Form.Item>

          {/* Received Date */}
          <Form.Item
            label="Received Date"
            name="received_date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {/* Remarks */}
          <Form.Item label="Remarks" name="remarks">
            <TextArea rows={3} placeholder="Enter remarks (optional)" />
          </Form.Item>

          {/* Status */}
          <Form.Item label="Status" name="status">
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="received">Received</Option>
            </Select>
          </Form.Item>

          {/* Product Code Input */}
          <Form.Item label="Scan/Enter Product Code">
            <Input
              placeholder="Enter product code and press Enter"
              onPressEnter={handleProductCode}
            />
          </Form.Item>

          {/* Items Table */}
          <Form.List name="items">
            {(fields, { remove }) => {
              const items = form.getFieldValue("items") || [];
              const columns = [
                {
                  title: "Product Code",
                  dataIndex: "product_code",
                },
                {
                  title: "Product Name",
                  dataIndex: "product_name",
                },
                {
                  title: "Quantity",
                  render: (_, record, index) => (
                    <Form.Item
                      name={[index, "quantity"]}
                      rules={[{ required: true, message: "Enter qty" }]}
                    >
                      <InputNumber min={1} />
                    </Form.Item>
                  ),
                },
                {
                  title: "Unit Price",
                  render: (_, record, index) => (
                    <Form.Item
                      name={[index, "unit_price"]}
                      rules={[{ required: true, message: "Enter price" }]}
                    >
                      <InputNumber min={0} />
                    </Form.Item>
                  ),
                },
                {
                  title: "Unit",
                  render: (_, record, index) => (
                    <Form.Item name={[index, "unit"]}>
                      <Input />
                    </Form.Item>
                  ),
                },
                {
                  title: "Expiry Date",
                  render: (_, record, index) => (
                    <Form.Item name={[index, "expiry_date"]}>
                      <DatePicker />
                    </Form.Item>
                  ),
                },
                {
                  title: "Action",
                  render: (_, record, index) => (
                    <Button danger onClick={() => remove(index)}>
                      Remove
                    </Button>
                  ),
                },
              ];

              return (
                <Table
                  dataSource={items}
                  columns={columns}
                  pagination={false}
                  rowKey={(record, idx) => idx}
                />
              );
            }}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? "Update Inward" : "Add Inward"}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default InwardForm;
