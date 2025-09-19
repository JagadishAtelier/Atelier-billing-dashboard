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
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import billingService from "../service/billingService";
import productService from "../../Product/services/productService";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const BillingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /** 🔹 Add product by code */
  const handleProductCode = async (e) => {
    const code = e.target.value.trim();
    if (!code) return;
    e.target.value = "";

    try {
      const product = await productService.getByCode(code);
      if (!product) return message.error("No product found");

      let items = form.getFieldValue("items") || [];
      const index = items.findIndex((i) => i.product_code === product.product_code);

      if (index >= 0) {
        items[index].quantity += 1;
        updateItemCalculations(items[index], product);
      } else {
        const newItem = {
          product_id: product.id,
          product_code: product.product_code,
          product_name: product.product_name,
          quantity: 1,
          unit_price: product.selling_price || 0,
          discount_amount: 0,
          tax_percentage: product.tax_percentage || 0,
          tax_amount: 0,
          total_price: 0,
        };
        updateItemCalculations(newItem, product);
        items.push(newItem);
      }

      form.setFieldsValue({ items });
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch product");
    }
  };

  /** 🔹 Calculate Tax & Total */
  const updateItemCalculations = (item, product) => {
    const qty = item.quantity || 0;
    const price = item.unit_price || 0;
    const discount = item.discount_amount || 0;
    const taxPerc = product?.tax_percentage || item.tax_percentage || 0;

    const tax = ((qty * price * taxPerc) / 100).toFixed(2);
    const total = (qty * price + parseFloat(tax) - discount).toFixed(2);

    item.tax_amount = parseFloat(tax);
    item.total_price = parseFloat(total);
  };

  /** 🔹 On quantity/discount change */
  const handleItemChange = (index, field, value) => {
    let items = form.getFieldValue("items") || [];
    const item = items[index];
    item[field] = value;
    updateItemCalculations(item);
    items[index] = item;
    form.setFieldsValue({ items });
  };

  /** 🔹 Calculate Summary */
  const calculateSummary = () => {
    const items = form.getFieldValue("items") || [];
    const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const totalDiscount = items.reduce((sum, i) => sum + (i.discount_amount || 0), 0);
    const totalTax = items.reduce((sum, i) => sum + (i.tax_amount || 0), 0);
    const grandTotal = subtotal - totalDiscount + totalTax;
    return { subtotal, totalDiscount, totalTax, grandTotal };
  };

  /** 🔹 Submit Handler */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        customer_name: values.customer_name,
        billing_date: values.billing_date ? dayjs(values.billing_date).toDate() : new Date(),
        remarks: values.remarks,
         type: "Cashier Billing",
        status: values.status || "pending",
        items: values.items || [],
      };
      await billingService.create(payload);
      message.success("Billing created successfully");
      navigate("/billing/list");
    } catch (err) {
      console.error(err);
      message.error("Failed to save billing");
    } finally {
      setLoading(false);
    }
  };

  const summary = calculateSummary();

  return (
    <div className="p-4">
      <Title level={3}>{id ? "Edit Billing" : "Add Billing"}</Title>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: "pending", items: [] }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Customer Name"
                name="customer_name"
                rules={[{ required: true, message: "Enter customer name" }]}
              >
                <Input placeholder="Enter customer name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Billing Date"
                name="billing_date"
                rules={[{ required: true, message: "Select billing date" }]}
              >
                <DatePicker style={{ width: "100%" }} defaultValue={dayjs()} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Status" name="status">
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="paid">Paid</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
            <Form.Item label="Remarks" name="remarks">
              <TextArea rows={3} placeholder="Enter remarks" />
              </Form.Item>
            </Col>
          </Row>

            <Form.Item label="Scan/Enter Product Code">
                <Input placeholder="Enter product code" onPressEnter={handleProductCode} />
          </Form.Item>

          <Form.List name="items">
            {(fields, { remove }) => {
              const items = form.getFieldValue("items") || [];
              const columns = [
                { title: "Product Code", dataIndex: "product_code" },
                { title: "Product Name", dataIndex: "product_name" },
                {
                  title: "Quantity",
                  render: (_, record, index) => (
                    <InputNumber min={1} value={record.quantity} onChange={(v) => handleItemChange(index, "quantity", v)} />
                  ),
                },
                { title: "Unit Price", dataIndex: "unit_price", render: (v) => `₹${v}` },
                {
                  title: "Discount",
                  render: (_, record, index) => (
                    <InputNumber min={0} value={record.discount_amount} onChange={(v) => handleItemChange(index, "discount_amount", v)} />
                  ),
                },
                { title: "Tax", dataIndex: "tax_amount", render: (v) => `₹${v}` },
                { title: "Total Price", dataIndex: "total_price", render: (v) => `₹${v}` },
                { title: "Action", render: (_, __, index) => <Button danger onClick={() => remove(index)}>Remove</Button> },
              ];

              return (
                <>
                  <Table
                    dataSource={items}
                    columns={columns}
                    pagination={false}
                    rowKey={(r, idx) => idx}
                    scroll={{ x: true }}
                  />
                  <Divider />
                  <Row gutter={16} style={{ textAlign: "right" }}>
                    <Col span={6}><Text strong>Subtotal:</Text> ₹{summary.subtotal.toFixed(2)}</Col>
                    <Col span={6}><Text strong>Total Discount:</Text> ₹{summary.totalDiscount.toFixed(2)}</Col>
                    <Col span={6}><Text strong>Total Tax:</Text> ₹{summary.totalTax.toFixed(2)}</Col>
                    <Col span={6}><Text strong>Grand Total:</Text> ₹{summary.grandTotal.toFixed(2)}</Col>
                  </Row>
                </>
              );
            }}
          </Form.List>

          <Form.Item style={{ marginTop: 20 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? "Update Billing" : "Add Billing"}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default BillingForm;
