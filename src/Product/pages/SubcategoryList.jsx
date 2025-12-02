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
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space size={8}>
          <Button
            icon={<EditOutlined style={{ fontSize: "16px" }} />}
            onClick={() => navigate(`/subcategory/edit/${record.id}`)}
            style={{
              padding: "6px 8px",
              borderRadius: "8px",
              backgroundColor: "#f5f6ff", 
              border: "1px solid #e0e3ff",
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              icon={<DeleteOutlined style={{ fontSize: "16px", color: "red" }} />}
              style={{
                padding: "6px 8px",
                borderRadius: "8px",
                backgroundColor: "#fff",
                border: "1px solid red",
              }}
            />
          </Popconfirm>
        </Space>
      ),
    }
  ];
  return (
    <div className="p-4">
<Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
  <div className="flex items-center gap-3">

    {/* ICON BOX */}
    <div
      initial={{ rotate: -45, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-white shadow-sm rounded-sm p-1.5 border border-gray-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="inline-block text-gray-600"
      >
        <path d="M6 9h6" />
        <path d="M12 5v8" />
        <path d="M18 13h-6" />
        <circle cx="6" cy="9" r="2" />
        <circle cx="18" cy="13" r="2" />
        <circle cx="12" cy="5" r="2" />
      </svg>
    </div>
    <div>
      <h2 className="!text-[24px] pt-1.5 text-foreground" style={{ fontWeight: 700 }}>
        Sub Categories
      </h2>
    </div>

  </div>
  <Space>
          <Button
            style={{ backgroundColor: "#506ee4", fontWeight: "500", fontSize: "16px", height: "40px", border: "none" }}
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/product/add")}
          >
            Add Sub Category
          </Button>
        </Space>
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
