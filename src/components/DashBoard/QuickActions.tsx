import React from "react";
import {
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";
import { FiGrid } from "react-icons/fi";

const actions = [
  {
    key: "trips",
    icon: <EnvironmentOutlined className="text-gray-500 text-lg" />,
    title: "Trips",
    description: "Live track",
  },
  {
    key: "drivers",
    icon: <TeamOutlined className="text-gray-500 text-lg" />,
    title: "Drivers",
    description: "Fleet",
  },
  {
    key: "revenue",
    icon: <DollarOutlined className="text-gray-500 text-lg" />,
    title: "Revenue",
    description: "Insights",
  },
  {
    key: "dispute",
    icon: <ExclamationCircleOutlined className="text-rose-500 text-lg" />,
    title: "Dispute",
    description: "Alerts",
  },
];

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <FiGrid className="text-blue-500" />
          <span className="font-bold text-gray-800 text-[12px] tracking-tight truncate">Quick Actions</span>
        </div>
      </div>

      {/* Content - Horizontal Row */}
      <div className="p-3 flex-1 flex items-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
          {actions.map((item) => (
            <div
              key={item.key}
              className="group border border-gray-100 rounded-lg p-2 flex items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 bg-white min-w-0"
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg border border-gray-50 flex items-center justify-center bg-gray-50 group-hover:bg-white mr-2 shrink-0 transition-colors">
                {item.icon}
              </div>
              
              {/* Text */}
              <div className="flex flex-col flex-1 min-w-0">
                <Typography.Text className="text-[10px] font-bold text-gray-800 truncate leading-none">
                  {item.title}
                </Typography.Text>
                <Typography.Text className="text-[9px] text-gray-400 font-medium truncate">
                  {item.description}
                </Typography.Text>
              </div>
              
              <ArrowRightOutlined className="text-[8px] text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 ml-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
