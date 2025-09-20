// DashboardFull.jsx
import React, { useEffect, useState } from "react";
import {
    Card,
    Statistic,
    Row,
    Col,
    Spin,
    Table,
    message,
    Typography,
    Tag,
    Avatar,
    Tabs,
} from "antd";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import {
    FileTextOutlined,
    UserOutlined,
    ShoppingOutlined,
    DollarOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import dashboardService from "../service/dashboardService";

const { Title } = Typography;

const DashboardFull = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({});
    const [recentBills, setRecentBills] = useState([]);
    const [revenueData, setRevenueData] = useState([]);

    // Dummy Best Performers Data
    const bestPerformers = {
        week: [
            { name: "Alice Johnson", sales: 120, rank: 1 },
            { name: "Bob Smith", sales: 95, rank: 2 },
            { name: "Charlie Lee", sales: 80, rank: 3 },
        ],
        month: [
            { name: "David Kim", sales: 450, rank: 1 },
            { name: "Eva Green", sales: 400, rank: 2 },
            { name: "Frank Wright", sales: 375, rank: 3 },
        ],
        year: [
            { name: "Grace Hopper", sales: 5200, rank: 1 },
            { name: "Henry Ford", sales: 4900, rank: 2 },
            { name: "Irene Adler", sales: 4600, rank: 3 },
        ],
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, billsRes, revenueRes] = await Promise.all([
                    dashboardService.getSummary(),
                    dashboardService.getRecentBills(),
                    dashboardService.getRevenueByDate(),
                ]);

                setSummary({
                    totalBills: summaryRes?.totalBills || 0,
                    totalUsers: summaryRes?.totalUsers || 0,
                    totalProducts: summaryRes?.totalProducts || 0,
                    totalRevenue: summaryRes?.totalRevenue || 0,
                });

                const mappedBills = (billsRes || []).map((bill) => ({
                    id: bill.id,
                    billingNo: bill.billing_no,
                    customer: bill.customer_name,
                    total: bill.total_amount,
                    status: bill.status,
                    date: new Date(bill.billing_date).toLocaleDateString(),
                }));
                setRecentBills(mappedBills);

                const mappedRevenue = (revenueRes || []).map((r, i) => ({
                    date: r.date,
                    weekRevenue: r.totalRevenue + i * 1000,
                    monthRevenue: r.totalRevenue + i * 5000,
                    yearRevenue: r.totalRevenue + i * 20000,
                }));
                setRevenueData(mappedRevenue);
            } catch (err) {
                console.error("❌ Error fetching dashboard data", err);
                message.error("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const columns = [
        { title: "Bill No", dataIndex: "billingNo", key: "billingNo" },
        { title: "Customer", dataIndex: "customer", key: "customer" },
        {
            title: "Total Amount",
            dataIndex: "total",
            key: "total",
            render: (v) => <b>₹{v}</b>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "paid" ? "green" : "volcano"}>{status}</Tag>
            ),
        },
        { title: "Date", dataIndex: "date", key: "date" },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Spin size="large" />
            </div>
        );
    }

    // 🎟 Simplified Stat Card (normal shape, shine only on hover)
    const StatCard = ({ title, value, icon, gradient }) => {
        const [isHovered, setIsHovered] = useState(false);

        return (
            <motion.div
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                whileHover={{ scale: 1.05, y: -4 }}   // 🔥 bounce up slightly
                whileTap={{ scale: 0.97 }}
            >
                <Card
                    className="shadow-lg border-5 relative overflow-hidden rounded-xl"
                    style={{
                        background: gradient,
                        color: "#fff",
                        cursor: "pointer",
                        padding: "14px 18px",
                    }}
                >
                    {/* Shine Effect */}
                    <motion.div
                        initial={{ x: "-150%" }}
                        animate={isHovered ? { x: "300%" } : { x: "-150%" }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute top-0 left-0 w-1/3 h-full bg-white/5 backdrop-blur-xl"
                    />

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="text-3xl" style={{ color: "#fff", opacity: 0.95, marginRight: 2 }}>
                            {icon}
                        </div>
                        <Statistic
                            title={<span style={{ color: "#fff",fontWeight: 700 , fontSize: 22 }}>{title}</span>}
                            value={value}
                            valueStyle={{ color: "#fff", fontWeight: 700, fontSize: 20 }}
                        />
                    </div>
                </Card>
            </motion.div>
        );
    };

    // 📊 Revenue Section (no animation)
    const RevenueSection = ({ revenueData }) => {
        const chart = (key, label, color) => (
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        );

        return (
            <Card className="shadow-sm rounded-lg">
                <Tabs
                    defaultActiveKey="weekRevenue"
                    items={[
                        { key: "weekRevenue", label: "Weekly", children: chart("weekRevenue", "Week", "#2563eb") },
                        { key: "monthRevenue", label: "Monthly", children: chart("monthRevenue", "Month", "#059669") },
                        { key: "yearRevenue", label: "Yearly", children: chart("yearRevenue", "Year", "#d97706") },
                    ]}
                />
            </Card>
        );
    };

    // 🏆 Best Performer Tabbed Section (no animation)
    const PerformerTabs = () => {
        const medals = ["🥇", "🥈", "🥉"];

        const list = (data) => (
            <div>
                {data.map((item, idx) => (
                    <div
                        key={item.rank}
                        className={`flex items-center justify-between p-2 mb-1 rounded-md ${idx === 0
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-200 text-black shadow"
                            : "bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Avatar size={28} style={{ backgroundColor: "#2563eb" }}>
                                {medals[idx] || item.rank}
                            </Avatar>
                            <div>
                                <div className="font-semibold text-xs">{item.name}</div>
                                <div className="text-[11px] text-gray-600">
                                    Sales: {item.sales}
                                </div>
                            </div>
                        </div>
                        <div
                            className="h-1.5 rounded-full bg-green-500"
                            style={{
                                minWidth: "40px",
                                maxWidth: "80px",
                                width: `${(item.sales / data[0].sales) * 100}%`,
                            }}
                        />
                    </div>
                ))}
            </div>
        );

        return (
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <TrophyOutlined style={{ color: "#facc15" }} />
                        <b>Best Performers</b>
                    </span>
                }
                className="shadow-md rounded-xl"
            >
                <Tabs
                    defaultActiveKey="week"
                    items={[
                        { key: "week", label: "Week", children: list(bestPerformers.week) },
                        { key: "month", label: "Month", children: list(bestPerformers.month) },
                        { key: "year", label: "Year", children: list(bestPerformers.year) },
                    ]}
                />
            </Card>
        );
    };

    return (
        <div style={{ padding: 20, background: "#f3f4f6", minHeight: "100vh" }}>
            <Title level={4} style={{ marginBottom: 16 }}>
                Dashboard Overview
            </Title>

            {/* Summary Cards */}
            <Row gutter={[12, 12]}>
                <Col xs={12} md={6}>
                    <StatCard
                        title="Total Bills"
                        value={summary.totalBills}
                        icon={<FileTextOutlined />}
                        gradient="linear-gradient(135deg,#2563eb,#60a5fa)"
                    />
                </Col>
                <Col xs={12} md={6}>
                    <StatCard
                        title="Total Users"
                        value={summary.totalUsers}
                        icon={<UserOutlined />}
                        gradient="linear-gradient(135deg,#059669,#34d399)"
                    />
                </Col>
                <Col xs={12} md={6}>
                    <StatCard
                        title="Total Products"
                        value={summary.totalProducts}
                        icon={<ShoppingOutlined />}
                        gradient="linear-gradient(135deg,#7c3aed,#a78bfa)"
                    />
                </Col>
                <Col xs={12} md={6}>
                    <StatCard
                        title="Total Revenue"
                        value={summary.totalRevenue}
                        icon={<DollarOutlined />}
                        gradient="linear-gradient(135deg,#d97706,#facc15)"
                    />
                </Col>
            </Row>

            {/* Revenue + Best Performers in One Row */}
            <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
                <Col xs={24} md={12}>
                    <RevenueSection revenueData={revenueData} />
                </Col>
                <Col xs={24} md={12}>
                    <PerformerTabs />
                </Col>
            </Row>

            {/* Recent Bills */}
            <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="Recent Bills" className="shadow-sm rounded-lg">
                        <Table
                            columns={columns}
                            dataSource={recentBills}
                            rowKey="id"
                            pagination={{ pageSize: 3 }}
                            bordered={false}
                            size="small"
                            rowClassName={(_, index) =>
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardFull;
