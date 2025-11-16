import React, { useRef, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  type TableColumnsType,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { format } from "date-fns-tz";
import type { DriverTransaction, Driver } from "../../pages/DriverTransaction";
import { useGetHeight } from "../../utilities/customheightWidth";

interface DriverTransactionTableProps {
  data: DriverTransaction[];
}

const DriverTransactionTable: React.FC<DriverTransactionTableProps> = ({ data }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const tableHeight = useGetHeight(contentRef);

  const statusColors: Record<string, string> = {
    Success: "green",
    Failed: "red",
    Pending: "gold",
    Initiated: "blue",
    Reversed: "gray",
    Cancelled: "volcano",
  };

  const columns: TableColumnsType<DriverTransaction> = useMemo(
    () => [
      {
        title: "Transaction ID",
        dataIndex: "transactionId",
        key: "transactionId",
        minWidth: 160,
      },
      {
        title: "Driver Details",
        dataIndex: "driver",
        key: "driver",
        minWidth: 160,
        render: (driver: Driver) => (
          <div>
            <div className="font-medium">{driver.fullName}</div>
            <div className="text-xs text-gray-500">
              {driver.id} • {driver.phone}
            </div>
          </div>
        ),
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        minWidth: 110,
      },
      {
        title: "Payment Method",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        minWidth: 120,
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        minWidth: 110,
        render: (type: string) => <Tag color="blue">{type}</Tag>,
      },
      {
        title: "Source",
        dataIndex: "source",
        key: "source",
        minWidth: 110,
      },
      {
        title: "Balance Before",
        dataIndex: "balanceBefore",
        key: "balanceBefore",
        minWidth: 140,
        render: (text: string) => <span className="font-medium">{text}</span>,
      },
      {
        title: "Balance After",
        dataIndex: "balanceAfter",
        key: "balanceAfter",
        minWidth: 140,
        render: (text: string) => <span className="font-medium">{text}</span>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        minWidth: 110,
        render: (status: string) => (
          <Tag color={statusColors[status] || "blue"}>{status}</Tag>
        ),
      },
      {
        title: "Date",
        dataIndex: "date",
        minWidth: 120,
        key: "date",
        render: (text: string) => format(new Date(text), "MMM dd, yyyy"),
      },
      {
        title: "Reference",
        dataIndex: "reference",
        key: "reference",
        minWidth: 120,
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record: DriverTransaction) => (
          <Space>
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="default"
              onClick={() => console.log("View", record.transactionId)}
            />
            <Button
              icon={<DownloadOutlined />}
              size="small"
              type="primary"
              onClick={() => console.log("Download", record.transactionId)}
            />
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div
      ref={contentRef}
      className="h-full w-full"  
    >
      <Table
        className="rounded-lg border border-gray-300"
        key={tableHeight}
        columns={columns}
        dataSource={data}
        rowKey="transactionId"
        showSorterTooltip={false}
        tableLayout="auto"
        scroll={{ y: Math.floor(tableHeight || 0) }}
      />
    </div>
  );
};

export default DriverTransactionTable;
