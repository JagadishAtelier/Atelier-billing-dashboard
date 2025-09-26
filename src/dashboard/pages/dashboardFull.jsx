// src/components/dashboard/DashboardFull.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Skeleton } from "antd";
import StatCard from "./StatCard";
import LatestPayments from "./LatestPayments";
import LatestCollections from "./LatestCollections";
import IncomingPOs from "./IncomingPOs";
import TopProducts from "./TopProducts";
import {
  LATEST_PAYMENTS,
  LATEST_COLLECTIONS,
  INCOMING_POS,
  TOP_PRODUCTS as TOP_PRODUCTS_DATA,
} from "../../data/dummyData";
import { ReceiptIndianRupee, Users, ShoppingBasket,Wallet } from 'lucide-react';
import dashboardService from "../service/dashboardService"; 

const { Title, Text } = Typography;

const styles = {
  page: { padding: 6, minHeight: "100vh", width: "100%" },
  roundedCard: { borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" },
};

const DashboardFull = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [filterKey, setFilterKey] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // summary state
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // fetch summary from API
  useEffect(() => {
    let mounted = true;
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const data = await dashboardService.getSummary();
        if (!mounted) return;
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch dashboard summary:", err);
        if (mounted) {
          // fallback to a minimal empty summary to avoid undefined errors in UI
          setSummary({
            totalBills: 0,
            totalUsers: 0,
            totalProducts: 0,
            totalRevenue: 0,
          });
        }
      } finally {
        if (mounted) setLoadingSummary(false);
      }
    };

    fetchSummary();
    return () => {
      mounted = false;
    };
  }, []);

  // prepare cards (either from API or fallback)
  const summaryCards = (summary && [
    {
      id: "bills",
      title: "Total Bills",
      value: summary.totalBills ?? 0,
      meta: "Number of bills",
      gradient: "linear-gradient(135deg,#ff8a00,#ff5e3a)",
      icon: <ReceiptIndianRupee />,
    },
    {
      id: "users",
      title: "Total Users",
      value: summary.totalUsers ?? 0,
      meta: "Registered users",
      gradient: "linear-gradient(135deg,#1e3a8a,#3b82f6)",
      icon: <Users />,
    },
    {
      id: "products",
      title: "Total Products",
      value: summary.totalProducts ?? 0,
      meta: "Available products",
      gradient: "linear-gradient(135deg,#059669,#34d399)",
      icon: <ShoppingBasket />,
    },
    {
      id: "revenue",
      title: "Total Revenue",
      value: `₹${summary.totalRevenue ?? 0}`,
      meta: "Revenue generated",
      gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)",
      icon: <Wallet />,
    },
  ]) || [];

  return (
    <div style={styles.page}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Dashboard
          </Title>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {loadingSummary ? (
          [0, 1, 2, 3].map((i) => (
            <Col xs={24} sm={12} md={6} key={`skele-${i}`}>
              <Card style={{ borderRadius: 14, overflow: "hidden", minHeight: 96 }}>
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
              </Card>
            </Col>
          ))
        ) : (
          summaryCards.map((s) => (
            <Col xs={24} sm={12} md={6} key={s.id}>
              <StatCard title={s.title} value={s.value} meta={s.meta} gradient={s.gradient} icon={s.icon} />
            </Col>
          ))
        )}
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <LatestPayments
            payments={LATEST_PAYMENTS}
            filterKey={filterKey}
            setFilterKey={setFilterKey}
            searchQ={searchQ}
            setSearchQ={setSearchQ}
            expandedRowKeys={expandedRowKeys}
            setExpandedRowKeys={setExpandedRowKeys}
          />

          <LatestCollections collections={LATEST_COLLECTIONS} />
        </Col>

        <Col xs={24} lg={6}>
          <Card size="small" style={{ ...styles.roundedCard, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Purchase orders</div>
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Sent orders</div>
                  <div style={{ fontWeight: 800, marginTop: 4 }}>$20</div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Total cost (USD)</div>
                  <div style={{ fontWeight: 800, marginTop: 4 }}>₹4600</div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
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
                  <span style={{ color: "#0ea5e9" }}>→</span>
                </div>
              </div>
            </div>
          </Card>

          <IncomingPOs pos={INCOMING_POS} />
        </Col>

        <Col xs={24} lg={6}>
          <TopProducts products={TOP_PRODUCTS_DATA} />

          <Card size="small" style={{ ...styles.roundedCard, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text type="secondary">Monthly Collections</Text>
                <div style={{ fontSize: 20, fontWeight: 800 }}>₹30,000</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Text type="secondary">Quality</Text>
                <div style={{ fontSize: 12 }}>Status</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardFull;
