import React from "react";
import {
  ThunderboltOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  CarOutlined,
  ClockCircleOutlined,
  FireOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { FiActivity } from "react-icons/fi";
import { RiMapPinRangeFill } from "react-icons/ri";
import { FaSackDollar } from "react-icons/fa6";
import { FaCircle } from "react-icons/fa";

interface Metric {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgKey: string;
  subIcon: React.ReactNode;
}

const MetricCard: React.FC<Metric> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgKey,
  subIcon,
}) => {
  return (
    <div className="relative bg-white rounded-xl shadow p-6 overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 rounded-full flex items-center justify-center ${iconBgKey}`}
        style={{ fontSize: "22px", color: "white" }}
      >
        <div className="relative top-2 right-2">{icon}</div>
      </div>

      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-sm flex items-center mt-2 gap-2">
        {subIcon} {subtitle}
      </p>
    </div>
  );
};

const DashboardCard: React.FC = () => {
  const metrics: Metric[] = [
    {
      title: "Total Users",
      value: "120,540",
      subtitle: "riders trust our platform",
      iconBgKey: "bg-blue-400",
      icon: <TeamOutlined />,
      subIcon: <GlobalOutlined />,
    },
    {
      title: "Active / Total Drivers",
      value: "3,210 / 4,500",
      subtitle: "drivers online — explore map below",
      iconBgKey: "bg-green-400",
      icon: <CarOutlined />,
      subIcon: <CarOutlined />,
    },
    {
      title: "Ongoing Trips",
      value: "1,250",
      subtitle: " rides in progress now",
      iconBgKey: "bg-orange-400",
      icon: <EnvironmentOutlined />,
      subIcon: <RiMapPinRangeFill />,
    },
    {
      title: "Upcoming Trips",
      value: "320",
      subtitle: "rides scheduled today",
      iconBgKey: "bg-indigo-400",
      icon: <ClockCircleOutlined />,
      subIcon: <ClockCircleOutlined />,
    },
    {
      title: "Today's Earnings",
      value: "$12,540",
      subtitle: "earned so far",
      iconBgKey: "bg-green-500",
      icon: <DollarOutlined />,
      subIcon: <FaSackDollar />,
    },
    {
      title: "Active Zones",
      value: "12",
      subtitle: "hotspots buzzing with demand",
      iconBgKey: "bg-orange-500",
      icon: <ThunderboltOutlined />,
      subIcon: <FireOutlined />,
    },
    {
      title: "Recent Disputes",
      value: "5",
      subtitle: " new disputes — under review",
      iconBgKey: "bg-blue-500",
      icon: <ExclamationCircleOutlined />,
      subIcon: <WarningOutlined />,
    },
    {
      title: "System Status",
      value: "All Good",
      subtitle: "all systems operational",
      iconBgKey: "bg-green-400",
      icon: <FiActivity />,
      subIcon: <FaCircle />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default DashboardCard;
