// src/components/dashboard/DashboardFull.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Skeleton } from "antd";
import StatCard from "./StatCard";
import LatestPayments from "./LatestPayments";
import LatestCollections from "./LatestCollections";
import OverviewCharts from "./OverviewCharts";
import IncomingPOs from "./IncomingPOs";
import LowStockAlerts from "./LowStockAlerts";
import TopProducts from "./TopProducts";
import { LATEST_COLLECTIONS } from "../../data/dummyData";
import Billingicon from "../../../public/icon/billing-machine-svgrepo-com.png"
import Usericon from "../../../public/icon/user.png"
import Producticon from "../../../public/icon/product.png"
import Walleticon from "../../../public/icon/wallet.png"
import RevenueGrowth from "../../../public/icon/revenue-growth.gif";
import ProductGIF from "../../../public/Product.gif";
import UserGIF from "../../../public/icon/user.gif";
import BillsGIF from "../../../public/icon/invoice-bill.gif";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import { Link } from "react-router-dom";

import {
  ReceiptIndianRupee,
  Users,
  ShoppingBasket,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import dashboardService from "../service/dashboardService";
import { color } from "framer-motion";

const { Title, Text } = Typography;

const styles = {
  page: { padding: 6, minHeight: "100vh", width: "100%" },
  roundedCard: { borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" },
};

const DEFAULT_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#06b6d4", "#f97316", "#a78bfa", "#60a5fa", "#eab308",
];

const DashboardFull = () => {
  const [isMobile, setIsMobile] = useState(false);

  const [filterKey, setFilterKey] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [salesData, setSalesData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState(true);

  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const [incomingPOs, setIncomingPOs] = useState([]);
  const [loadingPOs, setLoadingPOs] = useState(true);

  const [topProducts, setTopProducts] = useState([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);

  const [poSummary, setPOSummary] = useState({ sentOrders: 0, totalCost: 0 });
  const [loadingPOSummary, setLoadingPOSummary] = useState(true);

  const [monthly, setMonthly] = useState({
    thisMonth: 0,
    lastMonth: 0,
    difference: 0,
    percentChange: null,
  });
  const [loadingMonthly, setLoadingMonthly] = useState(true);

  // ⭐ ADDED: Last updated state
  const [lastUpdated, setLastUpdated] = useState("");

  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    dashboardService.getLowStock().then((res) => {
      setLowStockItems(res?.data || []);
    });
  }, []);

  const updateTimestamp = () => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-GB") +
      " " +
      now.toLocaleTimeString("en-GB");
    setLastUpdated(formatted);
  };

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoadingMonthly(true);
      try {
        const data = await dashboardService.getMonthlyCollections();
        if (mounted) setMonthly(data || monthly);
      } catch (e) {
        if (mounted)
          setMonthly({ thisMonth: 0, lastMonth: 0, difference: 0, percentChange: null });
      } finally {
        if (mounted) setLoadingMonthly(false);
        updateTimestamp(); // update time
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch summary
  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const data = await dashboardService.getSummary();
        if (mounted) setSummary(data);
      } catch {
        if (mounted)
          setSummary({ totalBills: 0, totalUsers: 0, totalProducts: 0, totalRevenue: 0 });
      } finally {
        if (mounted) setLoadingSummary(false);
        updateTimestamp(); // update time
      }
    };

    fetchSummary();
    return () => (mounted = false);
  }, []);

  // Fetch recent bills
  useEffect(() => {
    let mounted = true;

    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const resp = await dashboardService.getRecentBills(10);
        const bills = Array.isArray(resp) ? resp : resp?.data || [];

        const mapped = bills.map((b) => ({
          id: b.billing_no || b.id,
          customer: b.customer_name || "Unknown",
          fulfillment:
            b.status === "paid"
              ? "Fulfilled"
              : b.status === "pending"
                ? "Draft"
                : b.status === "partially_paid"
                  ? "Processing"
                  : b.status === "cancelled"
                    ? "Cancelled"
                    : "Draft",
          status: b.status,
          total: Number(b.total_amount || b.subtotal_amount || 0),
          date: b.billing_date
            ? new Date(b.billing_date).toISOString().slice(0, 10)
            : new Date(b.createdAt).toISOString().slice(0, 10),
          method: b.payment_method || "N/A",
          notes: b.notes || "",
        }));

        if (mounted) setPayments(mapped);
      } catch {
        if (mounted) setPayments([]);
      } finally {
        if (mounted) setLoadingPayments(false);
        updateTimestamp(); // update time
      }
    };

    fetchPayments();
    return () => (mounted = false);
  }, []);

  // Fetch charts
  useEffect(() => {
    let mounted = true;

    const fetchCharts = async () => {
      setLoadingCharts(true);
      try {
        const revenueResp = await dashboardService.getRevenueByDate();
        const revenueArray =
          Array.isArray(revenueResp)
            ? revenueResp
            : revenueResp?.data || revenueResp?.result || [];

        const formattedSales = revenueArray.map((item) => {
          const totalRevenue =
            item.totalRevenue ?? item.total_revenue ?? item.revenue ?? 0;
          const totalProfit =
            item.totalProfit ?? item.total_profit ?? item.profit ?? 0;

          let name = item.date ?? item.name ?? "";
          const parsed = new Date(name);
          if (!Number.isNaN(parsed)) {
            name = parsed.toLocaleDateString(undefined, { weekday: "short" });
          }

          return {
            name,
            sales: Number(totalRevenue),
            purchases: 0,
            profit: Number(totalProfit),
          };
        });

        const statsResp = await dashboardService.getDashboardStats().catch(() => null);
        let formattedCategory = [];

        if (Array.isArray(statsResp)) {
          formattedCategory = statsResp.map((c, i) => ({
            name: c.name ?? `Category ${i + 1}`,
            value: Number(c.value ?? 0),
            color: c.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
          }));
        }

        const sumCategory = formattedCategory.reduce((s, c) => s + c.value, 0);
        formattedCategory =
          sumCategory > 0
            ? formattedCategory.map((c) => ({
              name: c.name,
              value: Math.round((c.value / sumCategory) * 10000) / 100,
              color: c.color,
            }))
            : [];

        if (mounted) {
          setSalesData(formattedSales);
          setCategoryData(formattedCategory);
        }
      } catch {
        if (mounted) {
          setSalesData([]);
          setCategoryData([]);
        }
      } finally {
        if (mounted) setLoadingCharts(false);
        updateTimestamp(); // update time
      }
    };

    fetchCharts();
    return () => (mounted = false);
  }, []);

  // Fetch Incoming POs
  useEffect(() => {
    let mounted = true;

    const fetchPos = async () => {
      setLoadingPOs(true);
      try {
        const resp = await dashboardService.getIncomingPOs();
        const arr = Array.isArray(resp) ? resp : resp?.data || [];

        if (mounted) {
          setIncomingPOs(
            arr.map((po, i) => ({
              id: po.id,
              label: po.label,
              total: Number(po.total),
              color: po.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
            }))
          );
        }
      } catch {
        if (mounted) setIncomingPOs([]);
      } finally {
        if (mounted) setLoadingPOs(false);
        updateTimestamp(); // update time
      }
    };

    fetchPos();
    return () => (mounted = false);
  }, []);

  // Fetch Top Products
  useEffect(() => {
    let mounted = true;

    const fetchTopProducts = async () => {
      setLoadingTopProducts(true);
      try {
        const resp = await dashboardService.getTopProducts();
        const arr = Array.isArray(resp) ? resp : resp?.data || [];

        if (mounted) setTopProducts(arr);
      } catch {
        if (mounted) setTopProducts([]);
      } finally {
        if (mounted) setLoadingTopProducts(false);
        updateTimestamp(); // update time
      }
    };

    fetchTopProducts();
    return () => (mounted = false);
  }, []);

  // Fetch PO Summary
  useEffect(() => {
    let mounted = true;

    const fetchPOSummary = async () => {
      setLoadingPOSummary(true);
      try {
        const data = await dashboardService.getPOSummary();

        if (mounted) {
          setPOSummary({
            sentOrders: data?.sentOrders ?? 0,
            totalCost: data?.totalCost ?? 0,
          });
        }
      } catch {
        if (mounted) setPOSummary({ sentOrders: 0, totalCost: 0 });
      } finally {
        if (mounted) setLoadingPOSummary(false);
        updateTimestamp(); // update time
      }
    };

    fetchPOSummary();
    return () => (mounted = false);
  }, []);

  const summaryCards =
    summary &&
    [
      {
        id: "bills",
        title: "Total Bills",
        value: summary.totalBills ?? 0,
        meta: "Number of bills",
        icon: <img src={BillsGIF} alt="Total Bills" className="w-10 h-10" />,
        color: "transparent", 
        noBg: true,             
        linkTo: "/billing/list",
        
      },      
      {
        id: "users",
        title: "Total Users",
        value: summary.totalUsers ?? 0,
        meta: "Registered users",
        icon: <img src={UserGIF} alt="Total Users" className="w-10 h-10" />,
        color: "transparent",  
        noBg: true,            
        linkTo: "/user",
      },      
      {
        id: "products",
        title: "Total Products",
        value: summary.totalProducts ?? 0,
        meta: "Available products",
        icon: <img src={ProductGIF} alt="Total Products" className="w-10 h-10" />,
        color: "transparent",   
        noBg: true,             
        linkTo: "/product/list",
      },      
      {
        id: "revenue",
        title: "Total Revenue",
        value: `₹${summary.totalRevenue ?? 0}`,
        meta: "Revenue generated",
        icon: <img src={RevenueGrowth} alt="Revenue Growth" className="w-10 h-10" />,
        color: "transparent",   
        noBg: true,             
        linkTo: "/report",
      }
      
      
    ];


  return (
    <div style={styles.page}>


      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1" style={{ fontWeight: "700" }}>
            Admin Dashboard
          </h1>
          <Text style={{ fontSize: 12, color: "#6b7280" }}>
            Last updated: {lastUpdated || "—"}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
          <Link
            to="/product/add"
            className="text-sm !bg-[#506EE4] py-2 px-3 !text-white shadow-sm rounded-sm"
          >
            Add Product
          </Link>
          <Link
            to="/billing/add"
            className="text-sm !bg-[#E9EDF4] py-2 px-3 !text-gray-700 shadow-sm rounded-sm"
          >
            Add Bill
          </Link>
        </div>
      </div>

      {/* Summary */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {loadingSummary
          ? [0, 1, 2, 3].map((i) => (
            <Col xs={24} sm={12} md={12} lg={6} key={i}>
              <Card style={{ borderRadius: 14 }}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))
          : summaryCards.map((s) => (
            <Col xs={24} sm={12} md={12} lg={6} key={s.id}>
              <StatCard {...s} />
            </Col>
          ))}
      </Row>


      {/* Charts */}
      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <OverviewCharts
          // salesData={loadingCharts ? undefined : salesData}
          // categoryData={loadingCharts ? undefined : categoryData}
          />
        </Col>
      </Row>

      {/* Payments / POs / Products */}
      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <LowStockAlerts items={lowStockItems} />
          {/* <LatestPayments
            payments={payments}
            filterKey={filterKey}
            setFilterKey={setFilterKey}
            searchQ={searchQ}
            setSearchQ={setSearchQ}
            expandedRowKeys={expandedRowKeys}
            setExpandedRowKeys={setExpandedRowKeys}
          /> */}

        </Col>

        {/* Incoming POs */}
        <Col xs={24} lg={6}>
          <Card size="small" style={{ ...styles.roundedCard, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div className="text-lg font-semibold text-gray-900">Purchase Orders</div>

                {loadingPOSummary ? (
                  <Skeleton active paragraph={{ rows: 2 }} />
                ) : (
                  <>
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>Sent orders</div>
                      <div className="text-gray-900 font-medium">{poSummary.sentOrders}</div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>Total cost</div>
                      <div className="text-gray-900 font-medium">₹{poSummary.totalCost}</div>
                    </div>
                  </>
                )}
              </div>

              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#0ea5e9" }}>
                  <Link to="/order">→</Link>
                </span>
              </div>
            </div>
          </Card>

          {loadingPOs ? (
            <Card style={{ marginTop: 12, borderRadius: 14, padding: 14 }}>
              <Skeleton active />
            </Card>
          ) : (
            <IncomingPOs pos={incomingPOs} />
          )}
        </Col>

        {/* Top Products + Monthly Collections */}
        <Col xs={24} lg={6}>
          {loadingTopProducts ? (
            <Card size="small" style={{ ...styles.roundedCard }}>
              <Skeleton active />
            </Card>
          ) : (
            <TopProducts products={topProducts} />
          )}

          {/* ⭐ MONTHLY COLLECTIONS with ICONS ⭐ */}
          <Card size="small" style={{ ...styles.roundedCard, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text className="text-lg font-semibold text-gray-900">Monthly Collections</Text>
                {loadingMonthly ? (
                  <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                  <>
                    <div style={{ fontSize: 14, color: "#6b7280" }}>This month</div>
                    <div className="text-gray-900 font-medium">
                      ₹{monthly.thisMonth.toLocaleString()}
                    </div>

                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                      Last month
                    </div>
                    <div className="text-gray-900 font-medium">
                      ₹{monthly.lastMonth.toLocaleString()}
                    </div>
                  </>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <Text className="text-lg font-semibold text-gray-900">Change</Text>

                {/* Percent + Icon Row */}
                {!loadingMonthly && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      justifyContent: "flex-end",
                    }}
                  >
                    <span className="text-gray-900 font-medium">
                      {monthly.percentChange === null
                        ? "—"
                        : `${monthly.percentChange}%`}
                    </span>

                    {monthly.percentChange > 0 ? (
                      <ArrowUpRight size={18} color="green" />
                    ) : monthly.percentChange < 0 ? (
                      <ArrowDownRight size={18} color="red" />
                    ) : (
                      <Minus size={18} color="gray" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardFull;
