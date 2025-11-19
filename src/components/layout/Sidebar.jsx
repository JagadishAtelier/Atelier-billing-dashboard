// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  LogOut,
  ChevronDown,
  Box,
  Truck,
  Target
} from "lucide-react";
import logo from "../assets/Dark Logo.png"

/**
 * Sidebar
 * - Header and Footer are static (non-scrolling)
 * - Center nav is the only scrollable area (overflow-y-auto)
 * - Removed fixed positioning so it can be used inside AntD Sider/Drawer
 * - Preserves collapsed behavior (icons-only when collapsed)
 *
 * Usage:
 * <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} ... />
 */

const Sidebar = ({ collapsed = true, setCollapsed = () => {}, selectedParent, setSelectedParent }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // NEW: drawer state for collapsed mode
  const [drawerOpen, setDrawerOpen] = useState(null); // store parent key or null
  const [drawerChildren, setDrawerChildren] = useState([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // close drawer when route changes
  useEffect(() => {
    setDrawerOpen(null);
  }, [pathname]);

  const menuItems = [
    { key: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "blue" },
    {
      key: "/product",
      label: "Products & Stock",
      icon: Package,
      color: "purple",
      children: [
        { key: "/product/list", label: "Product List" },
        { key: "/category/list", label: "Category List" },
        { key: "/subcategory/list", label: "Subcategory List" },
      ],
    },
    { key: "/order", label: "Purchases / Orders", icon: ShoppingCart, color: "green" },
    {
      key: "/billing",
      label: "Sales & Billing",
      icon: Receipt,
      color: "orange",
      children: [
        { key: "/billing/add", label: "Create Billing" },
        { key: "/billing/list", label: "Billing List" },
      ],
    },
    { key: "/stock/list", label: "Stocks", icon: Box, color: "teal" },
    { key: "/inward/list", label: "Inward", icon: Truck, color: "cyan" },
    { key: "/return", label: "Returns", icon: Receipt, color: "red" },
    { key: "/crm-module", label: "CRM Module", icon: Users, color: "purple" },
    { key: "/ai-analytics", label: "AI Analytics", icon: Target, color: "yellow" },
    { key: "/report", label: "Reports", icon: FileText, color: "teal" },
  ];

  const isActive = (key) => {
    if (!key) return false;
    const parent = menuItems.find((m) => m.key === key);
    if (parent && parent.children) {
      return parent.children.some(
        (c) =>
          pathname === c.key ||
          pathname.startsWith(c.key + "/") ||
          pathname.includes(c.key.replace("/list", "").replace("/add", ""))
      );
    }
    return (
      pathname === key ||
      pathname.startsWith(key + "/") ||
      pathname.includes(key.replace("/list", "").replace("/add", ""))
    );
  };

  return (
    // The wrapper is full viewport height. Header/footer are flex-shrink-0 so they stay static.
    <aside
      aria-label="sidebar"
      className={`flex flex-col h-screen transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
    >
      <div className="flex flex-col h-full bg-white border border-gray-100 shadow-lg">
        {/* Header - static (not part of the scrollable area) */}
        <div
          className={`flex items-center justify-between flex-shrink-0 p-3 ${collapsed ? "px-2" : "px-4"} bg-gradient-to-r from-blue-600 to-purple-600`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-11 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <img src={logo} className="w-5 h-8" />
            </div>

            {/* Title hides when collapsed */}
            {!collapsed && <div className="text-white font-semibold truncate">Atlier Inventory</div>}
          </div>

          <button
            onClick={() => setCollapsed((p) => !p)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors !text-white"
            aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Center nav - scrollable area */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 ${collapsed ? "" : "p-3"}`}
          // Add some a11y attributes
          aria-label="Main navigation"
        >
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.key);

              return (
                <div key={item.key}>
                  <motion.button
                    onClick={() => {
                      // If item has children:
                      if (item.children) {
                        // If collapsed -> open drawer/popover for children
                        if (collapsed) {
                          // toggle drawer for this parent
                          if (drawerOpen === item.key) {
                            setDrawerOpen(null);
                            setDrawerChildren([]);
                          } else {
                            setDrawerChildren(item.children);
                            setDrawerOpen(item.key);
                            setSelectedParent && setSelectedParent(item.key);
                          }
                        } else {
                          // normal expanded inline behavior
                          setOpenMenu(openMenu === item.key ? null : item.key);
                          setSelectedParent && setSelectedParent(item.key);
                        }
                      } else {
                        // no children -> navigate
                        navigate(item.key);
                        setOpenMenu(null);
                        setSelectedParent && setSelectedParent(item.key);
                        if (isMobile) setCollapsed(false);
                      }
                    }}
                    whileHover={{ scale: collapsed ? 1.02 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      active ? "bg-gradient-to-r from-blue-500 to-purple-500 !text-white shadow-md" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {Icon ? <Icon className="w-5 h-5 flex-shrink-0" /> : <div className="w-5 h-5" />}

                    {/* label and chevron shown only when expanded */}
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1 text-sm">{item.label}</span>
                        {item.children && (
                          <span className={`text-xs flex-shrink-0 ml-2 ${openMenu === item.key ? "rotate-180" : ""}`}>
                            <ChevronDown className="w-4 h-4" />
                          </span>
                        )}
                      </>
                    )}

                    {active && !collapsed && (
                      <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </motion.button>

                  {/* submenu (inline) */}
                  {!collapsed && item.children && openMenu === item.key && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2 ml-6 flex flex-col gap-2 overflow-hidden"
                      >
                        {item.children.map((child) => {
                          const childActive = pathname === child.key || pathname.startsWith(child.key + "/");
                          return (
                            <button
                              key={child.key}
                              onClick={() => {
                                navigate(child.key);
                                setSelectedParent && setSelectedParent(item.key);
                                if (isMobile) setCollapsed(false);
                              }}
                              className={`text-sm w-full text-left px-3 py-2 rounded-lg ${
                                childActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {child.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer / User area - static (not scrollable) */}
        <div className={`flex-shrink-0 p-3 border-t bg-white ${collapsed ? "px-2" : ""}`}>
          {!collapsed ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">JD</div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-gray-900 truncate">John Doe</p>
                  <p className="text-gray-500 text-xs">Super Admin</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10"
                  >
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/settings");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/logout");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors border-t border-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <button onClick={() => navigate("/logout")} title="Logout" className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DRAWER for collapsed mode - shows children of clicked parent */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* backdrop */}
            <motion.div
              key="sidebar-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={() => {
                setDrawerOpen(null);
                setDrawerChildren([]);
              }}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* drawer panel */}
            <motion.div
              key="sidebar-drawer-panel"
              initial={{ x: -8, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              // position just to the right of the sidebar. left-20 == 5rem (w-20), left-64 == 16rem (w-64)
              className={`fixed top-16 z-50 ${collapsed ? "left-20" : "left-64"} w-56 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden`}
            >
              <div className="p-3 border-b">
                <div className="text-sm font-medium">Options</div>
                <div className="text-xs text-gray-500 truncate">Select an action</div>
              </div>

              <div className="flex flex-col p-2">
                {drawerChildren.map((child) => {
                  const childActive = pathname === child.key || pathname.startsWith(child.key + "/");
                  return (
                    <button
                      key={child.key}
                      onClick={() => {
                        navigate(child.key);
                        setDrawerOpen(null);
                        setDrawerChildren([]);
                        setSelectedParent && setSelectedParent(null);
                        if (isMobile) setCollapsed(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg my-1 text-sm ${
                        childActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {child.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;
