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
  IdcardOutlined,
} from "@ant-design/icons";
import { FiActivity } from "react-icons/fi";

interface Metric {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  pillColor: string;
}

const MetricCard: React.FC<Metric> = ({
  title,
  value,
  subtitle,
  icon,
  pillColor
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col hover:shadow-sm transition-all duration-300">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-[#8c8c8c] text-[13px] font-medium tracking-tight whitespace-nowrap">{title}</h3>
        <div className="text-gray-300 text-lg opacity-60 font-light">{icon}</div>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-[28px] font-bold text-[#262626] leading-none tracking-tighter">
          {value}
        </p>
        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${pillColor} self-center mt-1`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  stats: {
    activeDrivers: number;
    totalDrivers: number;
    availableDrivers: number;
    onTripDrivers: number;
    totalScheduledRides: number;
    acceptedScheduledRides: number;
    totalUsers: number;
    todayNewDrivers: number;
    todaySubscriptions: number;
    totalSubscriptions: number;
    totalEarnings: number;
    loading: boolean;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ stats }) => {
  const metrics: Metric[] = [
    {
      title: "Total User",
      value: stats.loading ? "..." : stats.totalUsers.toLocaleString(),
      subtitle: "Total Registered",
      pillColor: "bg-blue-50 text-blue-500",
      icon: <TeamOutlined />,
    },
    {
      title: "Active / Total Drivers",
      value: stats.loading
        ? "..."
        : `${stats.activeDrivers} / ${stats.totalDrivers}`,
      subtitle: "Verified",
      pillColor: "bg-green-50 text-green-500",
      icon: <CarOutlined />,
    },
    {
      title: "Total Subscription",
      value: stats.loading ? "..." : stats.totalSubscriptions.toLocaleString(),
      subtitle: "Active Plans",
      pillColor: "bg-purple-50 text-purple-500",
      icon: <ThunderboltOutlined />,
    },
    {
      title: "Total Earnings",
      value: stats.loading
        ? "..."
        : `₹${stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      subtitle: "Lifetime",
      pillColor: "bg-green-50 text-green-500",
      icon: <DollarOutlined />,
    },
    {
      title: "Platform System Status",
      value: "All Good",
      subtitle: "Stable",
      pillColor: "bg-emerald-50 text-emerald-500",
      icon: <FiActivity />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default DashboardCard;
