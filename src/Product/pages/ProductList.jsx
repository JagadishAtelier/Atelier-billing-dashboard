// ProductList.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Tag,
  message,
  Modal,
  Descriptions,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { BriefcaseMedical, Boxes } from "lucide-react";
import productService from "../services/productService.js";
import debounce from "lodash.debounce";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";

const { Search } = Input;

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState("");
  const [sorter, setSorter] = useState({ field: null, order: null });

  const qrRefs = useRef({});

  // Modal state for viewing a product
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const fetchProducts = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const data = await productService.getAll({
          page: params.current || pagination.current,
          limit: params.pageSize || pagination.pageSize,
          search: params.search ?? searchText,
          sortField: params.sortField || sorter.field,
          sortOrder: params.sortOrder || sorter.order,
        });

        // service returns wrapper { total, page, limit, data }
        const list = data?.data ?? data;
        setProducts(list || []);
        setPagination((prev) => ({
          ...prev,
          current: data?.page ?? params.current ?? prev.current,
          total: data?.total ?? prev.total,
          pageSize: data?.limit ?? params.pageSize ?? prev.pageSize,
        }));
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, searchText, sorter]
  );

  const handleSearch = debounce((value) => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setSearchText(value);
  }, 500);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts]);

  const handleTableChange = (pag, filters, sort) => {
    setPagination(pag);
    setSorter({
      field: sort.field,
      order: sort.order === "ascend" ? "asc" : sort.order === "descend" ? "desc" : null,
    });

    // fetch new page/sort
    fetchProducts({
      current: pag.current,
      pageSize: pag.pageSize,
      sortField: sort.field,
      sortOrder: sort.order === "ascend" ? "asc" : sort.order === "descend" ? "desc" : null,
      search: searchText,
    });
  };

  const handleDelete = async (id) => {
    try {
      await productService.remove(id);
      message.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete product");
    }
  };

  const downloadQR = (id, code) => {
    const canvas = qrRefs.current[id]?.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = `${code}.png`;
      link.click();
    }
  };

  const downloadAllQRPDF = () => {
    const pdf = new jsPDF();
    let x = 10;
    let y = 10;
    const size = 40;

    products.forEach((product) => {
      const canvas = qrRefs.current[product.id]?.querySelector("canvas");
      if (canvas) {
        const imgData = canvas.toDataURL("image/png");
        pdf.text(product.product_code, x, y - 2);
        pdf.addImage(imgData, "PNG", x, y, size, size);

        x += size + 20;
        if (x + size > 200) {
          x = 10;
          y += size + 20;
        }
      }
    });

    pdf.save("product_qrcodes.pdf");
  };

  // Show product modal — fetch fresh details (safer)
  const openViewModal = async (record) => {
    setViewModalOpen(true);
    setViewLoading(true);

    try {
      // productService.getById may return the raw object or wrapped. handle both.
      const resp = await productService.getById(record.id);
      const data = resp?.data ?? resp ?? record;
      setCurrentProduct(data);
    } catch (err) {
      console.error("Failed to fetch product details", err);
      message.error("Failed to load product details");
      setCurrentProduct(record); // fallback to existing record
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentProduct(null);
  };

  // Assign explicit widths so table knows the horizontal size
  const columns = [
    {
      title: "Name",
      dataIndex: "product_name",
      key: "product_name",
      width: 10,
      sorter: true,
      ellipsis: true,
    },
    { title: "Code", dataIndex: "product_code", key: "product_code", width: 10, ellipsis: true },
    
    { title: "Category", dataIndex: "category_name", key: "category", width: 10, ellipsis: true },
    {
      title: "Price",
      dataIndex: "purchase_price",
      key: "price",
      sorter: true,
      width: 10,
      render: (price) => `₹${price}`,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 10,
      render: (_, record) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => openViewModal(record)} />

            <Button style={{backgroundColor:"#f6f7ff"}} icon={<EditOutlined />} onClick={() => navigate(`/product/edit/${record.id}`)} />

            <Popconfirm title="Are you sure to delete this product?" onConfirm={() => handleDelete(record.id)}>
              <Button danger icon={<DeleteOutlined />}></Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
        <div className="flex items-center gap-3">
          <div
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white  shadow-sm rounded-sm p-1.5 border border-gray-200"
          >
            <Boxes size={20} className="inline-block text-gray-600" />
          </div>
          <div >
            <h2 className="!text-[24px] pt-1.5  text-foreground" style={{fontWeight:700}}>Product</h2>
          </div>
          
        
        </div>
        <Space>
          <Button
            style={{ backgroundColor: "#506ee4", fontWeight: "500", fontSize: "16px", height: "40px", border: "none" }}
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/product/add")}
          >
            Add Product
          </Button>
        </Space>
      </Space>

      {/* Wrap table in horizontally-scrollable container so tablet shows horizontal scroll */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={products}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          bordered
          // ensure horizontal scroll appears — total column widths ~ 1350 so use 1200-1400
          scroll={{ x: 100 }}
        />
      </div>

      {/* View Modal */}
      <Modal
        open={viewModalOpen}
        title={currentProduct ? currentProduct.product_name : "Product Details"}
        onCancel={closeViewModal}
        footer={[
          <Button key="close" onClick={closeViewModal}>
            Close
          </Button>,
          <Button
            key="edit"
            style={{backgroundColor:"#506ee4", color:"#fff", border:"none"}}
            onClick={() => {
              if (currentProduct?.id) navigate(`/product/edit/${currentProduct.id}`);
              closeViewModal();
            }}
          >
            Edit
          </Button>,
        ]}
        width={800}
      >
        {viewLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : currentProduct ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Product Name">{currentProduct.product_name || "-"}</Descriptions.Item>
            <Descriptions.Item label="Product Code">{currentProduct.product_code || "-"}</Descriptions.Item>
            <Descriptions.Item label="Category">{currentProduct.category_name ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Subcategory">{currentProduct.subcategory_name ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Brand">{currentProduct.brand || "-"}</Descriptions.Item>
            <Descriptions.Item label="Unit">{currentProduct.unit || "-"}</Descriptions.Item>
            <Descriptions.Item label="Purchase Price">₹{currentProduct.purchase_price ?? "0.00"}</Descriptions.Item>
            <Descriptions.Item label="Selling Price">₹{currentProduct.selling_price ?? "0.00"}</Descriptions.Item>
            <Descriptions.Item label="Tax %">{currentProduct.tax_percentage ?? "0.00"}</Descriptions.Item>
            <Descriptions.Item label="Min Quantity">{currentProduct.min_quantity ?? 0}</Descriptions.Item>
            <Descriptions.Item label="Max Quantity">{currentProduct.max_quantity ?? 0}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {currentProduct.status}
              {currentProduct.is_active ? <Tag color="green" style={{ marginLeft: 8 }}>Active</Tag> : <Tag color="red" style={{ marginLeft: 8 }}>Inactive</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Description">{currentProduct.description || "-"}</Descriptions.Item>
            <Descriptions.Item label="Created By">{currentProduct.created_by_name || currentProduct.created_by_email || "-"}</Descriptions.Item>
            <Descriptions.Item label="Created At">
              {currentProduct.createdAt ? new Date(currentProduct.createdAt).toLocaleString() : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {currentProduct.updatedAt ? new Date(currentProduct.updatedAt).toLocaleString() : "-"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div>No product data available</div>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
