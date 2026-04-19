import React from "react";
import { Table, Button, Switch, Tooltip, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { type Coupon } from "../../store/slices/couponSlice";
import dayjs from "dayjs";

interface CouponTableProps {
  data: Coupon[];
  loading: boolean;
  onEdit: (record: Coupon) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, is_active: boolean) => void;
  isSuperAdmin?: boolean;
}

const CouponTable: React.FC<CouponTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  isSuperAdmin = false,
}) => {
  const columns = [
    {
      title: <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Promo Code</span>,
      dataIndex: "code",
      key: "code",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
            <span className="font-extrabold text-sm font-mono text-blue-700 tracking-widest">
              {text}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Discount Offer</span>,
      key: "discount",
      render: (_: any, record: Coupon) => {
        if (record.discount_type === "PERCENTAGE") {
          return (
            <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-blue-100 w-fit">
              {record.discount_value}% OFF
            </div>
          );
        }
        if (record.discount_type === "FIXED") {
          return (
            <div className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-emerald-100 w-fit">
              ₹{record.discount_value} OFF
            </div>
          );
        }
        return (
          <div className="px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-violet-100 w-fit">
            FREE RIDE
          </div>
        );
      },
    },
    {
      title: <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">User Eligibility</span>,
      dataIndex: "user_eligibility",
      key: "user_eligibility",
      render: (val: string) => (
        <Tag className="rounded-full px-3 py-0.5 border-none bg-gray-100 text-gray-600 font-bold text-[10px] uppercase tracking-widest">
          {val.replace("_", " ")}
        </Tag>
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Validity Period</span>,
      key: "validity",
      render: (_: any, record: Coupon) => {
        const isExpired = dayjs().isAfter(dayjs(record.valid_until));
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <span className="text-gray-300">FROM</span> {dayjs(record.valid_from).format("MMM DD, YYYY")}
            </div>
            <div className={`flex items-center gap-2 text-xs font-bold ${isExpired ? 'text-rose-500' : 'text-gray-700'}`}>
              <span className="text-gray-300 uppercase">THRU</span> {dayjs(record.valid_until).format("MMM DD, YYYY")}
              {isExpired && <span className="text-[10px] bg-rose-50 px-1 rounded">EXPIRED</span>}
            </div>
          </div>
        )
      },
    },
    {
      title: <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Status</span>,
      key: "is_active",
      render: (_: any, record: Coupon) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={record.is_active}
            disabled={!isSuperAdmin}
            onChange={(checked) => onToggleStatus(record.id, checked)}
            className={`${record.is_active ? 'bg-emerald-500' : 'bg-gray-300'} ${!isSuperAdmin ? 'opacity-50' : ''}`}
          />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${record.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
            {record.is_active ? 'Active' : 'Disabled'}
          </span>
        </div>
      ),
    },
    ...(isSuperAdmin ? [
      {
        title: <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Actions</span>,
        key: "actions",
        render: (_: any, record: Coupon) => (
          <Space size="small">
            <Tooltip title="Edit Promotion">
              <Button
                type="text"
                icon={<EditOutlined className="text-blue-500" />}
                onClick={() => onEdit(record)}
                className="hover:bg-blue-50 rounded-lg h-9 w-9 flex items-center justify-center transition-colors"
              />
            </Tooltip>
            <Tooltip title="Remove Permanent">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record.id)}
                className="hover:bg-red-50 rounded-lg h-9 w-9 flex items-center justify-center transition-colors"
              />
            </Tooltip>
          </Space>
        ),
      }
    ] : []),
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default CouponTable;
