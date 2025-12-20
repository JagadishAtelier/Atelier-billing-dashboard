// Header.jsx (fetch recent 3 bills from billingService)
import React, { useEffect, useState } from "react";
import { Popover, Dropdown, List, Avatar, message } from "antd";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Menu, Search, Command } from "lucide-react";
import { motion } from "framer-motion";
import companyLogo from "../assets/Company_logo.png";
import { Input } from "antd";

// import your billing service (adjust path if needed)
import billingService from "../../billing/service/billingService";

const HeaderBar = ({ collapsed /* optional */, setCollapsed /* optional */ }) => {
  const { theme, headerBgColor, headerGradient } = useTheme();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // state for recent bills
  const [recentBills, setRecentBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch latest 3 bills on mount (defensive parsing)
  useEffect(() => {
    let mounted = true;
    const fetchRecentBills = async () => {
      setLoadingBills(true);
      try {
        // Request with limit=3 (API will vary; billingService.getAll returns res.data)
        const res = await billingService.getAll({ page: 1, limit: 3, sort_by: "createdAt", order: "desc" });

        // billingService.getAll returns res.data (or the API may return { data: [...] })
        // handle both shapes defensively:
        let items = [];
        if (!res) items = [];
        else if (Array.isArray(res)) items = res;
        else if (Array.isArray(res.data)) items = res.data;
        else if (Array.isArray(res.data?.data)) items = res.data.data; // extremely defensive
        else if (Array.isArray(res.results)) items = res.results;
        else items = [];

        if (mounted) setRecentBills(items.slice(0, 3));
      } catch (err) {
        console.error("Failed to load recent bills:", err);
        message.error("Unable to load notifications");
        if (mounted) setRecentBills([]);
      } finally {
        if (mounted) setLoadingBills(false);
      }
    };

    fetchRecentBills();
    return () => {
      mounted = false;
    };
  }, []);

  const notificationContent = (
    <div style={{ minWidth: 220 }}>
      <div style={{ padding: 10, fontWeight: 600 }}>Recent bills</div>

      <List
        size="small"
        loading={loadingBills}
        dataSource={recentBills}
        locale={{ emptyText: loadingBills ? "Loading..." : "No recent bills" }}
        renderItem={(item) => (
          <List.Item
            key={item.id || item.billing_no}
            style={{ display: "flex", justifyContent: "space-between", padding: 10 }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar style={{ backgroundColor: "#eef2ff", color: "#3730a3" }}>
                {(item.customer_name || item.customer || "U").charAt(0)}
              </Avatar>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {item.customer_name || item.customer || "Unknown"}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {item.billing_no ? `#${item.billing_no}` : "Recent bill"}
                </div>
              </div>
            </div>

            <div style={{ fontWeight: 700 }}>
              {/* format amount defensively */}
              {typeof item.total_amount === "number"
                ? `₹${item.total_amount.toFixed(2)}`
                : item.total_amount || item.subtotal_amount || "—"}
            </div>
          </List.Item>
        )}
      />

      <div style={{ textAlign: "center", padding: 8, borderTop: "1px solid #f3f4f6" }}>
        <a
          onClick={() => {
            message.info("Open all notifications");
            navigate("/billing/list"); // optional: navigate to billings page
          }}
        >
          View all
        </a>
      </div>
    </div>
  );

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      message.success("Logged out");
      navigate("/");
    } else if (key === "profile") {
      navigate("/profile");
    }
  };

  const userMenu = (
    <div style={{ width: 180, background: "#fff", borderRadius: 8, boxShadow: "0 8px 20px rgba(2,6,23,0.08)", overflow: "hidden" }}>
      <button onClick={() => handleMenuClick({ key: "profile" })} style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", padding: "10px 12px", border: "none", background: "transparent", cursor: "pointer" }}>
        <User style={{ width: 16, height: 16 }} />
        <span style={{ fontSize: 14 }}>Profile</span>
      </button>
      <div style={{ height: 1, background: "rgba(0,0,0,0.04)" }} />
      <button onClick={() => handleMenuClick({ key: "logout" })} style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", padding: "10px 12px", border: "none", background: "transparent", color: "#dc2626", cursor: "pointer" }}>
        <LogOut style={{ width: 16, height: 16 }} />
        <span style={{ fontSize: 14 }}>Logout</span>
      </button>
    </div>
  );

  const isGradient = headerGradient && headerGradient.includes("gradient");
  const headerStyle = isGradient ? { background: headerGradient } : { backgroundColor: "#fff" };
  const textColor = theme === "dark" || isGradient ? "#fff" : "#011D4A";

  // adjust left position so header stays aligned with collapsed sidebar
  const leftPosition = collapsed ? 60 : 260;

  return (
    <header
      style={{
        ...headerStyle,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "fixed",
        top: 0,
        left: leftPosition,
        right: 0,
        zIndex: 100,
        borderBottom: ".5px solid #66708550",
      }}
    >
      {/* LEFT SIDE: toggle + search */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Toggle button (hamburger) */}
        <button
          onClick={() => typeof setCollapsed === "function" && setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={18} style={{ color: textColor }} />
        </button>

        <div className="relative w-56 sm:w-64 hidden sm:block">
          <Input
            type="text"
            placeholder="Search"
            className="!pl-[30px] pr-10 py-4 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <Search
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 shadow-sm p-1 rounded-sm border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer">
            <Command size={14} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Popover content={notificationContent} trigger="click" placement="bottomRight">
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }} aria-label="Notifications" style={{ position: "relative", padding: 8, borderRadius: 10, background: theme === "dark" ? "#374151" : "#f3f4f6", border: "none", cursor: "pointer" }}>
            <Bell style={{ width: 20, height: 20, color: textColor }} />
            <span style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9999, background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
              {recentBills.length}
            </span>
          </motion.button>
        </Popover>

        <Dropdown overlay={userMenu} placement="bottomRight" trigger={["click"]}>
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/049/174/246/small/a-smiling-young-indian-man-with-formal-shirts-outdoors-photo.jpg"
            alt="user"
            className="h-9 w-9 rounded-full border border-gray-200 object-cover cursor-pointer hover:ring-2 hover:ring-indigo-100"
          />
        </Dropdown>
      </div>
    </header>
  );
};

export default HeaderBar;
