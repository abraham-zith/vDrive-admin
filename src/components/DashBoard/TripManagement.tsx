import React from "react";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ArrowRightOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { Typography, Badge, Avatar, Tag, Tooltip } from "antd";
import { FiMapPin } from "react-icons/fi";

const { Text, Title } = Typography;

interface TripManagementProps {
  stats: {
    onTripDrivers: number;
    todayTrips: number;
    totalScheduledRides: number;
    totalCancellationsToday: number;
    pendingVerifications: number;
    documentExpiryAlerts: number;
    loading: boolean;
  };
}

const TripManagement: React.FC<TripManagementProps> = ({ stats }) => {
  // Mini Alert Item for Onboarding Metrics
  const AlertItem = ({ count, label, type }: { count: number; label: string; type: 'warning' | 'error' }) => (
    count > 0 ? (
      <div className={`flex items-center justify-between p-2 rounded-lg mb-2 text-[10px] font-bold uppercase tracking-tight ${type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
        <div className="flex items-center gap-2">
          <WarningOutlined />
          <span>{label}</span>
        </div>
        <Badge count={count} size="small" style={{ backgroundColor: type === 'warning' ? '#f59e0b' : '#ef4444', fontSize: '10px' }} />
      </div>
    ) : null
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-105 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <FiMapPin className="text-orange-500" />
          <span className="font-bold text-gray-800 text-sm">Trip Management</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge status="processing" color="orange" />
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest text-[9px]">Live</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar bg-gray-50/20">

        {/* Onboarding Alerts (Relocated here) */}
        {(stats.pendingVerifications > 0 || stats.documentExpiryAlerts > 0) && (
          <div className="mb-1">
            <AlertItem count={stats.pendingVerifications} label="Pending Verifications" type="warning" />
            <AlertItem count={stats.documentExpiryAlerts} label="Document Expiry" type="error" />
          </div>
        )}

        {/* Global Trip Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-24 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Active Now</Text>
              <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center text-xs">
                <EnvironmentOutlined />
              </div>
            </div>
            <div>
              <Title level={4} className="!m-0 text-gray-800 font-black">{stats.loading ? "..." : stats.onTripDrivers}</Title>
              <Text className="text-[9px] text-gray-400">Ongoing Trips</Text>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-24 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Done Today</Text>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center text-xs">
                <CheckCircleOutlined />
              </div>
            </div>
            <div>
              <Title level={4} className="!m-0 text-gray-800 font-black">{stats.loading ? "..." : stats.todayTrips}</Title>
              <Text className="text-[9px] text-gray-400">Completed</Text>
            </div>
          </div>
        </div>

        {/* Live Active Trip Details List */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between px-1">
            <Text className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Live Active Trips</Text>
            <Tooltip title="View Detailed List">
              <Text className="text-[10px] text-blue-500 font-bold cursor-pointer hover:underline">See All</Text>
            </Tooltip>
          </div>

          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar size={24} icon={<UserOutlined />} className="bg-gray-100 text-gray-400 text-[10px]" />
                  <div className="flex flex-col">
                    <Text className="text-[11px] font-bold text-gray-800 leading-none">Trip #{1000 + i}</Text>
                    <Text className="text-[9px] text-gray-400 font-medium">Driver ID: DRV-{i}0{i}</Text>
                  </div>
                </div>
                <Tag color="orange" className="m-0 text-[8px] font-black px-1.5 leading-tight rounded-full border-0">IN-PROGRESS</Tag>
              </div>

              <div className="space-y-1.5 mb-2">
                <div className="flex items-center gap-2 text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <Text className="text-gray-600 truncate">Central Park, NY</Text>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <Text className="text-gray-600 truncate">Times Square, NY</Text>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-gray-400 text-[9px]">
                  <ClockCircleOutlined />
                  <span>ETA: {4 + i} mins</span>
                </div>
                <ArrowRightOutlined className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
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
      `}</style>
    </div>
  );
};

export default TripManagement;
