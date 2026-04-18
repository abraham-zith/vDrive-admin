import React from "react";
import { UserOutlined, CheckCircleOutlined, StopOutlined, RiseOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import type { Customer } from "../../pages/Customers";
import dayjs from "dayjs";

const { Text } = Typography;

interface CustomerStatsProps {
  customers: Customer[];
  loading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  tagColor: "blue" | "emerald" | "purple" | "rose" | "indigo";
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, tagColor }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <div className="bg-white border border-slate-300 rounded-2xl p-5 flex justify-between items-center transition-all duration-300 hover:border-indigo-100 hover:shadow-md group">
      <div className="flex flex-col gap-1">
        <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          {title}
        </Text>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
            {value.toLocaleString()}
          </span>
        </div>
        <Text className="text-[10px] text-slate-400 font-medium leading-none mt-1">
          {description}
        </Text>
      </div>

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${colorMap[tagColor]} bg-opacity-100 group-hover:scale-110 shadow-sm`}>
        {React.cloneElement(icon as React.ReactElement, { className: "text-lg" })}
      </div>
    </div>
  );
};

const CustomerStats: React.FC<CustomerStatsProps> = ({ customers }) => {
  const total = customers.length;
  const active = customers.filter(c => c.status === "active").length;
  const suspended = customers.filter(c => c.status === "suspended" || c.status === "blocked").length;

  const lastMonth = dayjs().subtract(30, "days");
  const newThisMonth = customers.filter(c => dayjs(c.created_at).isAfter(lastMonth)).length;

  const stats: StatCardProps[] = [
    {
      title: "Total User",
      value: total,
      icon: <UserOutlined />,
      description: "All registered records",
      tagColor: "blue",
    },
    {
      title: "Active Users",
      value: active,
      icon: <CheckCircleOutlined />,
      description: "Active status verified",
      tagColor: "emerald",
    },
    {
      title: "New Members",
      value: newThisMonth,
      icon: <RiseOutlined />,
      description: "Joined in last 30 days",
      tagColor: "purple",
    },
    {
      title: "Restricted",
      value: suspended,
      icon: <StopOutlined />,
      description: "Accounts limited/blocked",
      tagColor: "rose",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default CustomerStats;
