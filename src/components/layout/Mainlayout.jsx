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
  const COLLAPSED_WIDTH = 80;

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
    setHeaderGradient(gradient);
    setActiveColorPicker(null);
  };

  const closeSubMenu = () => setSelectedParent(null);
  const handleContentClick = () => {
    if (selectedParent) closeSubMenu();
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
              backgroundColor:"#fff" ,
              overflow: "auto",
            }}
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
          <HeaderBar collapsed={collapsed} />

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
          <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 60 }}>
            <Tooltip title="Customize Theme">
              <Button type="primary" shape="circle" icon={<SettingOutlined />} onClick={openSettings} size="large" />
            </Tooltip>
          </div>

          <Content
            onClick={handleContentClick}
            style={{
              padding: 2,
              minHeight: `calc(100vh - 100px)`,
              overflow: "auto",
              // ensure content is below the fixed header
              marginTop: 65,
            }}
          >
            <div className="rounded-lg p-1 min-h-full ">
              <Outlet />
            </div>
          </Content>

          <AppFooter theme={theme} bgColor={theme === "dark" ? "#001529" : footerBgColor} />
        </Layout>
      </Layout>

      {/* Theme Settings Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SettingOutlined />
            <span>Theme Settings</span>
          </div>
        }
        placement="right"
        closable
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={340}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={resetTheme}>Reset to Default</Button>
            <Button type="primary" onClick={() => setSettingsVisible(false)}>
              Apply Changes
            </Button>
          </div>
        }
      >
        <Tabs defaultActiveKey="theme" centered>
          <TabPane tab="Theme" key="theme" className="px-2">
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Color Mode</h4>
              <Radio.Group value={theme} onChange={(e) => setTheme(e.target.value)} buttonStyle="solid" style={{ display: "flex" }}>
                <Radio.Button value="light" style={{ flex: 1, textAlign: "center" }}>
                  Light
                </Radio.Button>
                <Radio.Button value="dark" style={{ flex: 1, textAlign: "center" }}>
                  Dark
                </Radio.Button>
              </Radio.Group>
            </div>

            <div style={{ marginBottom: 18 }}>
              <h4 style={{ marginBottom: 12 }}>Common Color Schemes</h4>
              <div style={{ display: "grid", gap: 8 }}>
                {commonColorSchemes.map((scheme, index) => (
                  <div key={index} onClick={() => applyCommonColorScheme(index)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, border: "1px solid #eef2f6", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex" }}>
                        <div style={{ width: 16, height: 16, backgroundColor: scheme.headerBgColor, marginRight: 6 }} />
                        <div style={{ width: 16, height: 16, backgroundColor: scheme.sidebarBgColor, marginRight: 6 }} />
                        <div style={{ width: 16, height: 16, backgroundColor: scheme.contentBgColor, marginRight: 6 }} />
                        <div style={{ width: 16, height: 16, backgroundColor: scheme.footerBgColor }} />
                      </div>
                      <span>{scheme.name}</span>
                    </div>
                    <CheckOutlined style={{ visibility: headerBgColor === scheme.headerBgColor && sidebarBgColor === scheme.sidebarBgColor && contentBgColor === scheme.contentBgColor && footerBgColor === scheme.footerBgColor ? "visible" : "hidden" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Color Picker Section */}
            <div>
              <h4 style={{ marginBottom: 12 }}>Custom Colors</h4>
              <div style={{ display: "grid", gap: 10 }}>
                <div onClick={() => setActiveColorPicker(activeColorPicker === "primary" ? null : "primary")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, border: "1px solid #eef2f6", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 9999, background: primaryColor }} />
                    <span>Primary Color</span>
                  </div>
                  <BgColorsOutlined />
                </div>
                {activeColorPicker === "primary" && (
                  <div style={{ marginTop: 8 }}>
                    <SketchPicker color={primaryColor} onChangeComplete={(c) => setPrimaryColor(c.hex)} width="100%" />
                  </div>
                )}

                <div onClick={() => setActiveColorPicker(activeColorPicker === "sidebar" ? null : "sidebar")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, border: "1px solid #eef2f6", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 9999, background: sidebarBgColor }} />
                    <span>Sidebar Color</span>
                  </div>
                  <BgColorsOutlined />
                </div>
                {activeColorPicker === "sidebar" && (
                  <div style={{ marginTop: 8 }}>
                    <SketchPicker color={sidebarBgColor} onChangeComplete={(c) => setSidebarBgColor(c.hex)} width="100%" />
                  </div>
                )}

                <div onClick={() => setActiveColorPicker(activeColorPicker === "footer" ? null : "footer")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, border: "1px solid #eef2f6", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 9999, background: footerBgColor }} />
                    <span>Footer Color</span>
                  </div>
                  <BgColorsOutlined />
                </div>
                {activeColorPicker === "footer" && (
                  <div style={{ marginTop: 8 }}>
                    <SketchPicker color={footerBgColor} onChangeComplete={(c) => setFooterBgColor(c.hex)} width="100%" />
                  </div>
                )}

                <div onClick={() => setActiveColorPicker(activeColorPicker === "content" ? null : "content")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, border: "1px solid #eef2f6", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 9999, background: contentBgColor }} />
                    <span>Content Background</span>
                  </div>
                  <BgColorsOutlined />
                </div>
                {activeColorPicker === "content" && (
                  <div style={{ marginTop: 8 }}>
                    <SketchPicker color={contentBgColor} onChangeComplete={(c) => setContentBgColor(c.hex)} width="100%" />
                  </div>
                )}
              </div>
            </div>
          </TabPane>

          <TabPane tab="Header" key="header" className="px-2">
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ marginBottom: 12 }}>Header Gradient</h4>
              <div style={{ display: "grid", gap: 8 }}>
                <div onClick={() => handleGradientSelect(createGradientFromColor(primaryColor))} style={{ height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: createGradientFromColor(primaryColor) }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>Primary Color Gradient</span>
                </div>

                {[
                  { name: "Violet to Purple", value: "linear-gradient(to right, #8e2de2, #4a00e0)" },
                  { name: "Blue to Purple", value: "linear-gradient(to right, #4facfe, #00f2fe)" },
                  { name: "Green to Blue", value: "linear-gradient(to right, #43cea2, #185a9d)" },
                  { name: "Orange to Red", value: "linear-gradient(to right, #ff8008, #ffc837)" },
                  { name: "Pink to Orange", value: "linear-gradient(to right, #ff6a88, #ff99ac)" },
                ].map((g, i) => (
                  <div key={i} onClick={() => handleGradientSelect(g.value)} style={{ height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: g.value }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{g.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: 12 }}>Custom Header Gradient</h4>
              <div onClick={() => setActiveColorPicker(activeColorPicker === "customGradient" ? null : "customGradient")} style={{ padding: 10, borderRadius: 8, border: "1px solid #eef2f6", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 9999, background: headerGradient }} />
                  <span>Custom Gradient</span>
                </div>
                <BgColorsOutlined />
              </div>

              {activeColorPicker === "customGradient" && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ marginBottom: 6, color: "#6b7280" }}>Pick gradient colors</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="color" value={color1} onChange={(e) => { setColor1(e.target.value); updateGradient(e.target.value, color2); }} />
                      <input type="color" value={color2} onChange={(e) => { setColor2(e.target.value); updateGradient(color1, e.target.value); }} />
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ marginBottom: 6, color: "#6b7280" }}>Or enter full gradient string</div>
                      <input type="text" className="w-full p-2" value={headerGradient} onChange={(e) => setHeaderGradient(e.target.value)} placeholder="linear-gradient(to right, #color1, #color2)" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e6edf3" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabPane>

          <TabPane tab="Layout" key="layout" className="px-2">
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ marginBottom: 8 }}>Navigation Style</h4>
              <div style={{ display: "flex", gap: 8 }}>
                <Card hoverable style={{ flex: 1, cursor: "pointer", border: !collapsed ? "2px solid #3b82f6" : "1px solid #eef2f6" }} onClick={() => setCollapsed(false)}>
                  <div style={{ display: "flex", height: 64 }}>
                    <div style={{ width: "20%", background: "#edf2ff" }} />
                    <div style={{ width: "80%", background: "#f8fafc" }} />
                  </div>
                  <div style={{ marginTop: 8, textAlign: "center" }}>Expanded</div>
                </Card>

                <Card hoverable style={{ flex: 1, cursor: "pointer", border: collapsed ? "2px solid #3b82f6" : "1px solid #eef2f6" }} onClick={() => setCollapsed(true)}>
                  <div style={{ display: "flex", height: 64 }}>
                    <div style={{ width: "8%", background: "#edf2ff" }} />
                    <div style={{ width: "92%", background: "#f8fafc" }} />
                  </div>
                  <div style={{ marginTop: 8, textAlign: "center" }}>Collapsed</div>
                </Card>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: 8 }}>Content Background</h4>
              <div style={{ display: "flex", gap: 8 }}>
                {["#f9fafb", "#ffffff", "#f0f2f5", "#e6f7ff", "#f6ffed", "#fff7e6"].map((color, i) => (
                  <div key={i} onClick={() => setContentBgColor(color)} style={{ width: 40, height: 40, borderRadius: 8, background: color, border: contentBgColor === color ? "2px solid #3b82f6" : "1px solid #eef2f6", cursor: "pointer" }} />
                ))}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Drawer>
    </ConfigProvider>
  );
};

export default MainLayout;
