import { Progress, Typography, Divider } from "antd";
import { FiActivity, FiUsers, FiClock, FiMapPin, FiCheckCircle, FiXCircle } from "react-icons/fi";

const { Text } = Typography;

interface DriverMetricsColumnProps {
  stats: {
    activeDrivers: number;
    totalDrivers: number;
    availableDrivers: number;
    onTripDrivers: number;
    totalScheduledRides: number;
    acceptedScheduledRides: number;
    totalCancellationsToday: number;
    loading: boolean;
  };
}

const DriverMetricsColumn: React.FC<DriverMetricsColumnProps> = ({ stats }) => {
  const MiniMetricCard = ({ 
    title, 
    value, 
    icon, 
    blobColor,
    subtitle
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    blobColor: string;
    subtitle?: string;
  }) => (
    <div className="relative bg-white border border-gray-100 rounded-lg p-3 flex flex-col justify-between hover:shadow-md transition-all duration-300 h-[84px] overflow-hidden group">
      {/* Top Right Blob */}
      <div className={`absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${blobColor} opacity-90`}>
        <div className="relative top-1 right-1 text-white text-xs">
          {icon}
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="text-gray-400 text-[10px] font-bold leading-tight w-2/3 uppercase tracking-widest">{title}</h3>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-baseline gap-1">
          <p className="text-xl font-black text-gray-800 leading-none">{value}</p>
          {subtitle && <span className="text-[9px] text-gray-400 font-medium">{subtitle}</span>}
        </div>
      </div>
    </div>
  );

  const availabilityPercent = stats.totalDrivers > 0 
    ? Math.round((stats.availableDrivers / stats.totalDrivers) * 100) 
    : 0;
  
  const activePercent = stats.totalDrivers > 0 
    ? Math.round((stats.activeDrivers / stats.totalDrivers) * 100) 
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-105 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <FiActivity className="text-blue-500" />
          <span className="font-bold text-gray-800 text-sm">Live Driver Status</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 p-3 bg-gray-50/30 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MiniMetricCard 
            title="Available" 
            value={stats.loading ? "..." : stats.availableDrivers} 
            icon={<FiCheckCircle />} 
            blobColor="bg-emerald-500"
            subtitle="online"
          />
          <MiniMetricCard 
            title="On Trip" 
            value={stats.loading ? "..." : stats.onTripDrivers} 
            icon={<FiMapPin />} 
            blobColor="bg-orange-500"
            subtitle="active"
          />
          <MiniMetricCard 
            title="Scheduled" 
            value={stats.loading ? "..." : `${stats.acceptedScheduledRides}/${stats.totalScheduledRides}`} 
            icon={<FiClock />} 
            blobColor="bg-indigo-500"
            subtitle="acc/tot"
          />
          <MiniMetricCard 
            title="Cancelled" 
            value={stats.loading ? "..." : stats.totalCancellationsToday} 
            icon={<FiXCircle />} 
            blobColor="bg-rose-500"
            subtitle="today"
          />
        </div>

        <Divider className="my-1 border-gray-100" />

        {/* Progress Bars Section */}
        <div className="bg-white/60 rounded-xl p-3 border border-gray-100 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <Progress 
                type="circle" 
                percent={availabilityPercent} 
                size={60} 
                strokeColor={{ '0%': '#10b981', '100%': '#34d399' }}
                strokeWidth={10}
                format={(percent) => (
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[11px] font-black text-gray-800">{percent}%</span>
                  </div>
                )}
              />
              <Text className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">Availability</Text>
            </div>
            <div className="flex flex-col items-center">
              <Progress 
                type="circle" 
                percent={activePercent} 
                size={60} 
                strokeColor={{ '0%': '#3b82f6', '100%': '#60a5fa' }}
                strokeWidth={10}
                format={(percent) => (
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[11px] font-black text-gray-800">{percent}%</span>
                  </div>
                )}
              />
              <Text className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">Total Active</Text>
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
      `}</style>
    </div>
  );
};

export default DriverMetricsColumn;

