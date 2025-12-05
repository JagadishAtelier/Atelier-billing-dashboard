// Header.jsx
import React, { useEffect, useState } from "react";
import { Popover, Dropdown, List, Avatar, message } from "antd";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import companyLogo from "../assets/Company_logo.png";
import { Input } from "antd"; 

const HeaderBar = ({ collapsed /* optional */ }) => {
  const { theme, headerBgColor, headerGradient } = useTheme();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const recentBills = [
    { id: 1, customer: "John Doe", amount: 1280.5 },
    { id: 2, customer: "Alice Rao", amount: 560.0 },
    { id: 3, customer: "Mohan Kumar", amount: 2300.75 },
  ];

  const notificationContent = (
    <div style={{ minWidth: 300 }}>
      <div style={{ padding: 12, fontWeight: 600 }}>Recent bills</div>
      <List
        size="small"
        dataSource={recentBills}
        renderItem={(item) => (
          <List.Item key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar style={{ backgroundColor: "#eef2ff", color: "#3730a3" }}>{item.customer.charAt(0)}</Avatar>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.customer}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Recent bill</div>
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>₹{item.amount.toFixed(2)}</div>
          </List.Item>
        )}
      />
      <div style={{ textAlign: "center", padding: 8, borderTop: "1px solid #f3f4f6" }}>
        <a onClick={() => message.info("Open all notifications")}>View all</a>
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
        left: collapsed ? 255 : 320,
        right: 0,
        zIndex: 100,
        borderBottom: ".5px solid #66708550",
        // boxShadow: "0 2px 4px rgba(0,0,0,0.12)"
      }}
    >

      {/* LEFT SIDE SEARCH INPUT ADDED HERE */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Input.Search
          placeholder="Search..."
          style={{ width: 280, borderRadius: 8 }}
          onSearch={(value) => console.log(value)}
        />
      </div>

      {/* RIGHT SIDE (No change) */}
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
          
          <motion.button whileHover={{ scale: 1.03 }} style={{ display: "flex", gap: 10, alignItems: "center", padding: 6, borderRadius: 10, background: theme === "dark" ? "#374151" : "#f3f4f6", border: "none", cursor: "pointer" }}>
            <div style={{ width: 36, height: 30, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>JD</div>
            <div style={{ display: isMobile ? "none" : "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ color: textColor, fontWeight: 600, fontSize: 12 }}>John Doe</span>
              <span style={{ color: theme === "dark" ? "#9CA3AF" : "#6B7280", fontSize: 10 }}>Super Admin</span>
            </div>
            <ChevronDown style={{ width: 14, height: 14, color: "#9ca3af" }} />
          </motion.button>
        </Dropdown>
      </div>

    </header>
  );
};

export default HeaderBar;
