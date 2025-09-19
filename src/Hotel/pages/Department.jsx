import { useState, useEffect } from "react";
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
  message,
  DatePicker,
} from "antd";
import {
  EllipsisOutlined,
  PlusOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import { departmentService } from "../services/departmentService";
import { Tag } from "antd";

const { Option } = Select;
const { RangePicker } = DatePicker;

const getUniqueValues = (data, key) =>
  [...new Set(data.map((item) => item[key]))].filter(Boolean);

const FiltersPopover = ({ onApply, dataSource, currentFilters }) => {
  const [filters, setFilters] = useState({
    status: currentFilters?.status?.toLowerCase(),
    created_by: currentFilters?.created_by,
    updated_by: currentFilters?.updated_by,
  });

  const onChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value?.toLowerCase(),
    }));
  };

  const renderPopoverContent = (field) => {
    let options = [];

    switch (field) {
      case "Status":
        options = ["active", "inactive"].map((status) => ({
          value: status,
          label: status.charAt(0).toUpperCase() + status.slice(1),
        }));
        break;
      case "created_by":
        options = getUniqueValues(dataSource, "created_by").map((value) => ({
          value,
          label: value,
        }));
        break;
      case "updated_by":
        options = getUniqueValues(dataSource, "updated_by").map((value) => ({
          value,
          label: value,
        }));
        break;
      default:
        break;
    }

    return (
      <div>
        <div style={{ marginBottom: 3, fontWeight: "bold", color: "#555" }}>
          {field
            .split(/(?=[A-Z])/)
            .join(" ")
            .replace("_", " ")}
        </div>
        <Select
          value={filters[field]}
          onChange={(val) => onChange(field, val)}
          placeholder={`Select ${field
            .split(/(?=[A-Z])/)
            .join(" ")
            .replace("_", " ")
            .toLowerCase()}`}
          style={{ width: 180 }}
          allowClear
        >
          {options.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      </div>
    );
  };

  const hasAny = Object.values(filters).some((v) => v !== undefined);

  return (
    <div style={{ padding: 10, width: 200, fontWeight: "bold" }}>
      {["Status"].map((field) => (
        <div key={field} style={{ marginBottom: 15 }}>
          <Popover
            content={renderPopoverContent(field)}
            trigger="hover"
            placement="left"
            mouseEnterDelay={0.1}
            mouseLeaveDelay={0.1}
          >
            <div
              style={{
                cursor: "pointer",
                fontWeight: "semibold",
                width: 100,
                color: filters[field] ? "#1890ff" : "inherit",
              }}
            >
              {field.split(/(?=[A-Z])/).join(" ")}
              {filters[field] && <span> (1)</span>}
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
          disabled={!hasAny}
        >
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => onApply(filters)}
          disabled={!hasAny}
          style={{ marginLeft: 8 }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

const Department = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const { primaryColor, contentBgColor } = useTheme();
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchDepartments = async (params = {}) => {
    setLoading(true);
    try {
      const response = await departmentService.getAllDepartments({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        sort_by: "created_at",
        sort_order: "desc",
        status: filters.status,
        date_from: dateRange[0]?.format("YYYY-MM-DD"),
        date_to: dateRange[1]?.format("YYYY-MM-DD"),
        ...params,
      });

      if (response?.data) {
        const departmentsData = response.data.departments || response.data;
        const departmentsList = Array.isArray(departmentsData)
          ? departmentsData
          : [];

        setDepartments(departmentsList);
        setFilteredData(departmentsList);
        setPagination({
          ...pagination,
          total: response.data.pagination?.total || departmentsList.length,
        });
      }
    } catch (error) {
      messageApi.error("Failed to fetch departments");

      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [
    pagination.current,
    pagination.pageSize,
    searchText,
    filters.status,
    dateRange,
  ]);

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    const filtered = departments.filter((item) => {
      let ok = true;
      if (newFilters.status) {
        ok = ok && item.status === newFilters.status;
      }
      if (newFilters.created_by) {
        ok = ok && item.created_by === newFilters.created_by;
      }
      if (newFilters.updated_by) {
        ok = ok && item.updated_by === newFilters.updated_by;
      }
      return ok;
    });
    setFilteredData(filtered);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  const handleMenuClick = (record, e) => {
    if (e.key === "edit") return handleEdit(record);
    if (e.key === "delete") return handleDelete(record);
  };

  const handleEdit = async (record) => {
    setLoading(true);
    try {
      const response = await departmentService.getDepartmentById(record.id);
      if (response.data) {
        setSelectedDepartment(response.data);
        form.setFieldsValue(response.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      messageApi.error("Failed to fetch department details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      await departmentService.deleteDepartment(record.id);

      messageApi.success("Department deleted successfully");
      fetchDepartments();
    } catch (error) {
      messageApi.error("Failed to delete department");
    }
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      if (selectedDepartment) {
        await departmentService.updateDepartment(selectedDepartment.id, {
          ...values,
          updated_by: 1,
        });

        messageApi.success("Department updated successfully");
      } else {
        await departmentService.createDepartment({
          ...values,
          created_by: 1,
        });

        messageApi.success("Department created successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchDepartments();
    } catch (error) {
      messageApi.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await axios.get("/your_api_base_url/departments", {
        params: {
          is_pdf: type === "pdf",
          is_excel: type === "excel",
          search: searchText,
          status: filters.status,
          date_from: dateRange[0]?.format("YYYY-MM-DD"),
          date_to: dateRange[1]?.format("YYYY-MM-DD"),
        },
        responseType: "blob",
      });

      const mime =
        type === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([response.data], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `departments.${type === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      message.success(`Export ${type.toUpperCase()} downloaded`);
    } catch (err) {
      console.error(err);
      message.error(`Failed to export ${type.toUpperCase()}`);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "odd",
        text: "Select Odd Row",
        onSelect: (keys) =>
          setSelectedRowKeys(keys.filter((_, i) => i % 2 === 0)),
      },
      {
        key: "even",
        text: "Select Even Row",
        onSelect: (keys) =>
          setSelectedRowKeys(keys.filter((_, i) => i % 2 !== 0)),
      },
    ],
  };

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 70,
      render: (_, __, idx) =>
        // absolute index across all pages:
        (pagination.current - 1) * pagination.pageSize + idx + 1,
      fixed: "left",
    },
    {
      title: "Department Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      ellipsis: true,
      render: (name) =>
        name
          ?.toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",

      render: (name) =>
        name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (!status) return "-";
        const normalizedStatus = status.toLowerCase();
        const label =
          status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        return (
          <Tag color={normalizedStatus === "active" ? "green" : "red"}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "edit", icon: <EditOutlined />, label: "Edit" },
              { key: "delete", icon: <DeleteOutlined />, label: "Delete" },
            ],
            onClick: (e) => handleMenuClick(record, e),
          }}
          trigger={["click"]}
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
        {/* Header */}
        <div className="bg-white ">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2  mb-4">
            <h1 className="text-xl font-semibold">Department</h1>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-[250px] min-w-[200px]">
                <Input.Search
                  placeholder="Search by name"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full"
                  allowClear
                />
              </div>
              {/*
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              allowClear
              style={{ width: 250 }}
              placeholder={["From date", "To date"]}
            /> */}

              <div className="flex gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
                {/* <Dropdown
                menu={{
                  items: [
                    {
                      type: "primary",
                      key: "excel",
                      icon: <DownloadOutlined />,
                      label: "Export Excel",
                      onClick: () => handleExport("excel")
                    },
                    {
                      type: "primary",
                      key: "pdf",
                      icon: <FilePdfOutlined />,
                      label: "Export PDF",
                      onClick: () => handleExport("pdf")
                    }
                  ]
                }}
                trigger={["click"]}
              >
                <Button type="primary">
                  Export <DownloadOutlined />
                </Button>
              </Dropdown> */}

                <Popover
                  content={
                    <FiltersPopover
                      dataSource={departments}
                      currentFilters={filters}
                      onApply={handleFilterApply}
                    />
                  }
                  trigger="click"
                  placement="bottomLeft"
                >
                  <Button icon={<FilterOutlined />}>Filter</Button>
                </Popover>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedDepartment(null);
                    form.resetFields();
                    setIsModalOpen(true);
                  }}
                >
                  Add Department
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-1">
          <Table
            dataSource={filteredData.length ? filteredData : departments}
            columns={columns}
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
          />
        </div>

        {/* Modal */}
        <Modal
          title={selectedDepartment ? "Edit Department" : "Add Department"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
          style={{ top: 20 }}
          destroyOnClose
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={handleFormSubmit}
            initialValues={{ status: "active" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Department Name"
                  rules={[
                    { required: true, message: "Please enter department name" },
                    {
                      max: 30,
                      message: "Department name cannot exceed 30 characters",
                    },
                  ]}
                >
                  <Input placeholder="Enter department name" maxLength={30} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                    {
                      max: 10,
                      message: "Phone number cannot exceed 10 characters",
                    },
                    {
                      pattern: /^\d+$/,
                      message: "Please enter valid phone number",
                    },
                  ]}
                >
                  <Input placeholder="Enter phone number" maxLength={10} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
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

              {selectedDepartment && (
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[
                      { required: true, message: "Please select status" },
                    ]}
                  >
                    <Select placeholder="Select status">
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              )}

              <Col xs={24}>
                <Form.Item name="description" label="Description">
                  <Input.TextArea placeholder="Enter description" rows={4} />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-2 mt-4">
              <Button danger onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedDepartment ? "Update" : "Submit"}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default Department;

