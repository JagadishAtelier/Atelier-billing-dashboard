import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Space, message, Upload, Modal } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import stockService from "../service/stockService.js";
import * as XLSX from "xlsx";

const { Search } = Input;

const StockList = () => {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");

    // 🔹 States for Bulk Upload Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bulkData, setBulkData] = useState([]);

    const fetchStocks = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const data = await stockService.getAll({
                page: params.current || pagination.current,
                limit: params.pageSize || pagination.pageSize,
                search: params.search || searchText,
            });

            setStocks(data.data || []);
            setPagination((prev) => ({
                ...prev,
                current: data.page || params.current || 1,
                total: data.total || 0,
                pageSize: data.limit || params.pageSize || 10,
            }));
        } catch (err) {
            console.error(err);
            message.error("Failed to fetch stock records");
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, searchText]);

    useEffect(() => {
        fetchStocks();
    }, [fetchStocks]);

    const handleSearch = (value) => {
        setPagination((prev) => ({ ...prev, current: 1 }));
        setSearchText(value);
    };

    const handleTableChange = (pag) => {
        setPagination(pag);
    };

    const handleDownloadSample = () => {
        const link = document.createElement("a");
        link.href = "/bulk_stock_upload.xlsx"; // served from public folder
        link.download = "bulk_stock_upload.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // 🔹 Upload Excel but don’t save immediately
    const handleFileUpload = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                setBulkData(jsonData); // Save data in state
                message.success("File uploaded successfully, click Save to confirm");
            } catch (err) {
                console.error(err);
                message.error("Invalid Excel file");
            }
        };
        reader.readAsArrayBuffer(file);
        return false; // prevent auto upload
    };

    // 🔹 Save Bulk Upload
    const handleSaveBulkUpload = async () => {
        try {
            if (bulkData.length === 0) {
                message.warning("Please upload an Excel file first");
                return;
            }
            await stockService.createBulk(bulkData);
            message.success("Bulk stock uploaded successfully");
            setIsModalOpen(false);
            setBulkData([]);
            fetchStocks();
        } catch (err) {
            console.error(err);
            message.error("Failed to upload stock");
        }
    };

    const columns = [
        { title: "Product Name", dataIndex: ["product", "product_name"], key: "product_name" },
        { title: "Product Code", dataIndex: ["product", "product_code"], key: "product_code" },
        // { title: "Batch Number", dataIndex: "batch_number", key: "batch_number" },
        { title: "Quantity", dataIndex: "quantity", key: "quantity" },
        { title: "Unit", dataIndex: "unit", key: "unit" },
        { title: "Cost Price", dataIndex: "cost_price", key: "cost_price", render: (val) => `₹${val}` },
        { title: "Selling Price", dataIndex: "selling_price", key: "selling_price", render: (val) => `₹${val}` },
        { title: "Warehouse ID", dataIndex: "warehouse_id", key: "warehouse_id" },
        { title: "Supplier", dataIndex: "supplier", key: "supplier" },
        { title: "Inward Qty", dataIndex: "inward_quantity", key: "inward_quantity" },
        { title: "Billing Qty", dataIndex: "billing_quantity", key: "billing_quantity" },
        { title: "Customer Billing Qty", dataIndex: "customer_billing_quantity", key: "customer_billing_quantity" },
        // { title: "Received Date", dataIndex: "received_date", key: "received_date" },
        // { title: "Expiry Date", dataIndex: "expiry_date", key: "expiry_date" },
    ];

    return (
        <div className="p-4">
            <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
                <Search
                    placeholder="Search stock..."
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    enterButton
                    allowClear
                    style={{ width: 300 }}
                />

                <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsModalOpen(true)}>
                    Bulk Upload Excel
                </Button>
            </Space>

            <Table
                columns={columns}
                rowKey={(record) => record.id}
                dataSource={stocks}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                bordered
                scroll={{ x: "max-content" }}
            />

            {/* 🔹 Bulk Upload Modal */}
            <Modal
                title="Bulk Upload Stock"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>Cancel</Button>,
                    <Button key="save" type="primary" onClick={handleSaveBulkUpload}>Save</Button>
                ]}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Button icon={<DownloadOutlined />} onClick={handleDownloadSample}>
                        Download Sample Excel
                    </Button>

                    <Upload beforeUpload={handleFileUpload} accept=".xlsx,.xls" showUploadList={true}>
                        <Button icon={<UploadOutlined />}>Upload Excel</Button>
                    </Upload>
                </Space>
            </Modal>
        </div>
    );
};

export default StockList;
