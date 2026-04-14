import React from "react";
import { IdcardOutlined, SafetyCertificateOutlined, AlertOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Typography, Badge, Progress } from "antd";
import { FiUsers, FiFileText } from "react-icons/fi";

const { Title, Text } = Typography;

interface OnboardingMetricsProps {
  stats: {
    pendingVerifications: number;
    documentExpiryAlerts: number;
    loading: boolean;
  };
}

const OnboardingMetrics: React.FC<OnboardingMetricsProps> = ({ stats }) => {
  const MetricItem = ({
    title,
    value,
    icon,
    iconColor,
    status,
    subtitle
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    iconColor: string;
    status?: "processing" | "warning" | "error";
    subtitle?: string;
  }) => (
    <div className="flex items-center p-2.5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-100 transition-all duration-300 group cursor-default h-[64px]">
      {/* Icon Section */}
      <div className="w-10 h-10 rounded-lg border border-gray-50 flex items-center justify-center mr-3 group-hover:border-blue-200 transition-colors bg-gray-50/50 shrink-0">
        <span className={`${iconColor} text-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </span>
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Text className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate leading-none">
            {title}
          </Text>
          {status && <Badge status={status} className="scale-75" />}
        </div>
        <Title level={4} className="!m-0 text-gray-800 font-black tracking-tight !text-[16px] leading-tight">
          {stats.loading ? "..." : value}
        </Title>
        {subtitle && (
          <Text className="text-[9px] text-gray-400 font-medium truncate mt-0.5">
            {subtitle}
          </Text>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden transition-all duration-500 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg">
            <FiUsers className="text-indigo-600 text-xs" />
          </div>
          <span className="font-bold text-gray-800 text-[13px] tracking-tight whitespace-nowrap">Onboarding Pipeline</span>
        </div>
        <Badge count="LIVE" style={{ backgroundColor: '#6366f1', fontSize: '8px', height: '14px', lineHeight: '14px' }} />
      </div>

      {/* Content */}
      <div className="p-3 bg-gray-50/10 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <MetricItem
            title="Pending Verification"
            value={stats.pendingVerifications}
            icon={<SafetyCertificateOutlined />}
            iconColor="text-orange-500"
            status="processing"
            subtitle="Manual review"
          />

          <MetricItem
            title="Document Expiry"
            value={stats.documentExpiryAlerts}
            icon={<AlertOutlined />}
            iconColor="text-rose-500"
            status={stats.documentExpiryAlerts > 0 ? "error" : undefined}
            subtitle="Next 7 days"
          />
        </div>

        <div className="bg-white/50 rounded-xl p-2.5 border border-gray-100 flex items-center justify-between">
          <div className="flex flex-col flex-1 mr-4">
            <div className="flex items-center justify-between mb-1.5">
              <Text className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Compliance Health</Text>
              <Text className="text-[10px] font-black text-emerald-600">94% OK</Text>
            </div>
            <Progress 
              percent={94} 
              size="small" 
              showInfo={false} 
              strokeColor={{ '0%': '#10b981', '100%': '#34d399' }}
              trailColor="#f3f4f6"
              strokeWidth={4}
            />
          </div>
          <div className="flex flex-col items-end shrink-0 border-l border-gray-100 pl-3">
            <div className="flex items-center gap-1.5">
              <ClockCircleOutlined className="text-[10px] text-gray-400" />
              <Text className="text-[9px] text-gray-400 font-medium italic">Sync: 5m</Text>
            </div>
          </div>
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

export default OnboardingMetrics;
