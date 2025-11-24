// MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import axios from "axios";

import {
  Layout,
  ConfigProvider,
  Drawer,
  Button,
  Tooltip,
} from "antd";

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderBar from "./Header";
import { SettingOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import AppFooter from "./Footer";

const { Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const {
    layoutType,
    primaryColor,
    contentBgColor,
    sidebarBgColor,
    footerBgColor,
    theme,
  } = useTheme();

  // ---------------------------------------------------
  // ✅ Show Login Success ONE TIME only
  // ---------------------------------------------------
  useEffect(() => {
    if (!window.__loginToastShown) {
      toast.success("Welcome, Admin!");
      window.__loginToastShown = true;
    }
  }, []);

  // ---------------------------------------------------
  // ✅ GLOBAL AXIOS ERROR HANDLER (Always show toast ON error)
  // ---------------------------------------------------
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
  
      (error) => {
        const method = error?.config?.method?.toUpperCase();
  
        // ❌ Ignore GET errors (page load calls)
        if (method === "GET") {
          return Promise.reject(error);
        }
  
        // ✅ Show toast only for POST, PUT, DELETE
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Something went wrong";
  
        toast.error(msg);
        return Promise.reject(error);
      }
    );
  
    return () => axios.interceptors.response.eject(interceptor);
  }, []);
  
  const contentMarginLeft = isMobile ? 0 : collapsed ? 80 : 280;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: primaryColor } }}>
      {/* GLOBAL TOASTER (Top Right) */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        toastOptions={{
          duration: 2600,
          style: {
            zIndex: 999999,
            borderRadius: "10px",
            padding: "14px 18px",
          },
        }}
      />

      <Layout
        style={{
          minHeight: "100vh",
          maxWidth: layoutType === "boxed" ? 1200 : "100%",
          margin: layoutType === "boxed" ? "0 auto" : 0,
        }}
      >
        {/* -------- Desktop Sidebar -------- */}
        {!isMobile && (
          <Sider
            collapsed={collapsed}
            collapsible
            width={280}
            collapsedWidth={80}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: "#fff",
              overflow: "auto",
              zIndex: 100,
            }}
          >
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          </Sider>
        )}

        {/* -------- Mobile Sidebar Drawer -------- */}
        {isMobile && (
          <Drawer
            open={mobileOpen}
            closable
            onClose={() => setMobileOpen(false)}
            width="80%"
            placement="left"
            bodyStyle={{
              padding: 0,
              backgroundColor:
                theme === "dark" ? "#001529" : sidebarBgColor || "#fff",
            }}
          >
            <Sidebar
              collapsed={false}
              setCollapsed={() => setMobileOpen(false)}
            />
          </Drawer>
        )}

        {/* -------- Main Area -------- */}
        <Layout
          style={{
            marginLeft: contentMarginLeft,
            transition: "margin-left .25s",
            backgroundColor: contentBgColor,
          }}
        >
          <HeaderBar collapsed={collapsed} />

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              type="primary"
              shape="circle"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileOpen(true)}
              style={{
                position: "fixed",
                top: 12,
                left: 12,
                zIndex: 500,
              }}
            />
          )}

          {/* Theme Settings Button */}
          <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 60 }}>
            <Tooltip title="Customize Theme">
              <Button
                type="primary"
                shape="circle"
                icon={<SettingOutlined />}
                size="large"
              />
            </Tooltip>
          </div>

          {/* -------- Page Content -------- */}
          <Content
            style={{
              padding: 4,
              minHeight: "calc(100vh - 100px)",
              marginTop: 65,
              overflow: "auto",
            }}
          >
            <Outlet />
          </Content>

          <AppFooter
            theme={theme}
            bgColor={theme === "dark" ? "#001529" : footerBgColor}
          />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
