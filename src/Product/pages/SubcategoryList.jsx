import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Space, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import subcategoryService from "../services/subcategoryService";
import debounce from "lodash.debounce";

const { Search } = Input;

const SubCategoryList = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState("");
  const [sorter, setSorter] = useState({ field: null, order: null });

  const fetchSubcategories = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const data = await subcategoryService.getAll({
          page: params.current || pagination.current,
          limit: params.pageSize || pagination.pageSize,
          search: params.search || searchText,
          sortField: params.sortField || sorter.field,
          sortOrder: params.sortOrder || sorter.order,
        });

        setSubcategories(data.data || []);
        setPagination((prev) => ({
          ...prev,
          current: data.page || params.current || 1,
          total: data.total || 0,
          pageSize: data.limit || params.pageSize || 10,
        }));
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch subcategories");
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, searchText, sorter]
  );

  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  const handleTableChange = (pag, filters, sort) => {
    setPagination(pag);
    setSorter({
      field: sort.field,
      order: sort.order === "ascend" ? "asc" : sort.order === "descend" ? "desc" : null,
    });
  };

  const handleSearch = debounce((value) => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setSearchText(value);
  }, 500);

  const handleDelete = async (id) => {
    try {
      await subcategoryService.remove(id);
      message.success("Subcategory deleted successfully");
      fetchSubcategories();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete subcategory");
    }
  };

  const columns = [
    { title: "Subcategory Name", dataIndex: "subcategory_name", key: "name", sorter: true },
    { title: "Category", dataIndex: "category_name", key: "category", sorter: true },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/subcategory/edit/${record.id}`)}
          >
            Edit
          </Button>
          <Popconfirm title="Are you sure to delete this subcategory?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
        <Search
          placeholder="Search subcategories..."
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          enterButton
          allowClear
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/subcategory/add")}>
          Add Subcategory
        </Button>
      </Space>

      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={subcategories}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        bordered
        scroll={{ x: true }}
      />
    </div>
  );
};

export default SubCategoryList;
