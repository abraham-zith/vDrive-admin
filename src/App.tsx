import React, { useState, useEffect, lazy, Suspense } from "react";
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
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { PiSteeringWheel } from "react-icons/pi";
import { RiAdminLine } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { logoutAsync } from "./store/slices/authSlice";
import FullScreenLoader from "./components/FullScreenLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import DashBoard from "./pages/DashBoard";
import { MdOutlineMoneyOff } from "react-icons/md";
import { IoReceiptOutline, IoCarOutline } from "react-icons/io5";


// Loading component for route suspense
const RouteLoadingFallback = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      padding: "20px",
    }}
  >
    <div
      className="loader"
      style={{
        border: "6px solid #f3f3f3",
        borderTop: "6px solid #1677ff",
        borderRadius: "50%",
        width: 40,
        height: 40,
        animation: "spin 1s linear infinite",
      }}
    />
    <p style={{ marginTop: 16, color: "#666" }}>Loading...</p>
    <style>
      {`
@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}
`}
    </style>
  </div>
);

// Lazy load heavy components for better bundle splitting
const Users = lazy(() => import("./pages/Users"));
const Admins = lazy(() => import("./pages/Admins"));
const InvoiceTemplates = lazy(() => import("./pages/InvoiceTemplates"));
const TripDetails = lazy(() => import("./pages/TripDetails"));
const Drivers = lazy(() => import("./pages/Drivers"));
const DriverPricing = lazy(() => import("./pages/DriverPricing"));
const PricingAndFareRules = lazy(() => import("./pages/Pricing&FareRules"));
const Deductions = lazy(() => import("./pages/Deductions"));
const SignUp = lazy(() => import("./signup/Signup"));
const Login = lazy(() => import("./login/Login"));
const ResetPassword = lazy(() => import("./login/ResetPassword"));

// const PlaceholderContent: React.FC<{
// title: string;
// children?: React.ReactNode;
// }> = ({ title, children }) => (
// <div>
// <h2 className="text-2xl font-semibold mb-4">{title}</h2>
// {children || <p>Content for the {title.toLowerCase()} page.</p>}
// </div>
// );

const { Content, Sider, Header } = Layout;

const Logo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div className="flex items-center justify-center gap-3 px-4 h-[64px] border-b border-gray-200">
    <img height={32} width={32} src={logo} alt="" />

    {!collapsed && (
      <span className="font-semibold text-xl text-black whitespace-nowrap">
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
const RootLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [isAuthenticated, loading, location, navigate]);

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
      label: <Link to="/PricingAndFareRules">Pricing And Fare Rules</Link>,
      key: "/PricingAndFareRules",
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
    {
      label: <Link to="/InvoiceTemplates">InvoiceTemplates</Link>,
      key: "/InvoiceTemplates",
      icon: <IoReceiptOutline />,
    },
    {
      label: <Link to="/TripDetails">TripDetails</Link>,
      key: "/TripDetails",
      icon: <IoCarOutline />,
    },
    {
      label: <Link to="/Deductions">Deduction Management</Link>,
      key: "/Deductions",
      icon: <MdOutlineMoneyOff />,
    },
  ];
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1d2a5c",
          colorPrimaryBg: "#ffffff",
        },
        components: {
          Layout: {
            siderBg: "#FFFFFF",
          },
          Menu: {
            darkItemBg: "#FFFFFF",
            darkPopupBg: "#FFFFFF",
            darkItemSelectedBg: "#1D2A5C",
            darkItemSelectedColor: "#FFFFFF",
            darkItemColor: "#8A92A6",
            darkItemHoverColor: "#1D2A5C",
          },
          Typography: {
            titleMarginBottom: 0,
            titleMarginTop: 0,
          },
          Segmented: {
            trackBg: "rgb(241,245,249)",
          },
        },
      }}
    >
      {loading && <FullScreenLoader />}
      <Layout
        hasSider={
          !isMobile && isAuthenticated && location.pathname !== "/login"
        }
      >
        {!isMobile && isAuthenticated && location.pathname !== "/login" && (
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
                  selectedKeys={
                    location.pathname.startsWith("/PricingAndFareRules")
                      ? ["/PricingAndFareRules"]
                      : [location.pathname]
                  }
                  items={menuItems}
                  className="font-medium"
                />
              </div>

              <div
                className={`flex-shrink-0 p-4 border-t border-gray-200 block`}
              >
                <div
                  className={`flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${collapsed ? "justify-center" : "gap-3"
                    }`}
                >
                  {collapsed ? null : (
                    <Avatar size="large" icon={<UserOutlined />} />
                  )}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${collapsed
                        ? "grid-rows-[0fr] opacity-0"
                        : "grid-rows-[1fr] opacity-100"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col text-black">
                        <span className="font-medium whitespace-nowrap">
                          Admin User
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
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
                      onClick: async () => {
                        await dispatch(logoutAsync());
                        navigate("/login");
                      },
                    },
                  ]}
                  className="bg-transparent border-0 mt-2 font-medium"
                />
              </div>
            </div>
          </Sider>
        )}

        <Layout
          style={{
            marginLeft:
              isMobile || !isAuthenticated || location.pathname === "/login"
                ? 0
                : collapsed
                  ? 80
                  : 250,
            transition: "margin-left 0.2s",
          }}
        >
          {isMobile && isAuthenticated && location.pathname !== "/login" && (
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
                  onClick={async () => {
                    await dispatch(logoutAsync());
                    navigate("/login");
                  }}
                />
              </div>
            </Header>
          )}
          <Content>
            <div
              className={`p-1 w-full rounded-lg bg-[#F7F8FB] ${isMobile && isAuthenticated && location.pathname !== "/login"
                  ? "pt-16 h-[100dvh]"
                  : "h-[100dvh]"
                }`}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>

        {isAuthenticated && (
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
                  theme="dark"
                  mode="vertical"
                  selectedKeys={
                    location.pathname.startsWith("/PricingAndFareRules")
                      ? ["/PricingAndFareRules"]
                      : [location.pathname]
                  }
                  items={menuItems}
                />
              </div>
              <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                  <Avatar size="large" icon={<UserOutlined />} />
                  <div>
                    <div className="font-medium">Admin User</div>
                    <div className="text-xs text-gray-500">
                      admin@example.com
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Drawer>
        )}
      </Layout>
    </ConfigProvider>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <DashBoard /> },
      {
        path: "users",
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: "admins",
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <Admins />
          </Suspense>
        ),
      },
      {
        path: "InvoiceTemplates",
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <InvoiceTemplates />
          </Suspense>
        ),
      },
      {
        path: "TripDetails",
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <TripDetails />
          </Suspense>
        ),
      },
      {
        path: "drivers",
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <Drivers />
          </Suspense>
        ),
      },
      {
        path: "Deductions",
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <Deductions />
          </Suspense>
        ),
      },
      {
        path: "PricingAndFareRules",
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <PricingAndFareRules />
          </Suspense>
        ),
        children: [
          {
            path: "pricing",
            element: (
              <Suspense fallback={<RouteLoadingFallback />}>
                <DriverPricing />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <SignUp />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <ResetPassword />
      </Suspense>
    ),
  },
]);

const App = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);

export default App;