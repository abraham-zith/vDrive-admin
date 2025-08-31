import React, { useState } from "react";
import {
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, Avatar } from "antd";
import logo from "/logo1.png";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Users from "./pages/Users";
import SignUp from "./signup/Signup";
import Login from "./login/Login";
import ResetPassword from "./login/ResetPassword";


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
    <img height={32} width={32} src={logo} />

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
  ];
  return (
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

          <div
            className={`flex-shrink-0 p-4 border-t border-gray-700 ${
              collapsed ? "hidden" : "block"
            }`}
          >
            <div className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
              <Avatar size="large" icon={<UserOutlined />} />
              <div className="flex flex-col text-white">
                <span className="font-medium">Admin User</span>
                <span className="text-xs text-gray-400">admin@example.com</span>
              </div>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectable={false}
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
          <div className="p-1 h-[100dvh] w-full  rounded-lg">
            <Routes>
              <Route
                path="/"
                element={<PlaceholderContent title="Dashboard" />}
              />
              <Route path="/users" element={<Users />} />
              <Route path ="/signup" element ={<SignUp/>}/>
              <Route path ="/login" element={<Login/>}/>
              <Route path ='/reset-password' element={<ResetPassword/>}/>
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => <AppContent />;

export default App;
