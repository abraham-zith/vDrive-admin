import React, { useState, useEffect } from "react";
import {
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  LogoutOutlined,
  DollarOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, Avatar, ConfigProvider, Button, Drawer } from "antd";
import logo from "/logo1.png";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Users from "./pages/Users";
import Admins from "./pages/Admins";
import { PiSteeringWheel } from "react-icons/pi";
import DriverPricing from "./pages/DriverPricing";
import Drivers from "./pages/Drivers";
import { RiAdminLine } from "react-icons/ri";
import SignUp from "./signup/Signup";
import Login from "./login/Login";
import ResetPassword from "./login/ResetPassword";
import DashBoard from "./pages/DashBoard"
const PlaceholderContent: React.FC<{
  title: string;
  children?: React.ReactNode;
}> = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    {children || <p>Content for the {title.toLowerCase()} page.</p>}
  </div>
);

const { Content, Sider, Header } = Layout;

const Logo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div className="flex items-center justify-center gap-3 px-4 h-[64px] border-b border-gray-700">
    <img height={32} width={32} src={logo} alt="" />

    {!collapsed && (
      <span className="font-semibold text-xl text-white whitespace-nowrap">
        vDrive Admin
      </span>
    )}
  </div>
);

const siderStyle: React.CSSProperties = {
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  bottom: 0,
  zIndex: 100,
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    if (isLeftSwipe) {
      onCloseDrawer();
    }
  };

  const menuItems: MenuProps["items"] = [
    { label: <Link to="/">Dashboard</Link>, key: "/", icon: <HomeOutlined /> },
    {
      label: <Link to="/users">Users</Link>,
      key: "/users",
      icon: <TeamOutlined />,
    },
    {
      label: <Link to="/pricing">Pricing</Link>,
      key: "/pricing",
      icon: <DollarOutlined />,
    },
    {
      label: <Link to="/drivers">Drivers</Link>,
      key: "/drivers",
      icon: <PiSteeringWheel />,
    },
    {
      label: <Link to="/admins">Admins</Link>,
      key: "/admins",
      icon: <RiAdminLine />,
    },
  ];
  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            trackBg: "rgb(241,245,249)",
          },
        },
      }}
    >
      <Layout hasSider={!isMobile}>
        {!isMobile && (
          <Sider
            style={siderStyle}
            collapsed={collapsed}
            width={250}
            onMouseEnter={() => setCollapsed(false)}
            onMouseLeave={() => setCollapsed(true)}
          >
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0">
                <Logo collapsed={collapsed} />
              </div>

              <div className="flex-grow overflow-y-auto">
                <Menu
                  theme="dark"
                  mode="inline"
                  selectedKeys={[location.pathname]}
                  items={menuItems}
                />
              </div>

              <div
                className={`flex-shrink-0 p-4 border-t border-gray-700 block`}
              >
                <div
                  className={`flex items-center w-full p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer ${
                    collapsed ? "justify-center" : "gap-3"
                  }`}
                >
                  {collapsed ? null : (
                    <Avatar size="large" icon={<UserOutlined />} />
                  )}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      collapsed
                        ? "grid-rows-[0fr] opacity-0"
                        : "grid-rows-[1fr] opacity-100"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col text-white">
                        <span className="font-medium whitespace-nowrap">
                          Admin User
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          admin@example.com
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Menu
                  theme="dark"
                  mode="inline"
                  selectable={false}
                  inlineCollapsed={collapsed}
                  items={[
                    {
                      key: "logout",
                      label: "Logout",
                      icon: <LogoutOutlined />,
                      danger: true,
                    },
                  ]}
                  className="bg-transparent border-0 mt-2"
                />
              </div>
            </div>
          </Sider>
        )}

        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
            transition: "margin-left 0.2s",
          }}
        >
          {isMobile && (
            <Header
              style={{
                padding: "0 16px",
                background: "#fff",
                borderBottom: "1px solid #d9d9d9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
              }}
            >
              <img height={32} width={32} src={logo} alt="Logo" />
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={showDrawer}
                  style={{ fontSize: "16px" }}
                />
                <Button
                  type="text"
                  icon={<LogoutOutlined />}
                  danger
                  style={{ fontSize: "16px" }}
                />
              </div>
            </Header>
          )}
          <Content>
            <div
              className={`p-1 w-full rounded-lg bg-[#F7F8FB] ${
                isMobile ? "pt-16 h-[100dvh]" : "h-[100dvh]"
              }`}
            >
              <Routes>
                <Route
                  path="/"
                  // element={<PlaceholderContent title="Dashboard" />}
                  element={<DashBoard />}
                />
                <Route path="/users" element={<Users />} />
                <Route path="/pricing" element={<DriverPricing />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/admins" element={<Admins />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Routes>
            </div>
          </Content>
        </Layout>

        <Drawer
          title={
            <div className="flex items-center gap-2">
              <img height={32} width={32} src={logo} alt="" />
              <span>vDrive Admin</span>
            </div>
          }
          placement="left"
          closable={false}
          onClose={onCloseDrawer}
          open={drawerVisible}
          width={250}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div style={{ flex: 1 }}>
              <Menu
                theme="light"
                mode="vertical"
                selectedKeys={[location.pathname]}
                items={menuItems}
              />
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center gap-3">
                <Avatar size="large" icon={<UserOutlined />} />
                <div>
                  <div className="font-medium">Admin User</div>
                  <div className="text-xs text-gray-500">admin@example.com</div>
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      </Layout>
    </ConfigProvider>
  );
};

const App: React.FC = () => <AppContent />;

export default App;
