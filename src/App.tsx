import React, { useState } from "react";
import {
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  LogoutOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, Avatar, ConfigProvider } from "antd";
import logo from "/logo1.png";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Users from "./pages/Users";
import { PiSteeringWheel } from "react-icons/pi";
import DriverPricing from "./pages/DriverPricing";
import Drivers from "./pages/Drivers";

const PlaceholderContent: React.FC<{
  title: string;
  children?: React.ReactNode;
}> = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    {children || <p>Content for the {title.toLowerCase()} page.</p>}
  </div>
);

const { Content, Sider } = Layout;

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
      <Layout hasSider>
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

            <div className={`flex-shrink-0 p-4 border-t border-gray-700 block`}>
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

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 250,
            transition: "margin-left 0.2s",
          }}
        >
          <Content>
            <div className="p-1 h-[100dvh] w-full  rounded-lg bg-[#F7F8FB]">
              <Routes>
                <Route
                  path="/"
                  element={<PlaceholderContent title="Dashboard" />}
                />
                <Route path="/users" element={<Users />} />
                <Route path="/pricing" element={<DriverPricing />} />
                <Route path="/drivers" element={<Drivers />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

const App: React.FC = () => <AppContent />;

export default App;
