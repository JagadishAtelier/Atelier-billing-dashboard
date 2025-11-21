// CategoryList.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Popconfirm, message, Input, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import categoryService from "../services/categoryService.js";
import debounce from "lodash.debounce";

const { Search } = Input;

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // server-driven pagination
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState("");

  // fetch from server (stable reference)
  const fetchCategories = useCallback(
    async ({ current = pagination.current, pageSize = pagination.pageSize, search = searchText } = {}) => {
      setLoading(true);
      try {
        const resp = await categoryService.getAll({
          page: current,
          limit: pageSize,
          search,
        });

        // handle both shapes { data: [], total, page, limit } and direct array
        const list = resp?.data ?? resp ?? [];
        setCategories(list || []);

        setPagination((prev) => ({
          ...prev,
          current: resp?.page ?? current,
          total: resp?.total ?? (Array.isArray(list) ? list.length : prev.total),
          pageSize: resp?.limit ?? pageSize,
        }));
      } catch (err) {
        console.error("fetchCategories:", err);
        message.error("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, searchText]
  );

  // debounce search input
  const handleSearch = debounce((value) => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setSearchText(value);
  }, 500);

  // initial + reload when pagination.current / pageSize / searchText changes
  useEffect(() => {
    fetchCategories({ current: pagination.current, pageSize: pagination.pageSize, search: searchText });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCategories, pagination.current, pagination.pageSize, searchText]);

  const handleDelete = async (id) => {
    try {
      await categoryService.remove(id);
      message.success("Category deleted successfully");
      // refetch current page
      fetchCategories({ current: pagination.current, pageSize: pagination.pageSize, search: searchText });
    } catch (err) {
      console.error(err);
      message.error("Failed to delete category");
    }
  };

  // handle table changes (paging, sorting)
  const handleTableChange = (pag /*, filters, sorter */) => {
    setPagination(pag);
    // fetch will be triggered by useEffect (because pagination.current/pageSize changed)
  };

  const columns = [
    { title: "Name", dataIndex: "category_name", key: "category_name", ellipsis: true, width: 240 },
    { title: "Description", dataIndex: "description", key: "description", ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 190,
      render: (_, record) => {
        const s = (record.status || "").toString().toLowerCase();
        const isActive = record.is_active === true || s === "active";
        return isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 240,
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      align: "center", // centers action buttons
      render: (_, record) => (
        <Space>
          <Button type="default" icon={<EditOutlined />} onClick={() => navigate(`/category/edit/${record.id}`)}>
            Edit
          </Button>
          <Popconfirm title="Are you sure you want to delete?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
        <Search
          placeholder="Search categories..."
          onSearch={(v) => handleSearch(v)}
          onChange={(e) => handleSearch(e.target.value)}
          enterButton
          allowClear
          style={{ width: 360 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/category/add")}>
          Add Category
        </Button>
      </Space>

      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={categories}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        bordered
        scroll={{ x: "100%" }}
      />
    </div>
  );
};

export default CategoryList;
