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
  Card,
  Row,
  Col,
  Divider,
  Space,
  Typography,
  List,
  Badge,
} from "antd";
import inwardService from "../../../inward/service/inwardService";
import productService from "../../../Product/services/productService";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

function AddOrder() {
  const { id } = useParams(); // future edit support
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // summary now stores items array plus totals and lastAdded index
  const [summary, setSummary] = useState({
    items: [],
    count: 0,
    qty: 0,
    value: 0,
    lastAddedIndex: -1,
  });

  /** 🔹 Add product by code (unchanged logic) */
  const handleProductCode = async (e) => {
    const code = (e?.target?.value || "").trim();
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
        form.setFieldsValue({ items });
        // update summary: last added is that index
        updateSummary(items, existingIndex);
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
        form.setFieldsValue({ items });
        // update summary: last added is last index
        updateSummary(items, items.length - 1);
      }
    } catch (err) {
      console.error("Fetch product error:", err);
      message.error("Failed to fetch product");
    }
  };

  /** 🔹 Submit Handler (unchanged) */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        supplier_name: values.supplier_name,
        received_date: values.received_date
          ? dayjs(values.received_date).toDate()
          : new Date(),
        remarks: values.remarks,
        status: values.status,
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

  // utility to compute summary from items array and optionally set lastAddedIndex
  const updateSummary = (items = [], lastAddedIndex = -1) => {
    let qty = 0;
    let value = 0;
    (items || []).forEach((it) => {
      const q = Number(it.quantity || 0);
      const p = Number(it.unit_price || 0);
      qty += q;
      value += q * p;
    });
    setSummary({
      items: items || [],
      count: (items || []).length,
      qty,
      value,
      lastAddedIndex,
    });
  };

  // Called whenever any form value changes — keeps right column live
  const onValuesChange = (_, allValues) => {
    const items = allValues.items || [];
    // lastAddedIndex remains -1 here because we only know additions via handleProductCode.
    // But if you want the last changed index, you'd need more logic; keeping -1 is safe.
    updateSummary(items, -1);
  };

  // initial summary load
  useEffect(() => {
    const items = form.getFieldValue("items") || [];
    updateSummary(items, -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      title: "Product Code",
      dataIndex: "product_code",
      key: "product_code",
      width: 140,
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Quantity",
      key: "quantity",
      width: 120,
      render: (_, record, index) => (
        <Form.Item
          name={[index, "quantity"]}
          rules={[{ required: true, message: "Enter qty" }]}
          style={{ margin: 0 }}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      ),
    },
    {
      title: "Unit Price",
      key: "unit_price",
      width: 140,
      render: (_, record, index) => (
        <Form.Item
          name={[index, "unit_price"]}
          rules={[{ required: true, message: "Enter price" }]}
          style={{ margin: 0 }}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      ),
    },
    {
      title: "Unit",
      key: "unit",
      width: 110,
      render: (_, record, index) => (
        <Form.Item name={[index, "unit"]} style={{ margin: 0 }}>
          <Input />
        </Form.Item>
      ),
    },
    {
      title: "Expiry Date",
      key: "expiry_date",
      width: 160,
      render: (_, record, index) => (
        <Form.Item name={[index, "expiry_date"]} style={{ margin: 0 }}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, __, index) => (
        <Form.Item shouldUpdate style={{ margin: 0 }}>
          {() => (
            <Button
              danger
              onClick={() => {
                const items = form.getFieldValue("items") || [];
                items.splice(index, 1);
                form.setFieldsValue({ items });
                updateSummary(items, -1);
              }}
            >
              Remove
            </Button>
          )}
        </Form.Item>
      ),
    },
  ];

  return (
    <div style={{ padding: 5 }}>
      <Row gutter={16} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            {id ? "Edit Order" : "Add Order"}
          </Title>
          <Text type="secondary">Create Order entries quickly using product codes</Text>
        </Col>
        <Col>
          <Space>
            <button className='bg-[#1C2244] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer' onClick={() => navigate("/inward/list")}>Back to list</button>
          </Space>
        </Col>
      </Row>

      <div spinning={loading} className="mt-10">
        <div gutter={16} className="">
          {/* Left: form + table */}
          <div xs={24} lg={16}>
            <div className="" bodyStyle={{ padding: 16 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ status: "pending", items: [] }}
                onValuesChange={onValuesChange}
              >
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Vendor Name"
                      name="supplier_name"
                      rules={[{ required: true, message: "Please enter supplier name" }]}
                    >
                <input
                type='text'
                placeholder='Enter Name'
                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
              />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Received Date"
                      name="received_date"
                      rules={[{ required: true, message: "Please select date" }]}
                    >
                <input
                type='date'
                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
              />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item label="Status" name="status">
                      <select className="w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white">
                        <option value="pending">Pending</option>
                        <option value="received">Received</option>
                        <option value="pending">Approval</option>
                        <option value="received">Completed</option>
                      </select>
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item label="Scan/Enter Product Code" shouldUpdate={false}>
                      <input
                      className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
                        placeholder="Scan or type code, press Enter"
                        onPressEnter={(e) => {
                          e.preventDefault(""); 
                          handleProductCode(e); // only add/update product
                        }}
                        allowClear
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Divider style={{ margin: "8px 0 16px 0" }} />
                    <Form.List name="items">
                      {(fields, { remove }) => {
                        const items = form.getFieldValue("items") || [];
                        return (
                          <Table
                            dataSource={items}
                            columns={columns}
                            pagination={false}
                            rowKey={(record, idx) => idx}
                            size="small"
                          />
                        );
                      }}
                    </Form.List>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>

          {/* Right: dynamic visual summary */}
          {/* <div xs={24} lg={8}>
            <Card bordered size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text type="secondary">Items</Text>
                  <div style={{ marginTop: 8 }}>
                    <Title level={3} style={{ margin: 0 }}>
                      {summary.count}
                    </Title>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text type="secondary">Total Qty</Text>
                  <div>
                    <Text strong>{summary.qty}</Text>
                  </div>
                  <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                    Total Value
                  </Text>
                  <div>
                    <Text strong>{summary.value.toFixed(2)}</Text>
                  </div>
                </div>
              </div>

              <Divider />

              <Text type="secondary">Recent items</Text>
              <div style={{ marginTop: 8 }}>
                <List
                  size="small"
                  dataSource={summary.items.slice().reverse().slice(0, 6)} // show up to 6 recent
                  renderItem={(item, idx) => {
                    // compute original index to detect last added if needed
                    const originalIndex = summary.items.length - 1 - idx;
                    const isLast = originalIndex === summary.lastAddedIndex;
                    return (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                              <div>
                                {isLast ? <Badge status="success" text={item.product_name || item.product_code} /> : (item.product_name || item.product_code)}
                              </div>
                              <div style={{ minWidth: 110, textAlign: "right" }}>
                                <Text>{(item.quantity || 0)} × {(item.unit_price || 0).toFixed ? (item.unit_price || 0).toFixed(2) : item.unit_price}</Text>
                              </div>
                            </div>
                          }
                          description={item.product_code ? <Text type="secondary">{item.product_code}</Text> : null}
                        />
                      </List.Item>
                    );
                  }}
                />
                {summary.items.length === 0 && <Text type="secondary">No items added yet</Text>}
              </div>
            </Card>

            <Card bordered size="small">
              <Text type="secondary">Guidance</Text>
              <div style={{ marginTop: 8 }}>
                <Text>
                  Use the scan field to add products quickly. The summary and recent list update live.
                </Text>
              </div>
            </Card>
          </div> */}

                            <div xs={24} className="flex justify-end mt-10">
                    <Space>
                      <button className="bg-[#1C2244] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer" type="primary" htmlType="submit" loading={loading}>
                        {id ? "Update Order" : "Add Order"}
                      </button>
                      <button className="bg-white border border-gray-400 text-black py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer" onClick={() => navigate("/inward/list")}>Cancel</button>
                    </Space>
                  </div>
        </div>
      </div>
    </div>
  )
}

export default AddOrder