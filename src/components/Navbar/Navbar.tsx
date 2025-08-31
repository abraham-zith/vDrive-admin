import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Button, Drawer, Avatar } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  MenuOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import logo from "/logo1.png";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [current, setCurrent] = useState(location.pathname);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location.pathname]);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const items = [
    {
      label: (
        <Link to="/" onClick={onCloseDrawer}>
          Dashboard
        </Link>
      ),
      key: "/",
      icon: <HomeOutlined />,
    },
    {
      label: (
        <Link to="/users" onClick={onCloseDrawer}>
          Users
        </Link>
      ),
      key: "/users",
      icon: <TeamOutlined />,
    },
    {
      key: "/admin",
      label: (
        <Link to="/admin" onClick={onCloseDrawer}>
          Admin
        </Link>
      ),
      // icon: <UserOutlined />,
      icon: (
        <Avatar
          className="w-[40px] h-[40px] mx-[10px]"
          icon={<UserOutlined />}
        />
      ),
      children: [
        // { key: "3", label: "Profile" },
        { key: "4", label: "Logout", icon: <LogoutOutlined />, danger: true },
      ],
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-700 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <img
              src={logo}
              alt="AdminApp Logo"
              className="h-8 mr-3"
              width={50}
            />
          </Link>
        </div>

        <div className="flex items-center flex-grow justify-end">
          {isMobile ? (
            <>
              <Button
                type="primary"
                icon={<MenuOutlined />}
                onClick={showDrawer}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600"
              />
              <Drawer
                title={
                  <div className="flex gap-[4px] items-center">
                    <img
                      src={logo}
                      alt="AdminApp Logo"
                      className="h-8 mr-3"
                      width={30}
                    />
                    <span>vDrive Admin</span>
                  </div>
                }
                placement="top"
                closeIcon={false}
                onClose={onCloseDrawer}
                open={drawerVisible}
                styles={{
                  body: { padding: 0 },
                }}
              >
                <Menu
                  theme="light"
                  mode="vertical"
                  selectedKeys={[current]}
                  items={items}
                  style={{ borderRight: 0 }}
                />
              </Drawer>
            </>
          ) : (
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[current]}
              items={items}
              className="flex-grow justify-end"
              style={{
                // backgroundColor: "transparent",
                borderBottom: "none",
              }}
            />
          )}
          {/* <div className="flex items-center">
            <Link to="/profile">
              <Avatar
                className="w-[40px] h-[40px] mx-[10px]"
                icon={<UserOutlined />}
              />
            </Link>
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
