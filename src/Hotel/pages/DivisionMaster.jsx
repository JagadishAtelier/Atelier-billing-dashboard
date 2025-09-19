import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popover,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  EllipsisOutlined,
  FilterOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import { divisionService } from "../services/divisionService";
import { Tag } from "antd";

const { Option } = Select;

const getUniqueValues = (data, key) =>
  [...new Set(data.map((item) => item[key]))].filter(Boolean);

const FiltersPopover = ({ onApply, dataSource, currentFilters }) => {
  const [filters, setFilters] = useState({
    status: currentFilters?.status,
    created_by: currentFilters?.created_by,
    updated_by: currentFilters?.updated_by,
    deleted_by: currentFilters?.deleted_by,
  });

  const onChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderPopoverContent = (field) => {
    let options = [];

    switch (field) {
      case "Status":
        options = ["Active", "Inactive"];
        break;
      case "created_by":
        options = getUniqueValues(dataSource, "created_by");
        break;
      case "updated_by":
        options = getUniqueValues(dataSource, "updated_by");
        break;
      case "deleted_by":
        options = getUniqueValues(dataSource, "deleted_by");
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
            <Option key={opt} value={opt}>
              {opt}
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
          {/* 'created_by', 'updated_by', 'deleted_by' */}
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
        <Space>
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
          >
            Apply
          </Button>
        </Space>
      </div>
    </div>
  );
};

const DivisionPage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const { primaryColor, contentBgColor } = useTheme();

  const [form] = Form.useForm();
  const [divisions, setDivisions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchDivisions = async (
    page = pagination.current,
    pageSize = pagination.pageSize
  ) => {
    setLoading(true);
    try {
      const resp = await divisionService.getAllDivisions({
        page,
        limit: pageSize,
        search: searchText,
        sort_by: "created_at",
        sort_order: "desc",
        status: filters.status,
        from_date: null,
        to_date: null,
        is_pdf: false,
        is_excel: false,
      });

      if (resp.success) {
        setDivisions(resp.data.divisions);
        setFilteredData([]);
        setPagination({
          current: resp.data.pagination.page,
          pageSize: resp.data.pagination.limit,
          total: resp.data.pagination.total,
        });
        messageApi.success("Data fetched successfully");
      } else {
        messageApi.error("Failed to fetch divisions");
      }
    } catch {
      messageApi.error("Failed to fetch divisions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, [searchText, filters.status, currentPage, pageSize]);

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    const out = divisions.filter((item) => {
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
      if (newFilters.deleted_by) {
        ok = ok && item.deleted_by === newFilters.deleted_by;
      }
      return ok;
    });
    setFilteredData(out);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleMenuClick = (record, e) => {
    if (e.key === "edit") return handleEdit(record);
    if (e.key === "delete") return handleDelete(record);
  };

  const handleEdit = async (rec) => {
    setLoading(true);
    try {
      const r = await divisionService.getDivisionById(rec.id);
      if (r.success) {
        setEditingRecord(r.data);
        form.setFieldsValue(r.data);
        setModalVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleEdit = async (rec) => {
  //   if (!rec?.id) {
  //     message.error('Invalid record');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     // Pre-populate form with existing data first
  //     form.setFieldsValue({
  //       name: rec.name,
  //       phone: rec.phone,
  //       email: rec.email,
  //       status: rec.status
  //     });
  //     setEditingRecord(rec);
  //     setModalVisible(true);

  //     // Then fetch fresh data
  //     const r = await divisionService.getDivisionById(rec.id);
  //     if (r?.success && r?.data) {
  //       setEditingRecord(r.data);
  //       form.setFieldsValue(r.data);
  //     } else {
  //       throw new Error('Failed to load division details');
  //     }
  //   } catch (error) {
  //     console.error('Edit error:', error);
  //     message.warning('Using local data - could not fetch latest details');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDelete = async (rec) => {
    setLoading(true);
    try {
      const r = await divisionService.deleteDivision(rec.id);
      if (r.success) {
        messageApi.success("Deleted");
        fetchDivisions();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (vals) => {
    setLoading(true);
    try {
      const payload = {
        ...vals,
        created_by: 1,
        ...(editingRecord && { updated_by: 1 }),
      };
      let res;
      if (editingRecord) {
        res = await divisionService.updateDivision(editingRecord.id, payload);
      } else {
        res = await divisionService.createDivision(payload);
      }
      if (res.success) {
        messageApi.success(editingRecord ? "Updated" : "Created");
        form.resetFields();
        setModalVisible(false);
        fetchDivisions();
      }
    } catch (err) {
      message.error("Operation failed");
    } finally {
      setLoading(false);
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
      width: 50,
      fixed: "left",
      render: (_, __, idx) =>
        (pagination.current - 1) * pagination.pageSize + idx + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 120,
      sorter: true,
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
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
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
      width: 50,
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
      <div className="min-h-screen flex flex-col overflow-hidden">
        {/* Header & Search */}
        <div className=" bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2  mb-4">
            <h1 className="text-xl font-semibold">Division Master</h1>
            <div className="flex space-x-3 w-full md:w-auto">
              <Input.Search
                placeholder="Search by division name"
                value={searchText}
                onChange={handleSearchChange}
                className="w-full sm:w-[250px]"
                allowClear
              />
              <Popover
                content={
                  <FiltersPopover
                    dataSource={divisions}
                    currentFilters={filters}
                    onApply={handleFilterApply}
                  />
                }
                trigger="click"
                placement="bottomRight"
              >
                <Button icon={<FilterOutlined />}>Filter</Button>
              </Popover>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingRecord(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                Add Division
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 p-1 overflow-auto">
          <Table
            // rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredData.length ? filteredData : divisions}
            loading={loading}
            rowKey={(r) => r.id}
            scroll={{ x: "max-content" }}
            size="small"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              position: ["bottomRight"],
              onChange: (page, pageSize) => {
                setPagination((prev) => ({ ...prev, current: page, pageSize }));
                fetchDivisions(page, pageSize);
              },
            }}
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
          title={`${editingRecord ? "Edit" : "Add"} Division`}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
          width={800}
          style={{ top: 20 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ status: "active" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  { required: true, message: "Enter name" },
                  { min: 2, message: "At least 2 chars" },
                  { max: 100, message: "Max 100 chars" },
                ]}
              >
                <Input placeholder="Enter name" maxLength={100} />
              </Form.Item>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="Enter phone" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Invalid email" }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              {editingRecord && (
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Select status" }]}
                >
                  <Select placeholder="Select status">
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              )}
            </div>
            <Form.Item className="flex justify-end mt-4">
              <Space>
                <Button danger onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingRecord ? "Update" : "Create"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default DivisionPage;
