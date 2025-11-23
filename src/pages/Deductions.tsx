import React from "react";
import DeductionTable from "../components/DeductionsTable/DeductionsTable";
import {
  CalculatorOutlined,
  DollarOutlined,
  SettingOutlined,
  ReloadOutlined,
  WarningOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import { Button } from "antd";
import { IoMdRefresh } from "react-icons/io";
import AdvancedFilters from "../components/AdvancedFilters/AdvanceFilters";
import type { FilterField } from "../components/AdvancedFilters/AdvanceFilters";
import dayjs from "dayjs";
import { useState } from "react";

export interface Driver {
  fullName: string;
  id: string;
  phone: string;
}
export type DeductionStatus =
  | "Success"
  | "Failed"
  | "Pending"
  | "Initiated"
  | "Reversed";

export interface Deduction {
  id: string;
  driver: Driver;
  amount: string;
  trip: string;
  type: string;
  balanceBefore: string;
  balanceAfter: string;
  status: DeductionStatus;
  date: string;
  reference: string;
  performedBy: string;
}
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="flex flex-col justify-center rounded-2xl  border border-neutral-300 gap-2 px-4 py-5  bg-white hover:shadow-md transition-all">
      <div className="flex items-center gap-3  text-sm font-medium">
        <span className="text-gray-500">{title}</span>
        <span>{icon}</span>
      </div>
      <div className={`text-2xl font-bold text-gray-900 ${color}`}>{value}</div>
    </div>
  );
};
const Deductions = () => {
  const DATA: Deduction[] = [
    {
      id: "DED-2024-001",
      driver: { fullName: "John Smith", id: "DRV-001", phone: "+1234567890" },
      amount: "$125.50",
      trip: "TRP-2024-001",
      type: "Commission",
      balanceBefore: "$1,250.00",
      balanceAfter: "$1,124.50",
      status: "Success",
      date: "2025-10-01T10:00:00",
      reference: "REF-001",
      performedBy: "System",
    },
    {
      id: "DED-2024-002",
      driver: {
        fullName: "Alice Johnson",
        id: "DRV-002",
        phone: "+1234567891",
      },
      amount: "$45.75",
      trip: "TRP-2024-002",
      type: "Penalty",
      balanceBefore: "$890.25",
      balanceAfter: "$844.50",
      status: "Failed",
      date: "2025-10-01T10:00:00",
      reference: "REF-002",
      performedBy: "Admin",
    },
    {
      id: "DED-2024-003",
      driver: {
        fullName: "Alice Johnson",
        id: "DRV-002",
        phone: "+1234567891",
      },
      amount: "$45.75",
      trip: "TRP-2024-002",
      type: "Penalty",
      balanceBefore: "$890.25",
      balanceAfter: "$844.50",
      status: "Failed",
      date: "2025-10-01T10:00:00",
      reference: "REF-002",
      performedBy: "Admin",
    },
    {
      id: "DED-2024-004",
      driver: {
        fullName: "Alice Johnson",
        id: "DRV-002",
        phone: "+1234567891",
      },
      amount: "$45.75",
      trip: "TRP-2024-002",
      type: "Penalty",
      balanceBefore: "$890.25",
      balanceAfter: "$844.50",
      status: "Failed",
      date: "2025-10-02T10:00:00",
      reference: "REF-002",
      performedBy: "Admin",
    },
  ];

  const [filteredData, setFilteredData] = useState<Deduction[]>(DATA);

  const driverOptions = Array.from(
    new Set(DATA.map((item) => item.driver.fullName))
  ).map((name) => ({
    value: name,
    label: name,
  }));

  const fields: FilterField[] = [
    {
      name: "driver",
      label: "Driver",
      type: "select",
      options: driverOptions,
    },
    { name: "date", label: "Date", type: "date" },
  ];


  const applyFilters = (values: Record<string, any>) => {
    let tempData = DATA;

    if (values?.date) {
      tempData = tempData.filter((user) =>
        dayjs(user?.date).isSame(values?.date, "day")
      );
    }

    if (values?.driver?.length > 0) {
      const selectedDriver = Array.isArray(values?.driver)
        ? values?.driver
        : [values?.driver];

      tempData = tempData.filter((user) =>
        selectedDriver.includes(user?.driver?.fullName)
      );
    }

    setFilteredData(tempData);
  };


  const stats = [
    {
      title: "Total Deductions",
      value: "1,247",
      icon: (
        <span className="text-blue-500 text-base">
          <CalculatorOutlined />
        </span>
      ),
    },
    {
      title: "Total Commission",
      value: "$45,230.50",
      icon: (
        <span className="text-green-500">
          <DollarOutlined />
        </span>
      ),
    },
    {
      title: "Manual Adjustments",
      value: "$8,940.25",
      icon: (
        <span className="text-blue-400 text-base">
          <SettingOutlined />
        </span>
      ),
    },
    {
      title: "Total Refunds",
      value: "$2,150.75",
      icon: (
        <span className="text-yellow-500 text-base">
          <ReloadOutlined />
        </span>
      ),
    },
    {
      title: "Total Penalties",
      value: "$1,890.00",
      icon: (
        <span className="text-red-500 text-base">
          <WarningOutlined />
        </span>
      ),
    },
    {
      title: "Net Deduction Amount",
      value: "$58,211.50",
      icon: (
        <span className="text-green-500">
          <ArrowDownOutlined className="text-gray-400 text-base" />
        </span>
      ),
    },
  ];
  return (
    <TitleBar
      title="Deduction Management"
      description="Monitor and manage driver deductions"
      extraContent={
        <div>
          <Button
            icon={<IoMdRefresh />}
            loading={false}
            type="primary"
            onClick={() => {}}
          >
            Refresh
          </Button>
        </div>
      }
    >
      <AdvancedFilters filterFields={fields} applyFilters={applyFilters} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <DeductionTable data={filteredData} />
    </TitleBar>
  );
};

export default Deductions;
