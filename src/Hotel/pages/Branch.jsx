
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Dropdown,
  Form,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Popover,
  Menu,
  Tag,
  message,
  Space,
} from "antd";
import {
  FilterOutlined,
  EllipsisOutlined,
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import { branchServices } from "../services/HotelServices";
import { addressServices } from "../services/AddressServices";

const { Option } = Select;

const getUniqueValues = (data, key) =>
  [...new Set(data.map((item) => item[key]))].filter(Boolean);

const FiltersPopover = ({ onApply, dataSource, currentFilters }) => {
  const [filters, setFilters] = useState({
    name: currentFilters.name,
    status: currentFilters.status,
  });

  const branches = getUniqueValues(dataSource, "name");
  const statuses = getUniqueValues(dataSource, "status");

  const onChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const renderPopoverContent = (field, options) => (
    <div>
      <div style={{ marginBottom: 3, fontWeight: "bold", color: "#555" }}>
        {field.charAt(0).toUpperCase() + field.slice(1)}
      </div>
      <Select
        value={filters[field]}
        onChange={(val) => onChange(field, val)}
        placeholder={`Select ${field.charAt(0).toUpperCase() + field.slice(1)}`}
        style={{ width: 180 }}
        allowClear
      >
        {options.map((opt) => (
          <Option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1).toLowerCase()}
          </Option>
        ))}
      </Select>
    </div>
  );

  return (
    <div style={{ padding: 10, width: 200 }}>
      {["name", "status"].map((field) => (
        <div key={field} style={{ marginBottom: 15 }}>
          <Popover
            content={renderPopoverContent(
              field,
              field === "name" ? branches : statuses
            )}
            trigger="hover"
            placement="right"
          >
            <div
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: filters[field] ? "#1890ff" : "inherit",
              }}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {filters[field] && (
                <span className="ml-2 text-xs text-gray-500">(1)</span>
              )}
            </div>
          </Popover>
        </div>
      ))}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Button
          danger
          size="small"
          onClick={() => {
            setFilters({});
            onApply({});
          }}
          disabled={Object.values(filters).every((val) => !val)}
        >
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => onApply(filters)}
          disabled={Object.values(filters).every((val) => !val)}
          style={{ marginLeft: 8 }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

const Branch = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [branchData, setBranchData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const { contentBgColor, primaryColor } = useTheme();
  const [country, setCountry] = useState([]);
  const [state, setState] = useState([]);
  const [city, setCity] = useState([]);

  // Fetch country, state, and city data
  const fetchCountry = async () => {
    try {
      const response = await addressServices.getCountry();
      setCountry(response.data || []);
    } catch (error) {
      console.error("Error fetching country data:", error);
      messageApi.error("Failed to fetch countries");
    }
  };

  const fetchState = async (countryId) => {
    try {
      const response = await addressServices.getState(countryId);
      setState(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching state data:", error);
      messageApi.error("Failed to fetch states");
      setState([]);
    }
  };

  const fetchCity = async (stateId) => {
    try {
      const response = await addressServices.getCity(stateId);
      setCity(response.data || []);
    } catch (error) {
      console.error("Error fetching city data:", error);
      messageApi.error("Failed to fetch cities");
      setCity([]);
    }
  };

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await branchServices.getBranch();
      if (!response.success) {
        messageApi.error("Failed to fetch branches");
        return;
      }
      const branchesArray = Array.isArray(response.data.data.branches)
        ? response.data.data.branches
        : [];
      const data = branchesArray.map((branch) => ({
        ...branch,
        key: branch.id,
      }));
      setBranchData(data);
      setFilteredData(data);
    } catch (error) {
      messageApi.error("Failed to fetch branches");
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchCountry();
        await fetchBranches();
      } catch (error) {
        console.error("Error initializing data:", error);
        messageApi.error("Failed to initialize data");
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  // Handle country and state changes for cascading dropdowns
  const handleCountryChange = async (countryId) => {
    form.setFieldsValue({ state: undefined, city: undefined });
    setState([]);
    setCity([]);
    if (countryId) {
      await fetchState(countryId);
    }
  };

  const handleStateChange = async (stateId) => {
    form.setFieldsValue({ city: undefined });
    setCity([]);
    if (stateId) {
      await fetchCity(stateId);
    }
  };

  // Create branch
  const handleFormSubmit = async (values) => {
    // Validate required dropdown fields
    if (
      !values.country ||
      !values.state ||
      !values.city ||
      !values.country_code
    ) {
      messageApi.error("Please select country, state, city, and country code");
      return;
    }

    setLoading(true);
    try {
      const branchPayload = {
        name: values.branch,
        description: values.description || "",
        phone: values.phone,
        country_code: values.country_code,
        email: values.email,
        address_line1: values.address_line1,
        address_line2: values.address_line2 || "",
        city: Number(values.city),
        state: Number(values.state),
        country: Number(values.country),
        pincode: Number(values.pincode),
        created_by: 1,
      };
      console.log("Payload sent to server:", branchPayload);
      const result = await branchServices.createBranch(branchPayload);
      if (!result.success) {
        const errorMsg =
          result.error?.details || // Use details from backend
          result.error?.message ||
          "Failed to create branch";
        messageApi.error(errorMsg);
        console.log("Create branch failed:", result.error);
        return;
      }
      messageApi.success(result.message || "Branch created successfully");
      setIsModalOpen(false);
      form.resetFields();
      fetchBranches();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error?.details ||
        error.response?.data?.message ||
        "Failed to create branch";
      messageApi.error(errorMsg);
      console.error("Error creating branch:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Update branch
  const handleEditSubmit = async (values) => {
    if (
      !values.country ||
      !values.state ||
      !values.city ||
      !values.country_code
    ) {
      messageApi.error("Please select country, state, city, and country code");
      return;
    }

    setLoading(true);
    try {
      const branchPayload = {
        name: values.branch,
        description: values.description || "",
        phone: values.phone,
        country_code: values.country_code,
        email: values.email,
        status: values.status,
        address_line1: values.address_line1,
        address_line2: values.address_line2 || "",
        city: Number(values.city),
        state: Number(values.state),
        country: Number(values.country),
        pincode: Number(values.pincode),
        updated_by: 1,
      };
      console.log("Update payload:", branchPayload);
      const result = await branchServices.updateBranch(
        currentBranch.id,
        branchPayload
      );
      if (!result.success) {
        const errorMsg =
          result.error?.details ||
          result.error?.message ||
          "Failed to update branch";
        messageApi.error(errorMsg);
        return;
      }
      messageApi.success(result.message || "Branch updated successfully");
      setIsEditModalOpen(false);
      editForm.resetFields();
      fetchBranches();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error?.details ||
        error.response?.data?.message ||
        "Failed to update branch";
      messageApi.error(errorMsg);
      console.error("Error updating branch:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Delete branch
  const handleDelete = async (id) => {
    try {
      const result = await branchServices.deleteBranch(id);
      if (!result.success) {
        messageApi.error("Failed to delete branch");
        return;
      }
      messageApi.success(result.message || "Branch deleted successfully");
      fetchBranches();
    } catch (error) {
      messageApi.error("Failed to delete branch");
      console.error("Error deleting branch:", error);
    }
  };

  // Filters & Search
  const applyFilters = (newFilters = filters, newSearch = searchText) => {
    let fd = [...branchData];
    if (newSearch) {
      fd = fd.filter((item) =>
        item.name.toLowerCase().includes(newSearch.toLowerCase())
      );
    }
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) fd = fd.filter((item) => item[key] === val);
    });
    setFilteredData(fd);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    applyFilters(filters, e.target.value);
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters, searchText);
  };

  // View/Edit row
  const handleViewBranch = (record) => {
    setCurrentBranch(record);
    setIsViewModalOpen(true);
  };

  const handleEditBranch = (record) => {
    setCurrentBranch(record);
    editForm.setFieldsValue({
      branch: record.name,
      description: record.description,
      phone: record.phone,
      country_code: record.country_code,
      email: record.email,
      address_line1: record.address_line1,
      address_line2: record.address_line2,
      city: record.city,
      state: record.state,
      country: record.country,
      pincode: record.pincode,
      status: record.status,
    });
    if (record.country) {
      fetchState(record.country).then(() => {
        if (record.state) {
          fetchCity(record.state);
        }
      });
    }
    setIsEditModalOpen(true);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 50,
      align: "center",
      render: (_, __, idx) => idx + 1,
    },
    {
      title: "Branch Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name) =>
        name
          ?.toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (phone, record) => `${record.country_code || ""} ${phone}`,
    },
    { title: "Email", dataIndex: "email", key: "email", width: 250 },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (name) =>
        name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "",
    },
    {
      title: "Address",
      key: "address",
      width: 300,
      render: (_, record) => {
        const parts = [
          record.address_line1,
          record.address_line2,
          record.cityRelation?.name,
          record.stateRelation?.name,
          record.countryRelation?.name,
          record.pincode,
        ].filter(Boolean);
        return parts.join(", ");
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag
          style={{
            color: status === "Active" ? "#52c41a" : "#f5222d",
            backgroundColor: status === "Active" ? "#f6ffed" : "#fff1f0",
            fontWeight: 500,
            border: `1px solid ${status === "Active" ? "#b7eb8f" : "#ffa39e"}`,
          }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View',
                onClick: () => handleViewBranch(record)
              },
              {
                key: 'edit', 
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => handleEditBranch(record)
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                onClick: () => handleDelete(record.id)
              }
            ]
          }}
          trigger={['click']}
        >
          <EllipsisOutlined className="cursor-pointer text-lg rotate-90" />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="max-w-full overflow-hidden">
        <div className="bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h1 className="text-xl font-semibold">Branch</h1>
            <div className="flex gap-2 items-center">
              <Input.Search
                placeholder="Search by branch name"
                value={searchText}
                onChange={handleSearchChange}
                allowClear
                style={{ width: 250 }}
              />
              <Popover
                content={
                  <FiltersPopover
                    dataSource={branchData}
                    currentFilters={filters}
                    onApply={handleFilterApply}
                  />
                }
                trigger="click"
                placement="bottomLeft"
              >
                <Button icon={<FilterOutlined />}>Filters</Button>
              </Popover>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Add Branch
              </Button>
            </div>
          </div>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          rowKey="key"
          scroll={{ x: "max-content" }}
          size="small"
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    padding: "8px 8px",
                    whiteSpace: "nowrap",
                  }}
                />
              ),
            },
          }}
        />

        {/* Add Branch Modal */}
        <Modal
          title="Add Branch"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={800}
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={handleFormSubmit}
            initialValues={{ status: "Active" }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="branch"
                  label="Branch Name"
                  rules={[
                    { required: true, message: "Please enter branch name" },
                    {
                      max: 100,
                      message: "Branch name cannot exceed 100 characters",
                    },
                  ]}
                >
                  <Input placeholder="Enter Branch Name" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Phone" required style={{ marginBottom: 0 }}>
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item
                      name="country_code"
                      rules={[
                        { required: true, message: "Country code is required" },
                      ]}
                      style={{ marginBottom: 0, width: "30%" }}
                    >
                      <Select
                        placeholder="+91"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        loading={loading}
                      >
                        {country.map((item) => (
                          <Option
                            key={item.country_code}
                            value={item.country_code}
                          >
                            {item.country_code}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="phone"
                      rules={[
                        { required: true, message: "Phone number is required" },
                        {
                          pattern: /^[0-9]{10}$/,
                          message: "Please enter a valid 10-digit phone number",
                        },
                        {
                          validator: (_, value) => {
                            if (value && !/^[1-9]/.test(value)) {
                              return Promise.reject(
                                new Error("Phone number cannot start with 0")
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      style={{ marginBottom: 0, width: "70%" }}
                    >
                      <Input
                        placeholder="Enter phone number"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="Enter Email" allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    {
                      max: 500,
                      message: "Description cannot exceed 500 characters",
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Enter Description"
                    allowClear
                    rows={2}
                  />
                </Form.Item>
              </Col>
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
                    loading={loading}
                  >
                    {country.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
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
                    loading={loading}
                    disabled={!state.length}
                  >
                    {state.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
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
                    loading={loading}
                    disabled={!city.length}
                  >
                    {city.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
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
                      message: "Please enter a valid 6-digit pincode",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter pincode"
                    maxLength={6}
                    inputMode="numeric"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="end" gutter={8}>
              <Col>
                <Button danger onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* View Branch Modal */}
        <Modal
          title="View Branch"
          open={isViewModalOpen}
          onCancel={() => setIsViewModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {currentBranch && (
            <div>
              <p>
                <strong>Branch Name:</strong> {currentBranch.name}
              </p>
              <p>
                <strong>Phone:</strong> {currentBranch.country_code || ""}{" "}
                {currentBranch.phone}
              </p>
              <p>
                <strong>Email:</strong> {currentBranch.email}
              </p>
              <p>
                <strong>Status:</strong> {currentBranch.status}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {currentBranch.description || "N/A"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {[
                  currentBranch.address_line1,
                  currentBranch.address_line2,
                  currentBranch.cityRelation?.name,
                  currentBranch.stateRelation?.name,
                  currentBranch.countryRelation?.name,
                  currentBranch.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          )}
        </Modal>

        {/* Edit Branch Modal */}
        <Modal
          title="Edit Branch"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          footer={null}
          width={800}
        >
          <Form layout="vertical" form={editForm} onFinish={handleEditSubmit}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="branch"
                  label="Branch Name"
                  rules={[
                    { required: true, message: "Please enter branch name" },
                    {
                      max: 100,
                      message: "Branch name cannot exceed 100 characters",
                    },
                  ]}
                >
                  <Input placeholder="Enter Branch Name" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Phone" required style={{ marginBottom: 0 }}>
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item
                      name="country_code"
                      rules={[
                        { required: true, message: "Country code is required" },
                      ]}
                      style={{ marginBottom: 0, width: "30%" }}
                    >
                      <Select
                        placeholder="+91"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        loading={loading}
                      >
                        {country.map((item) => (
                          <Option
                            key={item.country_code}
                            value={item.country_code}
                          >
                            {item.country_code}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="phone"
                      rules={[
                        { required: true, message: "Phone number is required" },
                        {
                          pattern: /^[0-9]{10}$/,
                          message: "Please enter a valid 10-digit phone number",
                        },
                        {
                          validator: (_, value) => {
                            if (value && !/^[1-9]/.test(value)) {
                              return Promise.reject(
                                new Error("Phone number cannot start with 0")
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      style={{ marginBottom: 0, width: "70%" }}
                    >
                      <Input
                        placeholder="Enter phone number"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="Enter Email" allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    {
                      max: 500,
                      message: "Description cannot exceed 500 characters",
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Enter Description"
                    allowClear
                    rows={3}
                  />
                </Form.Item>
              </Col>
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
                    loading={loading}
                  >
                    {country.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
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
                    loading={loading}
                    disabled={!state.length}
                  >
                    {state.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
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
                    loading={loading}
                    disabled={!city.length}
                  >
                    {city.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
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
                      message: "Please enter a valid 6-digit pincode",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter pincode"
                    maxLength={6}
                    inputMode="numeric"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select status" allowClear>
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                    <Option value="Closed">Closed</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row justify="end" gutter={8}>
              <Col>
                <Button danger onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default Branch;
