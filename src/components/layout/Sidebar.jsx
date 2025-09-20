// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import companyLogo from "../assets/Company_logo.png";
import logo from "../assets/Dark Logo.png";
import { useTheme } from "../../context/ThemeContext";
import {
  DownOutlined,
  UpOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  MenuOutlined,
  CloseOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  DropboxOutlined,
  DatabaseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

/**
 * Sidebar component
 * - Always uses the static menuItems you provided (ignores parentMenuItems prop).
 * - No artificial filled backgrounds for icons.
 * - Clicking a parent when sidebar is collapsed (desktop) expands sidebar and opens submenu inline.
 */

const Sidebar = ({ collapsed = true, setCollapsed = () => {}, selectedParent, setSelectedParent }) => {
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

  // === ALWAYS SHOW ONLY THIS MENU ===
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
  // =================================

  // Determine if a menu or submenu is active
  const isActive = (key) => {
    if (!key) return false;
    if (key === "Product")
      return ["/product", "/category", "/subcategory"].some((p) => pathname.startsWith(p));
    return (
      pathname === key ||
      pathname.startsWith(key + "/") ||
      pathname.includes(key.replace("/list", "").replace("/add", ""))
    );
  };

  // Render parent item. If collapsed on desktop and parent has children => expand + open submenu.
  const renderParentButton = (item) => {
    const active = isActive(item.key);

    if (collapsed && !isMobile && item.children) {
      return (
        <div
          onClick={() => {
            setCollapsed(false); // expand sidebar
            setOpenMenu(item.key); // open submenu inline
          }}
          style={{
            padding: 8,
            cursor: "pointer",
            margin: "4px 0",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            color: active ? primaryColor : theme === "dark" ? "#d1d5db" : "#111827",
            background: active ? (theme === "dark" ? "#4b5563" : "#e5e7eb") : "transparent",
            fontWeight: active ? "bold" : 500,
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {item.icon}
          </span>
          {!collapsed && <span style={{ marginLeft: 8 }}>{item.label}</span>}
        </div>
      );
    }

    // Normal behavior (not collapsed or mobile)
    return (
      <div
        onClick={() => {
          if (item.children) {
            setOpenMenu(openMenu === item.key ? null : item.key);
          } else {
            navigate(item.key);
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
          color: active ? primaryColor : theme === "dark" ? "#d1d5db" : "#111827",
          backgroundColor: active ? (theme === "dark" ? "#4b5563" : "#e5e7eb") : "transparent",
          fontWeight: active ? "bold" : 500,
          transition: "all 0.3s ease",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {item.icon}
        </span>
        {(!collapsed || isMobile) && <span style={{ marginLeft: 8 }}>{item.label}</span>}
        {item.children && (!collapsed || isMobile) && (
          <span style={{ marginLeft: "auto", fontSize: 12 }}>{openMenu === item.key ? <UpOutlined /> : <DownOutlined />}</span>
        )}
      </div>
    );
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
          {collapsed ? <CloseOutlined /> : <MenuOutlined />}
        </div>
      )}

      <AnimatePresence initial={false}>
        {(isMobile ? collapsed : true) && (
          <>
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
                onClick={() => setCollapsed(false)}
              />
            )}

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
              {/* Top (toggle + optional small logo) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed && !isMobile ? "center" : "space-between",
                  padding: "8px 10px",
                }}
              >
                <div>
                  <div
                    onClick={() => setCollapsed((prev) => !prev)}
                    style={{
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      background: "#fff",
                      borderRadius: 8,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    title={collapsed ? "Open sidebar" : "Close sidebar"}
                  >
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  </div>
                </div>

                {(!collapsed || isMobile) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                      src={!collapsed || isMobile ? companyLogo : logo}
                      alt="Logo"
                      style={{
                        height: 36,
                        width: "auto",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigate("/dashboard");
                        if (isMobile) setCollapsed(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div style={{ flexGrow: 1, overflowY: "auto", padding: 8 }}>
                {menuItems.map((item) => (
                  <div key={item.key}>
                    {renderParentButton(item)}

                    {/* Submenu inline when open */}
                    <AnimatePresence initial={false}>
                      {item.children && openMenu === item.key && (!collapsed || isMobile) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ marginLeft: 24, overflow: "hidden" }}
                        >
                          {item.children.map((child) => {
                            const childActive = isActive(child.key);
                            return (
                              <div
                                key={child.key}
                                onClick={() => {
                                  navigate(child.key);
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
                                  color: childActive ? primaryColor : theme === "dark" ? "#d1d5db" : "#111827",
                                  backgroundColor: childActive ? (theme === "dark" ? "#4b5563" : "#e0e7ff") : "transparent",
                                  fontWeight: childActive ? "bold" : 500,
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <span style={{ marginRight: 8 }}>{child.icon}</span>
                                <span style={{ marginLeft: 8 }}>{child.label}</span>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Optional footer settings link (commented out) */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
