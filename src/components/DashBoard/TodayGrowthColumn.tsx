import React from "react";
import { UsergroupAddOutlined, IdcardOutlined, CrownOutlined, RiseOutlined, DollarOutlined, ThunderboltOutlined, FallOutlined } from "@ant-design/icons";
import { Typography, Badge } from "antd";
import { FiTrendingUp } from "react-icons/fi";

const { Title, Text } = Typography;

interface TodayGrowthColumnProps {
  stats: {
    todayNewUsers: number;
    todayNewDrivers: number;
    todaySubscriptions: number;
    todayTrips: number;
    todayRevenue: number;
    trends: {
      users: string;
      drivers: string;
      subscriptions: string;
      trips: string;
      revenue: string;
    };
    loading: boolean;
  };
  isHorizontal?: boolean;
}

const TodayGrowthColumn: React.FC<TodayGrowthColumnProps> = ({ stats, isHorizontal = false }) => {
  const GrowthItem = ({
    title,
    value,
    icon,
    iconColor,
    trend
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    iconColor: string;
    trend: string;
  }) => {
    const safeTrend = trend || "0%";
    const isPositive = safeTrend.startsWith("+");
    const isZero = safeTrend === "0%";
    const isNegative = !isPositive && !isZero;

    if (isHorizontal) {
      return (
        <div className="flex flex-col bg-white border border-gray-100 rounded-lg p-2 hover:border-blue-300 transition-all duration-300 group cursor-default min-w-0 h-full justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className={`w-6 h-6 rounded flex items-center justify-center ${iconColor.replace('text-', 'bg-').split('-')[0]}-50/50 shrink-0`}>
              <span className={`${iconColor} text-xs group-hover:scale-110 transition-transform`}>{icon}</span>
            </div>
            <Badge
              count={trend}
              style={{
                backgroundColor: isZero ? "#f3f4f6" : isPositive ? "#f0fdf4" : "#fef2f2",
                color: isZero ? "#6b7280" : isPositive ? "#16a34a" : "#ef4444",
                fontSize: "7px",
                fontWeight: "800",
                minWidth: "30px",
                height: "12px",
                lineHeight: "11px",
                border: "none",
                borderRadius: "3px",
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <Text className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter truncate leading-none mb-0.5">
              {title}
            </Text>
            <div className="flex items-baseline gap-1">
              <span className="text-gray-800 font-black tracking-tighter text-[12px] truncate leading-none">
                {stats.loading ? "..." : value}
              </span>
              {isPositive && !isZero && <RiseOutlined className="text-green-500 text-[8px]" />}
              {isNegative && <FallOutlined className="text-red-500 text-[8px]" />}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center p-2 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-100 transition-all duration-300 group cursor-default h-[52px]">
        {/* Icon Section - Fixed Width */}
        <div className="w-9 h-9 rounded-lg border border-gray-50 flex items-center justify-center mr-3 group-hover:border-blue-200 transition-colors bg-gray-50/50 shrink-0">
          <span className={`${iconColor} text-base group-hover:scale-110 transition-transform`}>
            {icon}
          </span>
        </div>

        {/* Info Section - Flexible */}
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <Text className="text-[4px] text-gray-400 font-bold uppercase tracking-widest truncate leading-none mb-1">
            {title}
          </Text>
          <Title level={4} className="!m-0 text-gray-800 font-black tracking-tight !text-[13px] leading-none">
            {stats.loading ? "..." : value}
          </Title>
        </div>

        {/* Trend Section - Right Aligned */}
        <div className="flex flex-col items-end justify-center ml-2 shrink-0">
          <Badge
            count={trend}
            style={{
              backgroundColor: isZero ? "#f3f4f6" : isPositive ? "#f0fdf4" : "#fef2f2",
              color: isZero ? "#6b7280" : isPositive ? "#16a34a" : "#ef4444",
              fontSize: "8px",
              fontWeight: "800",
              minWidth: "38px",
              height: "16px",
              lineHeight: "15px",
              border: isZero ? "1px solid #e5e7eb" : isPositive ? "1px solid #dcfce7" : "1px solid #fee2e2",
              borderRadius: "4px",
            }}
            className="group-hover:translate-x-0.5 transition-transform"
          />
          <div className="flex items-center mt-1 h-3">
            {isPositive && !isZero && (
              <RiseOutlined className="text-green-500 text-[10px] animate-bounce-subtle" />
            )}
            {isNegative && (
              <FallOutlined className="text-red-500 text-[10px] animate-bounce-subtle-down" />
            )}
            {isZero && <div className="w-2.5 h-0.5 bg-gray-200 rounded-full" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-500 hover:shadow-md ${isHorizontal ? 'h-full' : 'h-105'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 bg-white/50 backdrop-blur-sm shrink-0 ${isHorizontal ? 'border-none' : 'border-b border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <div className="p-1 bgColor-blue-50 rounded-lg">
            <FiTrendingUp className="text-blue-600 text-[8px]" />
          </div>
          <span className="font-bold text-gray-800 text-[11px] tracking-tight uppercase">Today Overview</span>
        </div>
        {!isHorizontal && (
          <div className="flex items-center gap-2">
            <Badge status="processing" color="blue" />
            <span className="text-[9px] font-black text-blue-600 bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 flex gap-2 overflow-y-auto custom-scrollbar ${isHorizontal ? 'flex-row p-2 pt-0 items-stretch overflow-hidden' : 'flex-col p-3 bg-gray-50/10'}`}>
        <div className={isHorizontal ? 'grid grid-cols-5 gap-2 w-full h-full' : 'flex flex-col gap-2'}>
          <GrowthItem
            title="Revenue"
            value={`₹${stats.todayRevenue.toLocaleString()}`}
            icon={<DollarOutlined />}
            iconColor="text-emerald-500"
            trend={stats.trends.revenue}
          />

          <GrowthItem
            title="Users"
            value={stats.todayNewUsers}
            icon={<UsergroupAddOutlined />}
            iconColor="text-blue-500"
            trend={stats.trends.users}
          />

          <GrowthItem
            title="Drivers"
            value={stats.todayNewDrivers}
            icon={<IdcardOutlined />}
            iconColor="text-cyan-500"
            trend={stats.trends.drivers}
          />

          <GrowthItem
            title="Trips"
            value={stats.todayTrips}
            icon={<ThunderboltOutlined />}
            iconColor="text-orange-500"
            trend={stats.trends.trips}
          />

          <GrowthItem
            title="Subs"
            value={stats.todaySubscriptions}
            icon={<CrownOutlined />}
            iconColor="text-purple-500"
            trend={stats.trends.subscriptions}
          />
        </div>
      </div>


      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes bounce-subtle-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(2px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
        .animate-bounce-subtle-down {
          animation: bounce-subtle-down 2s infinite ease-in-out;
        }
      `}</style>
    </div>

  );
};

export default TodayGrowthColumn;
