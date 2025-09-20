// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import companyLogo from "../assets/Company_logo.png";
import logo from "../assets/Dark Logo.png";
import settingsIcon from "../assets/technology.png";
import { useTheme } from "../../context/ThemeContext";
import {
  DownOutlined,
  UpOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  MenuOutlined,
  CloseOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  FileTextOutlined,
  DropboxOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";


const Sidebar = ({ collapsed = false, setCollapsed = () => {} }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, primaryColor, sidebarBgColor } = useTheme();
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Menu structure
    const menuItems = [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    {
      key: "Billing",
      label: "Casier Billing",
      icon: <FileTextOutlined />,
      children: [
        { key: "/billing/list", label: "Billing List", icon: <UnorderedListOutlined /> },
        { key: "/billing/add", label: "Add Billing", icon: <PlusOutlined /> },
      ],
    },
    { key: "/billing/customer-add", label: "Self Checkout", icon: <PlusOutlined /> },
    // {
    //   key: "Self Checkout",
    //   label: "Customers Billing",
    //   icon: <UserOutlined />,
    //   children: [{ key: "/billing/customer-add", label: "Add Customer Billing", icon: <PlusOutlined /> }],
    // },
    {
      key: "Product",
      label: "Product",
      icon: <DropboxOutlined />,
      children: [
        { key: "/product/list", label: "Product List", icon: <UnorderedListOutlined /> },
        { key: "/product/add", label: "Add Product", icon: <PlusOutlined /> },
        { key: "/category/list", label: "Category List", icon: <UnorderedListOutlined /> },
        { key: "/category/add", label: "Add Category", icon: <PlusOutlined /> },
        { key: "/subcategory/list", label: "Subcategory List", icon: <UnorderedListOutlined /> },
        { key: "/subcategory/add", label: "Add Subcategory", icon: <PlusOutlined /> },
      ],
    },
    
    {
      key: "Inward",
      label: "Inward",
      icon: <ShoppingCartOutlined />,
      children: [
        { key: "/inward/list", label: "Inward List", icon: <UnorderedListOutlined /> },
        { key: "/inward/add", label: "Add Inward", icon: <PlusOutlined /> },
      ],
    },
    { key: "/stock/list", label: "Stocks", icon: <DatabaseOutlined /> },
  ];


  // Check if a menu or submenu is active
  const isActive = (key) => {
    if (!key) return false;
    if (key === "Product") return ["/product", "/category", "/subcategory"].some((p) => pathname.startsWith(p));
    return pathname === key || pathname.startsWith(key + "/") || pathname.includes(key.replace("/list", "").replace("/add", ""));
  };

  return (
    <>
      {/* Mobile Hamburger / Close */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 2100,
            cursor: "pointer",
            background: "#fff",
            borderRadius: "50%",
            padding: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {/* Show Menu when closed (collapsed === false), Close when open (collapsed === true) */}
          {collapsed ? <CloseOutlined /> : <MenuOutlined />}
        </div>
      )}

      <AnimatePresence initial={false}>
        {/* IMPORTANT: For mobile render when drawer is OPEN (collapsed === true). For desktop always render. */}
        {(isMobile ? collapsed : true) && (
          <>
            {/* Mobile Overlay (show when drawer is open) */}
            {isMobile && collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "black",
                  zIndex: 1500,
                }}
                // Close drawer/overlay on click
                onClick={() => setCollapsed(false)}
              />
            )}

            {/* Sidebar */}
            <motion.div
              initial={{ x: isMobile ? -300 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -300 : 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                height: "100%",
                width: collapsed && !isMobile ? 60 : isMobile ? 200 : 200,
                backgroundColor: theme === "dark" ? "#1f2937" : sidebarBgColor,
                boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                position: isMobile ? "fixed" : "relative",
                top: 0,
                left: 0,
                zIndex: 1601,
              }}
            >
              {/* Logo */}
              <div style={{ display: "flex", justifyContent: "center", padding: !collapsed || isMobile ? 8 : 16 }}>
                <img
                  src={!collapsed || isMobile ? companyLogo : logo}
                  alt="Logo"
                  style={{
                    height: !collapsed || isMobile ? 48 : 16,
                    width: !collapsed || isMobile ? "auto" : 24,
                  }}
                />
              </div>

              {/* Menu */}
              <div style={{ flexGrow: 1, overflowY: "auto", padding: 8 }}>
                {menuItems.map((item) => (
                  <div key={item.key}>
                    <div
                      onClick={() => {
                        if (item.children) {
                          setOpenMenu(openMenu === item.key ? null : item.key);
                        } else {
                          navigate(item.key);
                          // Close drawer on mobile AFTER navigation
                          if (isMobile) setCollapsed(false);
                          setOpenMenu(null);
                        }
                      }}
                      style={{
                        padding: collapsed && !isMobile ? 8 : "8px 16px",
                        cursor: "pointer",
                        margin: "4px 0",
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        color: isActive(item.key) ? primaryColor : theme === "dark" ? "#d1d5db" : "#ffffff",
                        backgroundColor: isActive(item.key) ? (theme === "dark" ? "#4b5563" : "#e5e7eb") : "transparent",
                        fontWeight: isActive(item.key) ? "bold" : 500,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {item.icon}
                      {(!collapsed || isMobile) && <span style={{ marginLeft: 8 }}>{item.label}</span>}
                      {item.children && (!collapsed || isMobile) && (
                        <span style={{ marginLeft: "auto", fontSize: 12 }}>
                          {openMenu === item.key ? <UpOutlined /> : <DownOutlined />}
                        </span>
                      )}
                    </div>

                    {/* Submenu */}
                    <AnimatePresence initial={false}>
                      {item.children && openMenu === item.key && (!collapsed || isMobile) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ marginLeft: 24, overflow: "hidden" }}
                        >
                          {item.children.map((child) => (
                            <div
                              key={child.key}
                              onClick={() => {
                                navigate(child.key);
                                // Close drawer on mobile AFTER navigation
                                if (isMobile) setCollapsed(false);
                                setOpenMenu(null);
                              }}
                              style={{
                                padding: "4px 8px",
                                cursor: "pointer",
                                margin: "2px 0",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                color: isActive(child.key) ? primaryColor : theme === "dark" ? "#d1d5db" : "#ffffff",
                                backgroundColor: isActive(child.key) ? (theme === "dark" ? "#4b5563" : "#e0e7ff") : "transparent",
                                fontWeight: isActive(child.key) ? "bold" : 500,
                                transition: "all 0.3s ease",
                              }}
                            >
                              {child.icon}
                              <span style={{ marginLeft: 8 }}>{child.label}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Settings */}
              {/* <div
                style={{
                  padding: 12,
                  display: "flex",
                  justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigate("/settings");
                  // Close mobile drawer when navigating to settings
                  if (isMobile) setCollapsed(false);
                }}
              >
                <img
                  src={settingsIcon}
                  alt="Settings"
                  style={{
                    width: 22,
                    height: 22,
                    marginRight: collapsed && !isMobile ? 0 : 8,
                  }}
                />
                {(!collapsed || isMobile) && <span>Settings</span>}
              </div> */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
