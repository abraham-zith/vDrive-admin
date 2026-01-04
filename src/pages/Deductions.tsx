import React, { useEffect } from "react";
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
import { Button, message, Spin, Alert } from "antd";
import { IoMdRefresh } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchDeductions } from "../store/slices/deductionSlice";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-neutral-300 gap-2 px-4 py-5 bg-white hover:shadow-md transition-all">
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className="text-gray-500">{title}</span>
        <span>{icon}</span>
      </div>
      <div className={`text-2xl font-bold text-gray-900 ${color}`}>{value}</div>
    </div>
  );
};

const Deductions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { deductions, loading, error, stats } = useSelector(
    (state: RootState) => state.deductions
  );

  useEffect(() => {
    dispatch(fetchDeductions());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDeductions())
      .unwrap()
      .then(() => message.success("Data refreshed successfully"))
      .catch((err) => message.error(err));
  };

  const dashboardStats = [
    {
      title: "Total Deductions",
      value: stats?.totalDeductions || "0",
      icon: (
        <span className="text-blue-500 text-base">
          <CalculatorOutlined />
        </span>
      ),
    },
    {
      title: "Total Commission",
      value: stats?.totalCommission || "$0.00",
      icon: (
        <span className="text-green-500">
          <DollarOutlined />
        </span>
      ),
    },
    {
      title: "Manual Adjustments",
      value: stats?.manualAdjustments || "$0.00",
      icon: (
        <span className="text-blue-400 text-base">
          <SettingOutlined />
        </span>
      ),
    },
    {
      title: "Total Refunds",
      value: stats?.totalRefunds || "$0.00",
      icon: (
        <span className="text-yellow-500 text-base">
          <ReloadOutlined />
        </span>
      ),
    },
    {
      title: "Total Penalties",
      value: stats?.totalPenalties || "$0.00",
      icon: (
        <span className="text-red-500 text-base">
          <WarningOutlined />
        </span>
      ),
    },
    {
      title: "Net Deduction Amount",
      value: stats?.netDeductionAmount || "$0.00",
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
            loading={loading}
            type="primary"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {error && (
        <div className="px-6 mb-4">
          <Alert message="Error" description={error} type="error" showIcon />
        </div>
      )}

      {loading && (deductions?.length || 0) === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Loading deductions..." />
        </div>
      ) : (
        <DeductionTable data={deductions || []} />
      )}
    </TitleBar>
  );
};

export default Deductions;

