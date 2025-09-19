import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown, message, Menu } from "antd";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const HeaderBar = ({ collapsed, toggleCollapsed }) => {
  const { theme, headerBgColor, headerGradient } = useTheme();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      message.success("Logged out");
      navigate("/");
    } else if (key === "profile") {
      navigate("/profile");
    }
  };

  // Menu using AntD v5 Menu
  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          icon: <UserOutlined />,
          label: "Profile",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Logout",
          danger: true,
        },
      ]}
      onClick={handleMenuClick}
    />
  );

  const isGradient = headerGradient && headerGradient.includes("gradient");
  const textColor =
    theme === "dark" || isGradient ? "text-white" : "text-black";
  const hoverColor =
    theme === "dark" || isGradient
      ? "hover:text-gray-300"
      : "hover:text-gray-600";

  const iconBgColor = theme === "dark" ? "bg-gray-700" : "bg-gray-200";
  const iconHoverColor =
    theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-300";

  const headerStyle = isGradient
    ? { background: headerGradient }
    : { backgroundColor: headerBgColor || "#ffffff" };

  return (
    <div
      className="flex justify-between items-center shadow-lg h-12 px-4 py-2"
      style={{
        ...headerStyle,
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left side - Collapse/Expand Button */}
      <div className="flex items-center">
        {!isMobile && toggleCollapsed && (
          <button
            onClick={toggleCollapsed}
            // added inline style to force white color and bold text, and kept existing classes
            style={{ color: "#ffffff", fontWeight: 700 }}
            className={`text-lg font-bold transition-transform duration-200 p-2 
            ${hoverColor} transform
            ${collapsed ? "hover:translate-x-1" : "hover:-translate-x-1"}`}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        )}
      </div>

      {/* Right side - User Menu */}
      <div className="flex items-center">
        <Dropdown overlay={userMenu} placement="bottomRight" trigger={["click"]}>
          <UserOutlined
            className={`cursor-pointer text-lg ${iconBgColor} p-2 rounded-3xl ${iconHoverColor} transition-colors`}
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default HeaderBar;
