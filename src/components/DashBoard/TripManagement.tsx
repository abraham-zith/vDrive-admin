import React from "react";
import { Typography, Tag } from "antd";
import { Car, CheckCircle, Clock, User, Navigation, MapPin } from "lucide-react";

const { Text } = Typography;

interface TripManagementProps {
  stats: {
    onTripDrivers: number;
    todayTrips: number;
    pendingVerifications: number;
    documentExpiryAlerts: number;
    loading: boolean;
  };
}

const TripManagement: React.FC<TripManagementProps> = ({ stats }) => {
  const StatItem = ({
    title,
    value,
    icon: Icon,
    iconBgColor,
    iconColor,
  }: {
    title: string;
    value: number | string;
    icon: any;
    iconBgColor: string;
    iconColor: string;
  }) => (
    <div className="flex items-center p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-300 group cursor-default h-[68px]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${iconBgColor} shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <Text className="text-[10px] text-gray-400 font-medium mb-0 tracking-tight">
          {title}
        </Text>
        <p className="m-0 text-gray-900 font-bold text-[17px] leading-tight">
          {stats.loading ? "..." : value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-105 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Car size={16} className="text-gray-500" />
          <span className="font-bold text-gray-900 text-[14px] tracking-tight">Trip Management</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-500 font-medium text-[12px]">Live</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-3.5 border-b border-gray-50 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <StatItem
            title="Active Trips"
            value={stats.onTripDrivers}
            icon={Navigation}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-500"
          />
          <StatItem
            title="Completed"
            value={stats.todayTrips}
            icon={CheckCircle}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-500"
          />
        </div>
      </div>

      {/* Live Trips List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/10 flex items-center justify-between sticky top-0 z-10">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Live Trip Feed</span>
          <span className="text-[10px] text-blue-500 font-bold cursor-pointer hover:underline uppercase tracking-tighter">View all</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl hover:bg-gray-50 transition-all group flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <User size={14} className="text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-gray-900">Trip #{1000 + i}</span>
                    <span className="text-[10px] text-gray-400 font-medium font-outfit uppercase tracking-wider">DRV-{i}0{i} • Alex M.</span>
                  </div>
                </div>
                <Tag color={i % 2 === 0 ? "processing" : "warning"} className="text-[9px] font-extrabold m-0 border-0 rounded-full px-2 leading-tight uppercase">
                  {i % 2 === 0 ? "In Transit" : "Pick Up"}
                </Tag>
              </div>

              <div className="flex items-center justify-between pl-10.5">
                <div className="flex items-center gap-1.5 text-gray-400 overflow-hidden">
                  <MapPin size={10} className="shrink-0" />
                  <span className="text-[10px] font-medium truncate">Central Park → Times Square</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{4 + i}m ago</span>
                </div>
              </div>
            </div>
          ))}
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
      `}</style>
    </div>
  );
};

export default TripManagement;
