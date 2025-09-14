import QuickActions from "../components/DashBoard/QuickActions";
import { FiActivity } from "react-icons/fi";
import { Typography } from "antd";
import DriverMap from "../components/DashBoard/DriverMap";
import DashboardCard from "../components/DashBoard/DashBoardCard";

const Dashboard = () => {
  const drivers = [
    { id: "1", lat: 12.975, lng: 77.59 },
    { id: "2", lat: 12.97, lng: 77.6 },
  ];
  return (
    <div className="w-full h-full overflow-y-auto mx-auto px-2 sm:px-4 lg:px-6 xl:px-4 2xl:px-6 space-y-6 py-2 ">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-xl">
          <FiActivity className="text-white text-2xl" />
        </div>
        <div>
          <Typography.Title
            level={2}
            className="!m-0 text-xl sm:text-2xl font-extrabold text-gray-900"
          >
            Dashboard
          </Typography.Title>
          <Typography.Text className="block text-md sm:text-base text-gray-500">
            Live operational metrics and insights
          </Typography.Text>
        </div>
      </div>
      <DashboardCard />
      <DriverMap driverLocations={drivers} />
      <QuickActions />
    </div>
  );
};

export default Dashboard;
