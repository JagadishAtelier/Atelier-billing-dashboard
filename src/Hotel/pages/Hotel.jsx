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
  Popover,
  Menu,
  message,
  Modal,
  Tag,
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
import CompanyForm from "../components/HotelForm";
import { companyService } from "../services/HotelServices";

const { Option } = Select;

// Utility to get unique values from data
const getUniqueValues = (data, key) =>
  [...new Set(data.map((item) => item[key]))].filter(Boolean);

// FiltersPopover component (unchanged)
const FiltersPopover = ({ onApply, dataSource, currentFilters }) => {
  const [filters, setFilters] = useState({
    status: currentFilters.status || null,
  });

  const statuses = getUniqueValues(dataSource || [], "status");

  const onChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const renderPopoverContent = (field) => {
    let options = [];

    switch (field) {
      case "status":
        options = statuses;
        break;
      default:
        break;
    }

    return (
      <div>
        <div style={{ marginBottom: 3, fontWeight: "bold", color: "#555" }}>
          {field.charAt(0).toUpperCase() + field.slice(1)}
        </div>
        <Select
          value={filters[field]}
          onChange={(val) => onChange(field, val)}
          placeholder={`Select ${field}`}
          style={{ width: 180 }}
          allowClear
        >
          {options.map((opt) => (
            <Option key={opt} value={opt}>
              {opt}
            </Option>
          ))}
        </Select>
      </div>
    );
  };

  return (
    <div style={{ padding: 10, width: 200, height: "auto" }}>
      {["status"].map((field) => (
        <div key={field} style={{ marginBottom: 15 }}>
          <Popover
            content={renderPopoverContent(field)}
            trigger="hover"
            placement="right"
            mouseEnterDelay={0.1}
            mouseLeaveDelay={0.1}
          >
            <div
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                width: 100,
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
      <div style={{ textAlign: "center", marginTop: 20 }} className="space-x-2">
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
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

// Define columns as a constant, parameterized by dependencies
const getColumns = (pagination, handleMenuClick) => [
  {
    title: "S.No",
    key: "serialNumber",
    width: 70,
    render: (_, __, index) =>
      (pagination.current - 1) * pagination.pageSize + index + 1,
    fixed: "left",
  },
  { title: "Company Name", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Phone", dataIndex: "phone", key: "phone", width: 120 },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
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
    render: (_, record) => (
      <Dropdown
        menu={{
          items: [
            {
              key: 'view',
              icon: <EyeOutlined />,
              label: 'View',
            },
            {
              key: 'edit', 
              icon: <EditOutlined />,
              label: 'Edit',
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Delete',
            }
          ],
          onClick: (e) => handleMenuClick(record, e)
        }}
        trigger={["click"]}
      >
        <EllipsisOutlined className="cursor-pointer text-lg rotate-90" />
      </Dropdown>
    ),
  },
];

// Main Component
const Hotel = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [hovered, setHovered] = useState(false);

  // const { contentBgColor, primaryColor } = useTheme();

  // Fetch companies data

  // const fetchCompanies = async (page = 1, limit = 10) => {
  //   try {
  //     setLoading(true);
  //     const params = {
  //       page,
  //       limit,
  //       search: searchText,
  //       ...filters,
  //     };

  //     const response = await companyService.getCompany(params);
  //     console.log(response);

  //     if (response.success) {
  //       setCompanies(response.data.companies || []);
  //       setPagination({
  //         current: response.data.pagination.page,
  //         pageSize: response.data.pagination.limit,
  //         total: response.data.pagination.total,
  //       });
  //     } else {
  //       message.error("Failed to fetch companies");
  //     }
  //   } catch (error) {
  //     message.error("Error fetching companies: " + (error.message || "Unknown error"));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchCompanies = async (page = 1, limit = 10) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
        search: searchText,
        ...filters,
      };

      const response = await companyService.getCompany(params);
      if (response.success && response.data?.data) {
        setCompanies(response.data.data);
        setPagination({
          current: response.data.meta?.page || 1,
          pageSize: response.data.meta?.limit || 10,
          total: response.data.meta?.total || 0,
        });
      } else {
        messageApi.error("Failed to fetch companies");
        setCompanies([]);
        setPagination({ current: 1, pageSize: 10, total: 0 });
      }
      const { data: resp } = response;
      const companiesList = resp.data || [];
      const { page: current, limit: pageSize, total } = resp.meta || {};

      setCompanies(companiesList);
      setPagination({ current, pageSize, total });
    } catch (error) {
      messageApi.error(
        "Error fetching companies: " + (error.message || "Unknown error")
      );
      setCompanies([]);
      setPagination({ current: 1, pageSize: 10, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCompanies();
  }, [filters, searchText]);

  // Handle search
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSearch = () => {
    fetchCompanies(1, pagination.pageSize);
  };

  // Handle filter apply
  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    fetchCompanies(pagination.current, pagination.pageSize);
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      const response = await companyService.createCompany(formData);

      if (response.success) {
        messageApi.success("Company created successfully");
        setIsModalOpen(false);
        fetchCompanies();
      } else {
        messageApi.error("Failed to create company");
      }

      return response;
    } catch (error) {
      messageApi.error(
        "Error creating company: " + (error.message || "Unknown error")
      );
      return {
        success: false,
        error: "Error creating company: " + (error.message || "Unknown error"),
      };
    }
  };

  // Delete company by ID
  const handleDelete = async (id) => {
    try {
      const result = await companyService.deleteCompany(id);
      if (result.success) {
        messageApi.success(result.message || "Company deleted successfully");
        fetchCompanies();
      } else {
        messageApi.error("Failed to delete company");
      }

      return result; 
    } catch (error) {
      messageApi.error(
        "Error deleting company: " + (error.message || "Unknown error")
      );
    }
  };

  // Handle menu actions (view, edit, delete)
  const handleMenuClick = async (record, e) => {
    const { key } = e;

    switch (key) {
      case "view":
        try {
          const response = await companyService.getCompanyById(record.id);
          if (response.success && response.data) {
            Modal.info({
              title: "Company Details",
              content: (
                <div>
                  <p>
                    <strong>Name:</strong> {response.data.name || "N/A"}
                  </p>
                  <p>
                    <strong>Short Name:</strong>{" "}
                    {response.data.short_name || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {response.data.email || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {response.data.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong> {response.data.status || "Unknown"}
                  </p>
                  <p>
                    <strong>Address Line 1:</strong>{" "}
                    {response.data.address_line1 || "N/A"}
                  </p>
                  <p>
                    <strong>Address Line 2:</strong>{" "}
                    {response.data.address_line2 || "N/A"}
                  </p>
                </div>
              ),
              width: 500,
            });
          } else {
            messageApi.error("Failed to fetch company details");
          }
        } catch (error) {
          messageApi.error(
            "Error fetching company details: " +
              (error.message || "Unknown error")
          );
        }
        break;

      case "edit":
        messageApi.info("Edit functionality to be implemented");
        break;

      case "delete":
        Modal.confirm({
          title: "Are you sure you want to delete this company?",
          content: "This action cannot be undone.",
          okText: "Yes, Delete",
          okType: "danger",
          cancelText: "Cancel",

          onOk: () => handleDelete(record.id),
        });
        break;

      default:
        break;
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  return (
    <div className="max-w-full overflow-hidden">
      {contextHolder}
      {/* Responsive Header */}
      <div className="bg-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h1 className="text-xl font-semibold">Hotel</h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-[250px] min-w-[200px]">
              <Input.Search
                placeholder="Search by name"
                value={searchText}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                className="w-full"
                allowClear
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
              <Popover
                content={
                  <FiltersPopover
                    dataSource={companies}
                    currentFilters={filters}
                    onApply={handleFilterApply}
                  />
                }
                trigger="click"
                placement="bottomLeft"
              >
                <Button
                  icon={<FilterOutlined />}
                  className="w-full sm:w-auto"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  Filters
                </Button>
              </Popover>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto"
              >
                Add Company
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Table with Overflow */}
      <div className="overflow-x-auto">
        <Table
          rowSelection={rowSelection}
          columns={getColumns(pagination, handleMenuClick)}
          dataSource={companies}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          rowKey="id"
          scroll={{ x: "max-content" }}
          size="small"
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    // backgroundColor: primaryColor,
                    // color: contentBgColor,
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    padding: "8px 8px",
                    whiteSpace: "nowrap",
                  }}
                />
              ),
            },
          }}
          className="min-w-full"
        />
      </div>

      {/* Use the new CompanyForm component */}

      <CompanyForm
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onFinish={handleFormSubmit}
      />
    </div>
  );
};

export default Hotel;
