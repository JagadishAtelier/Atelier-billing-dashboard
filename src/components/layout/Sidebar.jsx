// Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// import companyLogo from "../assets/Company_logo.png";
// import logo from "../assets/Dark Logo.png";
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
import { Popover } from "antd";

/**
 * Sidebar component with modern popup for collapsed state.
 * - When collapsed (desktop) clicking a parent with children shows a modern Popover flyout.
 * - Inline expansion is used when not collapsed or on mobile.
 *
 * Fixes applied:
 * - Popover rendered inside sidebar container via getPopupContainer.
 * - destroyTooltipOnHide used for clean unmount.
 * - child click calls navigate(...) first, then closes the popover.
 * - parent will be considered active if any of its children match the current route.
 */

const Sidebar = ({ collapsed = true, setCollapsed = () => {}, selectedParent, setSelectedParent }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, primaryColor, sidebarBgColor } = useTheme();
  const [openMenu, setOpenMenu] = useState(null); // stores key of open inline menu OR open popover
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const containerRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close popup when clicking outside (guard). Only closes popover when collapsed & desktop.
  useEffect(() => {
    const handleDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpenMenu((prev) => {
          return prev && collapsed && !isMobile ? null : prev;
        });
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [collapsed, isMobile]);

  // === static menu ===
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
  // ===================

  // determine active state (improved: parents become active if any child matches current route)
  const isActive = (key) => {
    if (!key) return false;

    // If this key matches a parent item that has children, check children's routes
    const parentItem = menuItems.find((m) => m.key === key);
    if (parentItem && parentItem.children && parentItem.children.length > 0) {
      return parentItem.children.some((c) => {
        return (
          pathname === c.key ||
          pathname.startsWith(c.key + "/") ||
          pathname.includes(c.key.replace("/list", "").replace("/add", ""))
        );
      });
    }

    // Otherwise normal match for direct routes
    return (
      pathname === key ||
      pathname.startsWith(key + "/") ||
      pathname.includes(key.replace("/list", "").replace("/add", ""))
    );
  };

  // Build modern popover content for children
  const buildPopoverContent = (item) => {
    const bg = theme === "dark" ? "#111827" : "#ffffff";
    const text = theme === "dark" ? "#e5e7eb" : "#111827";
    const border = theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";

    return (
      <div
        style={{
          minWidth: 220,
          borderRadius: 10,
          boxShadow: "0 8px 30px rgba(2,6,23,0.2)",
          background: bg,
          color: text,
          overflow: "hidden",
          border: `1px solid ${border}`,
        }}
        // stopPropagation so popover clicks don't bubble to document handler
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${border}`, fontWeight: 700 }}>
          {item.label}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8 }}>
          {item.children.map((child) => {
            const active = isActive(child.key);
            return (
              <div
                key={child.key}
                onClick={(e) => {
                  // ensure click doesn't bubble and interfere with popover visibility handlers
                  e.stopPropagation();
                  // navigate first, then close popover
                  navigate(child.key);
                  setOpenMenu(null);
                  // keep sidebar collapsed on desktop; if mobile, close drawer
                  if (isMobile) setCollapsed(false);
                }}
                role="button"
                tabIndex={0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: active ? (theme === "dark" ? "#111827" : "#eef2ff") : "transparent",
                  color: active ? primaryColor : text,
                  fontWeight: active ? 700 : 500,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {child.icon}
                </span>
                <div style={{ fontSize: 14 }}>{child.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // render parent button: when collapsed + desktop + has children => show popover, else inline expand or navigate
  const renderParentButton = (item) => {
    const active = isActive(item.key);

    // Collapsed & Desktop & has children => use Popover (modern flyout)
    if (collapsed && !isMobile && item.children) {
      return (
        <Popover
          content={buildPopoverContent(item)}
          trigger="click"
          placement="rightTop"
          overlayClassName="sidebar-flyout-popover"
          visible={openMenu === item.key}
          onVisibleChange={(visible) => setOpenMenu(visible ? item.key : null)}
          getPopupContainer={() => containerRef.current || document.body} // IMPORTANT: render inside sidebar container
          destroyTooltipOnHide // unmount content when hidden to avoid stale handlers
          overlayStyle={{ zIndex: 3000 }}
        >
          <div
            style={{
              padding: 8,
              cursor: "pointer",
              margin: "4px 0",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              color: active ? primaryColor : theme === "dark" ? "#ffffff" : "#111827",
              background: active ? (theme === "dark" ? "#1C2244" : "#e5e7eb") : "transparent",
              fontWeight: active ? "bold" : 500,
              transition: "all 0.15s ease",
            }}
            // stopPropagation to avoid immediate document click handler closing popover in some edge cases
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {item.icon}
            </span>
            {!collapsed && <span style={{ marginLeft: 8 }}>{item.label}</span>}
          </div>
        </Popover>
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
          transition: "all 0.2s ease",
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
          <div ref={containerRef}>
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
              {/* Top (toggle + small logo) */}
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
                    {/* small logo intentionally omitted if you don't want it */}
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div style={{ flexGrow: 1, overflowY: "auto", padding: 8 }}>
                {menuItems.map((item) => (
                  <div key={item.key}>
                    {renderParentButton(item)}

                    {/* Inline submenu when expanded or on mobile */}
                    <AnimatePresence initial={false}>
                      {item.children && openMenu === item.key && (!collapsed || isMobile) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          style={{ marginLeft: 24, overflow: "hidden" }}
                        >
                          {item.children.map((child) => {
                            const childActive = isActive(child.key);
                            return (
                              <div
                                key={child.key}
                                onClick={() => {
                                  // navigate and keep parent open (so it's visibly active)
                                  navigate(child.key);
                                  setOpenMenu(item.key); // keep parent open / active in inline mode
                                  if (isMobile) setCollapsed(false);
                                }}
                                style={{
                                  padding: "6px 8px",
                                  cursor: "pointer",
                                  margin: "6px 0",
                                  borderRadius: 6,
                                  display: "flex",
                                  alignItems: "center",
                                  color: childActive ? primaryColor : theme === "dark" ? "#d1d5db" : "#111827",
                                  backgroundColor: childActive ? (theme === "dark" ? "#111827" : "#eaf2ff") : "transparent",
                                  fontWeight: childActive ? "700" : 500,
                                  transition: "all 0.15s ease",
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

              {/* optional footer (commented) */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
