// Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../lib/utils";
import logo from "../assets/Dark Logo.png";
import {
  Users,
  Settings,
  CalendarDays,
  LayoutDashboard,
  Bed,
  Building,
  IdCardLanyard,
  SquareUser,
  HousePlus,
  DoorOpen,
  TestTubeDiagonal,
  ToolCase,
  AlignEndVertical,
  ShoppingBasket,
  Tractor,
  ShoppingCart,
  FileInput,
  Package,
  ClipboardCheck,
  X,
  Package as PackageIcon,
  Receipt,
  Box,
  Truck,
  Target,
  FileText,
  LogOut,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openParent, setOpenParent] = useState(null);

  // menu structure adapted from your original Sidebar
  const menu = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      to: "/product",
      label: "Products",
      icon: PackageIcon,
      children: [
        { to: "/product/list", label: "Product List" },
        { to: "/category/list", label: "Category List" },
        { to: "/subcategory/list", label: "Subcategory List" },
      ],
    },
    { to: "/user", label: "Users", icon: Users },
    { to: "/vendor", label: "Vendors", icon: Building },
    { to: "/order", label: "Purchases / Orders", icon: ShoppingCart },
    {
      to: "/billing",
      label: "Sales & Billing",
      icon: Receipt,
      children: [
        { to: "/billing/add", label: "Create Billing" },
        { to: "/billing/list", label: "Billing List" },
      ],
    },
    { to: "/stock/list", label: "Stocks", icon: Box },
    { to: "/inward/list", label: "Inward", icon: Truck },
    { to: "/return", label: "Returns", icon: Receipt },
    { to: "/crm-module", label: "CRM Module", icon: Users },
    { to: "/ai-analytics", label: "AI Analytics", icon: Target },
    { to: "/report", label: "Reports", icon: FileText },
  ];

  useEffect(() => {
    // close any open parent when route changes
    setOpenParent(null);
  }, [pathname]);

  const isLinkActive = (to, children) => {
    if (!to) return false;
    if (children && children.length) {
      return children.some(
        (c) =>
          pathname === c.to ||
          pathname.startsWith(c.to + "/") ||
          pathname.startsWith(to + "/")
      );
    }
    return (
      pathname === to ||
      pathname.startsWith(to + "/") ||
      pathname.includes(to.replace("/list", "").replace("/add", ""))
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between w-full gap-2 px-4 h-[60px] bg-white" style={{ borderBottom: ".5px solid #66708550", alignItems: "center !important" }}>
        <div className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
          <h1 className="text-xl pt-2" style={{fontWeight:"700"}}>Atelier Inventory</h1>
        </div>

        {/* Mobile close button */}
        <button onClick={onClose} className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
          <X size={18} />
        </button>
      </div>

      {/* Scrollable nav */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.to, item.children);
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;

            return (
              <div key={item.to || item.label} className="w-full">
                {/* parent item */}
                <div
                  className={cn(
                    "w-full flex items-center justify-between font-medium  text-[#667085] rounded-md text-[14.5px]  gap-3 p-2 hover:bg-[#DDE4FF] transition-colors duration-200",
                    active ? "bg-[#F2F5FF] !text-[#3D5EE1]" : "text-[#667085]"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={cn(
                        "p-1.5 rounded-sm flex items-center text-[#667085]",
                        active ? "bg-white shadow-sm !text-[#3D5EE1]" : "!text-[#667085]"
                      )}
                    >
                      {Icon ? <Icon size={18} /> : null}
                    </div>

                    {/* If has children, clicking here toggles submenu; otherwise navigate via Link */}
                    {hasChildren ? (
                      <button
                        onClick={() => setOpenParent(openParent === item.to ? null : item.to)}
                        className={cn("flex-1 text-left !text-[#667085]", active ? " !text-[#3D5EE1]" : "!text-[#667085]")}
                        aria-expanded={openParent === item.to}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        to={item.to}
                        onClick={() => onClose?.()}
                        className={cn("flex-1 text-left !text-[#667085]", active ? " !text-[#3D5EE1]" : "!text-[#667085]")}
                        
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>

                  {/* chevron for parents */}
                  {hasChildren && (
                    <button
                      onClick={() => setOpenParent(openParent === item.to ? null : item.to)}
                      className={cn(
                        "text-sm px-2 py-1 rounded !text-[#667085]",
                        openParent === item.to ? "rotate-180" : ""
                      )}
                      aria-label="toggle submenu"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* children */}
                {hasChildren && openParent === item.to && (
                  <div className="mt-1 ml-8 flex flex-col gap-1">
                    {item.children.map((child) => {
                      const childActive =
                        pathname === child.to || pathname.startsWith(child.to + "/");
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={() => onClose?.()}
                          className={cn(
                            "w-full text-[16px] py-2 px-3 rounded-md text-left !text-[#667085] hover:bg-gray-100",
                            childActive ? "bg-blue-50 !text-[#3D5EE1]" : "text-[#667085] hover:bg-gray-50"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 bg-white text-[14px]" style={{ borderTop: ".5px solid #66708550" }}>
        <div
          onClick={() => navigate("/settings")}
          className="flex items-center justify-start gap-2 w-full font-medium p-2 rounded-md cursor-pointer hover:bg-gray-100 text-[#667085]"
        >
          <Settings size={16} />
          Settings
        </div>

      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-white shadow-lg sticky top-0">
        <SidebarContent />
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Mobile slide-in */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
