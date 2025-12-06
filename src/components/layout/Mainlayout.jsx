// MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Layout, ConfigProvider, Drawer, Button, Radio, Tabs, Tooltip, Card } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderBar from "./Header";
import { SettingOutlined, CheckOutlined, BgColorsOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { SketchPicker } from "react-color";
import { useTheme } from "../../context/ThemeContext";
import AppFooter from "./Footer";

// sonner toasts
import { toast, Toaster } from "sonner";

const { Sider, Content } = Layout;
const { TabPane } = Tabs;

const MainLayout = ({ menuItems }) => {
  // collapsed controls desktop collapsed state (true = collapsed)
  const [collapsed, setCollapsed] = useState(true);
  // mobileOpen shows Drawer on mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const {
    theme,
    setTheme,
    layoutType,
    primaryColor,
    setPrimaryColor,
    contentBgColor,
    setContentBgColor,
    headerBgColor,
    headerGradient,
    setHeaderGradient,
    sidebarBgColor,
    setSidebarBgColor,
    footerBgColor,
    setFooterBgColor,
    resetTheme,
    commonColorSchemes,
    applyCommonColorScheme,
    createGradientFromColor,
  } = useTheme();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapsed = () => setCollapsed((c) => !c);
  const openSettings = () => setSettingsVisible(true);
  const closeSettings = () => setSettingsVisible(false);

  // fallback menu items
  const defaultMenuItems = [
    { key: "/dashboard", label: "Dashboard", icon: null },
    {
      key: "Customers Billing",
      label: "Customers Billing",
      children: [{ key: "/billing/customer-add", label: "Add Customer Billing" }],
    },
    {
      key: "Product",
      label: "Product",
      children: [
        { key: "/product/list", label: "Product List" },
        { key: "/product/add", label: "Add Product" },
        { key: "/category/list", label: "Category List" },
        { key: "/category/add", label: "Add Category" },
        { key: "/subcategory/list", label: "Subcategory List" },
        { key: "/subcategory/add", label: "Add Subcategory" },
      ],
    },
    {
      key: "Billing",
      label: "Billing",
      children: [
        { key: "/billing/list", label: "Billing List" },
        { key: "/billing/add", label: "Add Billing" },
      ],
    },
    {
      key: "Inward",
      label: "Inward",
      children: [
        { key: "/inward/list", label: "Inward List" },
        { key: "/inward/add", label: "Add Inward" },
      ],
    },
    { key: "/stock/list", label: "Stocks" },
  ];

  const menuItemsToUse = menuItems && menuItems.length ? menuItems : defaultMenuItems;

  // header height constant
  const HEADER_HEIGHT = 0;
  const SIDER_WIDTH = 280;
  const COLLAPSED_WIDTH = 255;

  // content left margin for desktop
  const contentMarginLeft = isMobile ? 0 : (collapsed ? COLLAPSED_WIDTH : SIDER_WIDTH);

  // color inputs for custom gradient
  const [color1, setColor1] = useState("#4facfe");
  const [color2, setColor2] = useState("#00f2fe");

  const updateGradient = (c1, c2) => {
    const gradient = `linear-gradient(to right, ${c1}, ${c2})`;
    setHeaderGradient(gradient);
  };

  const handleGradientSelect = (gradient) => {
    try {
      setHeaderGradient(gradient);
      setActiveColorPicker(null);
      toast.success("Header gradient updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update header gradient");
    }
  };

  const closeSubMenu = () => setSelectedParent(null);
  const handleContentClick = () => {
    if (selectedParent) closeSubMenu();
  };

  // wrappers for actions to show toast feedback
  const handleApplySettings = () => {
    try {
      setSettingsVisible(false);
      toast.success("Theme applied successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply theme");
    }
  };

  const handleReset = () => {
    try {
      resetTheme();
      toast.success("Theme reset to default");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset theme");
    }
  };

  const handleApplyCommonScheme = (index, schemeName) => {
    try {
      applyCommonColorScheme(index);
      toast.success(`${schemeName} applied`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply color scheme");
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: primaryColor },
      }}
    >
      <Layout style={{ minHeight: "100vh", maxWidth: layoutType === "boxed" ? 1200 : "100%", margin: layoutType === "boxed" ? "0 auto" : 0 }}>
   {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={SIDER_WIDTH}
            collapsedWidth={COLLAPSED_WIDTH}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 100,
              height: "100%",
              backgroundColor:"#fbfbfd" ,
              overflow: "auto",
              
            }}
            className="shadow-lg"
          >
            <Sidebar
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              selectedParent={selectedParent}
              setSelectedParent={setSelectedParent}
              // menuItems prop not required here because Sidebar uses its internal menu
            />
          </Sider>
        )}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            placement="left"
            closable
            onClose={() => setMobileOpen(false)}
            open={mobileOpen}
            width="85%"
            bodyStyle={{
              padding: 0,
              backgroundColor: theme === "dark" ? "#001529" : sidebarBgColor || "#ffffff",
            }}
          >
            {/* In mobile drawer we want expanded sidebar */}
            <Sidebar collapsed={false} setCollapsed={() => setMobileOpen(false)} selectedParent={selectedParent} setSelectedParent={setSelectedParent} />
          </Drawer>
        )}

        <Layout style={{ marginLeft: contentMarginLeft, transition: "margin-left 0.24s", minHeight: "100vh", backgroundColor: contentBgColor }}>
          {/* Header - fixed at top */}
          <HeaderBar collapsed={collapsed} style={{marginLeft: contentMarginLeft}} />
          {/* Mobile Floating Hamburger - opens drawer */}
          {isMobile && (
            <Button
              type="primary"
              shape="circle"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileOpen(true)}
              style={{ position: "fixed", top: 12, left: 12, zIndex: 200 }}
            />
          )}

          {/* Theme Settings Button */}
          {/* <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 60 }}>
            <Tooltip title="Customize Theme">
              <Button type="primary" shape="circle" icon={<SettingOutlined />} onClick={openSettings} size="large" />
            </Tooltip>
          </div> */}

          <Content
  onClick={handleContentClick}
  style={{
    padding: "20px",
    minHeight: `calc(100vh - 100px)`,
    overflow: "auto",
    marginTop: 60,
    backgroundColor: "#fbfbfd !important",
  }}
>

  {/*Toast visible for all pages */}
  <Toaster position="top-right" richColors closeButton />

  <div className="rounded-lg p-1 min-h-full ">
    <Outlet />
  </div>
</Content>


          <AppFooter theme={theme} bgColor={theme === "dark" ? "#001529" : footerBgColor} />
        </Layout>
      </Layout>

     
    </ConfigProvider>
  );
};

export default MainLayout;
