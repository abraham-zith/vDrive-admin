import React from "react";
import { Card } from "antd";
import {
  ThunderboltOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const actions = [
  {
    key: "trips",
    icon: <EnvironmentOutlined style={{ fontSize: 20, color: "#1677ff" }} />,
    title: "View All Trips",
    description: "Live trip tracking",
  },
  {
    key: "drivers",
    icon: <TeamOutlined style={{ fontSize: 20, color: "#52c41a" }} />,
    title: "Manage Drivers",
    description: "Driver fleet overview",
  },
  {
    key: "revenue",
    icon: <DollarOutlined style={{ fontSize: 20, color: "#faad14" }} />,
    title: "Revenue Reports",
    description: "Financial insights",
  },
  {
    key: "dispute",
    icon: (
      <ExclamationCircleOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
    ),
    title: "Dispute Center",
    description: "Handle complaints",
  },
];

const QuickActions: React.FC = () => {
  return (
    <div className="p-6 bg-white  shadow-xl rounded-xl">
      <div className="flex items-center mb-4">
        <ThunderboltOutlined
          style={{ fontSize: 20, color: "#1677ff" }}
          className="text-blue-500 text-xl mr-2"
        />
        <h4 className="text-lg font-semibold">Quick Actions</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-2 gap-4 ">
        {actions.map((item) => (
          <Card
            hoverable
            key={item.key}
            className="rounded-lg"
            bodyStyle={{ backgroundColor: "#f5f5f5" }}
          >
            <div className="flex flex-col items-start ">
              {item.icon}
              <div className="mt-3 text-base font-semibold">{item.title}</div>
              <div className="text-gray-500 text-sm">{item.description}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
