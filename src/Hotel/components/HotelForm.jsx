import React, { useEffect, useState, useCallback } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Upload,
  Modal,
  message,
  Tabs,
  Space,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PictureOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import { addressServices } from "../services/AddressServices";
import { openDB } from "idb";

const { Option } = Select;
const { TabPane } = Tabs;

// IndexedDB setup
const dbPromise = openDB("CompanyFormDB", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images", { keyPath: "id" });
    }
  },
});

// Fields to validate per tab
const TAB_FIELDS = {
  companyDetails: ["name", "short_name", "country_code", "phone", "email", "gst_no"],
  address: [
    "address_line1",
    "country",
    "state",
    "city",
    "pincode",
    "billing_address_line1",
    "billing_country",
    "billing_state",
    "billing_city",
    "billing_pincode",
  ],
  logo: [], // handled separately
};

// Add this debounce function at the top level
const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

const CompanyForm = ({ isModalOpen, setIsModalOpen, onFinish }) => {
  const [form] = Form.useForm();

  // File upload list
  const [fileList, setFileList] = useState([]);

  // Loading state for submit
  const [loading, setLoading] = useState(false);

  // Address dropdown data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [billingStates, setBillingStates] = useState([]);
  const [billingCities, setBillingCities] = useState([]);

  // Per‐tab validation status: 'success' | 'error' | null
  const [tabStatus, setTabStatus] = useState({
    companyDetails: null,
    address: null,
    logo: null,
  });

  // Fetch country list once on mount
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await addressServices.getCountry();
        setCountries(response.data || []);
      } catch (err) {
        console.error("Error fetching countries:", err);
        message.error("Failed to fetch countries");
      }
    };
    fetchCountry();
  }, []);

  // Generic fetch‐states helper
  const fetchStatesFor = useCallback(async (countryId, setter) => {
    try {
      const res = await addressServices.getState(countryId);
      const data = res.data?.data || res.data || [];
      setter(data);
    } catch (err) {
      console.error("Error fetching states:", err);
      message.error("Failed to fetch states");
      setter([]);
    }
  }, []);

  // Generic fetch‐cities helper
  const fetchCitiesFor = useCallback(async (stateId, setter) => {
    try {
      const res = await addressServices.getCity(stateId);
      setter(res.data || []);
    } catch (err) {
      console.error("Error fetching cities:", err);
      message.error("Failed to fetch cities");
      setter([]);
    }
  }, []);

  // Handlers for address dropdown changes
  const handleCountryChange = async (countryId) => {
    form.setFieldsValue({ state: undefined, city: undefined });
    setCities([]);
    if (countryId) {
      try {
        await fetchStatesFor(countryId, setStates);
      } catch (err) {
        console.error("Error fetching states:", err);
        // Don't show error message here as fetchStatesFor already does
      }
    } else {
      setStates([]);
    }
  };

  const handleStateChange = async (stateId) => {
    form.setFieldsValue({ city: undefined });
    if (stateId) {
      try {
        await fetchCitiesFor(stateId, setCities);
      } catch (err) {
        console.error("Error fetching cities:", err);
        // Don't show error message here as fetchCitiesFor already does
      }
    } else {
      setCities([]);
    }
  };

  const handleBillingCountryChange = async (countryId) => {
    form.setFieldsValue({ billing_state: undefined, billing_city: undefined });
    setBillingCities([]);
    if (countryId) {
      await fetchStatesFor(countryId, setBillingStates);
    } else {
      setBillingStates([]);
    }
  };

  const handleBillingStateChange = async (stateId) => {
    form.setFieldsValue({ billing_city: undefined });
    if (stateId) {
      await fetchCitiesFor(stateId, setBillingCities);
    } else {
      setBillingCities([]);
    }
  };

  // Convert file to Base64 string
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // Store image into IndexedDB with better error handling
  const storeImageInIndexedDB = async (uid, base64) => {
    try {
      const db = await dbPromise;
      await db.put("images", { id: uid, base64 });
      // Remove success message to reduce UI noise
    } catch (err) {
      console.error("IndexedDB store error:", err);
      message.error("Failed to store logo locally");
    }
  };

  // Handle file upload change with optimized processing
  const handleFileChange = async ({ fileList: newList }) => {
    // Only keep the latest upload
    const latestList = newList.slice(-1);
    setFileList(latestList);

    if (latestList.length) {
      const fileObj = latestList[0].originFileObj;
      if (fileObj) {
        try {
          const base64 = await getBase64(fileObj);
          await storeImageInIndexedDB(latestList[0].uid, base64);
        } catch (err) {
          console.error("File processing error:", err);
          message.error("Failed to process image");
        }
      }
    }
  };

  // Enforce only images < 2MB
  const beforeUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      message.error("Only image files are allowed");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 >= 2) {
      message.error("Image must be < 2MB");
      return Upload.LIST_IGNORE;
    }
    return false; // prevent automatic upload
  };

  // Validate a single tab by its key
  const validateTab = async (key) => {
    try {
      console.log(`Validating tab: ${key}`);
      if (key === "logo") {
        const ok = fileList.length > 0;
        console.log(`Logo validation result: ${ok}`);
        setTabStatus((prev) => ({ ...prev, logo: ok ? "success" : "error" }));
        return ok;
      }
      await form.validateFields(TAB_FIELDS[key]);
      console.log(`${key} validation successful`);
      setTabStatus((prev) => ({ ...prev, [key]: "success" }));
      return true;
    } catch (error) {
      console.log(`${key} validation failed:`, error);
      setTabStatus((prev) => ({ ...prev, [key]: "error" }));
      return false;
    }
  };

  // On any field change, re-validate "companyDetails" and "address" with debounce
  const debouncedValidation = useCallback(
    debounce(() => {
      validateTab("companyDetails");
      validateTab("address");
    }, 300),
    []
  );

  const handleFieldsChange = () => {
    debouncedValidation();
  };

  // Re-validate logo whenever fileList changes
  useEffect(() => {
    validateTab("logo");
  }, [fileList]);

  // Compute whether all tabs are valid
  const allTabsValid = ["companyDetails", "address", "logo"].every(
    (tab) => tabStatus[tab] === "success"
  );

  // Submit handler with improved error handling
  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Use Promise.all for parallel validation
      const [okCompany, okAddress, okLogo] = await Promise.all([
        validateTab("companyDetails"),
        validateTab("address"),
        validateTab("logo")
      ]);
      
      if (!okCompany || !okAddress || !okLogo) {
        setLoading(false);
        return;
      }
  
      // Retrieve stored Base64 for logo
      let logoDataUrl = "";
      if (fileList.length > 0) {
        try {
          const db = await dbPromise;
          const stored = await db.get("images", fileList[0].uid);
          logoDataUrl = stored?.base64 || "";
        } catch (err) {
          console.error("Error retrieving logo from IndexedDB:", err);
          message.warning("Could not retrieve logo data, proceeding without logo");
        }
      }
  
      // Build payload with numeric conversions and error handling
      const payload = {
        ...values,
        country: Number(values.country) || 0,
        state: Number(values.state) || 0,
        city: Number(values.city) || 0,
        pincode: Number(values.pincode) || 0,
        billing_country: Number(values.billing_country) || 0,
        billing_state: Number(values.billing_state) || 0,
        billing_city: Number(values.billing_city) || 0,
        billing_pincode: Number(values.billing_pincode) || 0,
        logo: logoDataUrl,
      };
  
      const result = await onFinish(payload);
      if (result?.success) {
        message.success(result.message || "Company created successfully");
        // Reset everything
        form.resetFields();
        setFileList([]);
        setStates([]);
        setCities([]);
        setBillingStates([]);
        setBillingCities([]);
        try {
          const db = await dbPromise;
          await db.clear("images");
        } catch (err) {
          console.error("Error clearing IndexedDB:", err);
        }
        setIsModalOpen(false);
      } else {
        message.error(result?.error || "Failed to create company");
      }
    } catch (err) {
      console.error("Submission error:", err);
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Network or server error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancel/close modal
  const handleCancel = async () => {
    form.resetFields();
    setFileList([]);
    setStates([]);
    setCities([]);
    setBillingStates([]);
    setBillingCities([]);
    const db = await dbPromise;
    await db.clear("images");
    setIsModalOpen(false);
  };

  // Helper to render tab icon based on status
  const getTabIcon = (key) => {
    if (tabStatus[key] === "success") {
      return <CheckCircleTwoTone twoToneColor="#52c41a" className="ml-1" />;
    }
    if (tabStatus[key] === "error") {
      return <CloseCircleTwoTone twoToneColor="#ff4d4f" className="ml-1" />;
    }
    return null;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      title={<div className="text-xl font-semibold">Add Company</div>}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width="90vw"
      style={{ maxWidth: "800px", top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        initialValues={{ status: "Active" }}
        onFieldsChange={handleFieldsChange}
        className="w-full"
      >
        <Tabs defaultActiveKey="companyDetails">
          {/* Company Information Tab */}
          <TabPane
            tab={
              <span>
                <UserOutlined /> Company Information {getTabIcon("companyDetails")}
              </span>
            }
            key="companyDetails"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Company Name"
                  rules={[
                    { required: true, message: "Please enter company name" },
                  ]}
                >
                  <Input placeholder="Enter company name" maxLength={25} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="short_name"
                  label="Short Name"
                  rules={[
                    { required: true, message: "Please enter short name" },
                  ]}
                >
                  <Input placeholder="Enter short name" maxLength={10} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Phone" required style={{ marginBottom: 0 }}>
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item
                      name="country_code"
                      rules={[{ required: true, message: "Country code is required" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        style={{ width: "70px" }}
                        placeholder="+91"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                      >
                        {countries.map((c) => (
                          <Option key={c.country_code} value={c.country_code}>
                            {c.country_code}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="phone" 
                      rules={[
                        { required: true, message: "Phone number is required" },
                        {
                          pattern: /^[1-9][0-9]{9}$/,
                          message: "Enter a valid 10-digit phone number (no leading 0)",
                        },
                      ]}
                      style={{ marginBottom: 0, flex: 1 }}
                    >
                      <Input placeholder="Enter phone number" maxLength={10} />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="Enter email" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="gst_no"
                  label="GST Number"
                  rules={[
                    { required: true, message: "Please enter GST number" },
                    {
                      pattern:
                        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                      message: "Please enter a valid GST number",
                    },
                  ]}
                >
                  <Input placeholder="Enter GST number" />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          {/* Address Information Tab */}
          <TabPane
            tab={
              <span>
                <HomeOutlined /> Address Information {getTabIcon("address")}
              </span>
            }
            key="address"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="address_line1"
                  label="Address Line 1"
                  rules={[{ required: true, message: "Please enter address" }]}
                >
                  <Input.TextArea rows={2} placeholder="Enter address line 1" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="address_line2" label="Address Line 2">
                  <Input.TextArea rows={2} placeholder="Enter address line 2" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="country"
                  label="Country"
                  rules={[{ required: true, message: "Please select country" }]}
                >
                  <Select
                    placeholder="Select country"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    onChange={handleCountryChange}
                  >
                    {countries.map((c) => (
                      <Option key={c.id} value={c.id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="state"
                  label="State"
                  rules={[{ required: true, message: "Please select state" }]}
                >
                  <Select
                    placeholder="Select state"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    onChange={handleStateChange}
                  >
                    {states.map((s) => (
                      <Option key={s.id} value={s.id}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: "Please select city" }]}
                >
                  <Select
                    placeholder="Select city"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {cities.map((ct) => (
                      <Option key={ct.id} value={ct.id}>
                        {ct.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="pincode"
                  label="Pincode"
                  rules={[
                    { required: true, message: "Please enter pincode" },
                    {
                      pattern: /^\d{6}$/,
                      message:
                        "Please enter a valid 6-digit pincode (India-specific)",
                    },
                  ]}
                >
                  <Input placeholder="Enter pincode" maxLength={6} />
                </Form.Item>
              </Col>


              {/* <Col xs={24} sm={8}>
  <Form.Item
    name="status"
    label="Status"
    initialValue="Active"
    rules={[{ required: true, message: "Please select status" }]}
  >
    <Select placeholder="Select status">
      <Option value="Active">Active</Option>
      <Option value="Inactive">Inactive</Option>
      <Option value="Closed">Closed</Option>
    </Select>
  </Form.Item>
</Col> */}

              <Col span={24}>
                <div className="border-t border-gray-200 my-4 pt-4">
                  <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="billing_address_line1"
                  label="Billing Address Line 1"
                  rules={[{ required: true, message: "Enter billing address" }]}
                >
                  <Input.TextArea rows={2} placeholder="Billing address line 1" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="billing_address_line2" label="Billing Address Line 2">
                  <Input.TextArea rows={2} placeholder="Billing address line 2" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="billing_country"
                  label="Billing Country"
                  rules={[{ required: true, message: "Select billing country" }]}
                >
                  <Select
                    placeholder="Select billing country"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    onChange={handleBillingCountryChange}
                  >
                    {countries.map((c) => (
                      <Option key={c.id} value={c.id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="billing_state"
                  label="Billing State"
                  rules={[{ required: true, message: "Select billing state" }]}
                >
                  <Select
                    placeholder="Select billing state"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    onChange={handleBillingStateChange}
                  >
                    {billingStates.map((bs) => (
                      <Option key={bs.id} value={bs.id}>
                        {bs.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="billing_city"
                  label="Billing City"
                  rules={[{ required: true, message: "Select billing city" }]}

                >
                  <Select
                    placeholder="Select billing city"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {billingCities.map((bc) => (
                      <Option key={bc.id} value={bc.id}>
                        {bc.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="billing_pincode"
                  label="Billing Pincode"
                  rules={[
                    { required: true, message: "Enter billing pincode" },
                    {
                      pattern: /^\d{6}$/,
                      message: "Enter a valid 6-digit pincode",
                    },
                  ]}
                >
                  <Input placeholder="Enter billing pincode" maxLength={6} />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          {/* Company Logo Tab */}
          <TabPane
            tab={
              <span>
                <PictureOutlined /> Company Logo {getTabIcon("logo")}  </span>
            }
            key="logo"
          >
            <Row>
              <Col xs={24}>
                <Form.Item
                  name="logo"
                  label="Company Logo"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                >
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleFileChange}
                    beforeUpload={beforeUpload}
                    accept="image/*"
                    maxCount={1}
                    showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                  >
                    {fileList.length < 1 && uploadButton}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button danger onClick={handleCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full sm:w-auto"
            loading={loading}
            disabled={!allTabsValid}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CompanyForm;
