import React, { useState } from "react";
import {
  Drawer, Card, Tag, Typography, Button, Space,
  Tooltip, Segmented, Avatar, Divider, Modal, Input, message,
} from "antd";
import dayjs from "dayjs";
import type { Customer } from "../../pages/Customers";
import {
  UserOutlined, CloseOutlined, CloseCircleOutlined,
  CheckCircleOutlined, PhoneOutlined, MailOutlined, StopOutlined,
  LineChartOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
} from "@ant-design/icons";
import { capitalize } from "../../utilities/capitalize";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  blockCustomer,
  unblockCustomer,
  disableCustomer,
  enableCustomer,
  deleteCustomer,
} from "../../store/slices/customerSlice";

const { Text } = Typography;

interface CustomerDetailsProps {
  customer: Customer | null;
  onClose: () => void;
  open: boolean;
}

// ─── Confirmation modal helper ────────────────────────────────────────────────
const showConfirm = ({
  title,
  description,
  confirmLabel,
  danger = false,
  requireReason = false,
  reasonPlaceholder,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void;
}) => {
  let reason = "";

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined className={danger ? "text-red-500" : "text-green-500"} />,
    content: (
      <div className="mt-2">
        <p className="text-gray-500 text-sm mb-3">{description}</p>
        {requireReason && (
          <Input.TextArea
            rows={3}
            placeholder={reasonPlaceholder ?? "Enter reason..."}
            onChange={(e) => { reason = e.target.value; }}
          />
        )}
      </div>
    ),
    okText: confirmLabel,
    okType: danger ? "danger" : "primary",
    cancelText: "Cancel",
    onOk() {
      if (requireReason && !reason.trim()) {
        message.error("Reason is required.");
        return Promise.reject(); // keep modal open
      }
      onConfirm(reason.trim() || undefined);
    },
  });
};

// ─── Component ────────────────────────────────────────────────────────────────
const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, onClose, open }) => {
  if (!customer) return null;

  const dispatch = useDispatch<AppDispatch>();
  const { actionLoading } = useSelector((state: RootState) => state.customers);
  const [activeKey, setActiveKey] = useState("1");

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleBlock = () => {
    showConfirm({
      title: "Block this customer?",
      description: "The customer will be permanently prevented from using the app until manually unblocked.",
      confirmLabel: "Block",
      danger: true,
      requireReason: true,
      reasonPlaceholder: "e.g. Fraud, repeated policy violations...",
      onConfirm: async (reason) => {
        try {
          await dispatch(blockCustomer({ id: customer.id, reason: reason! })).unwrap();
          message.success("Customer has been blocked.");
        } catch (error: any) {
          console.log("block error:", error);
          message.error("Failed to block customer.");
        }
      },
    });
  };

  const handleUnblock = () => {
    showConfirm({
      title: "Unblock this customer?",
      description: "This will restore the customer's access to the app.",
      confirmLabel: "Unblock",
      danger: false,
      onConfirm: async () => {
        try {
          await dispatch(unblockCustomer(customer.id)).unwrap();
          message.success("Customer has been unblocked.");
        } catch (error: any) {
          console.log("unblock error:", error);
          message.error("Failed to unblock customer.");
        }
      },
    });
  };

  const handleDisable = () => {
    showConfirm({
      title: "Suspend this customer?",
      description: "The customer will be temporarily restricted from using the app.",
      confirmLabel: "Suspend",
      danger: true,
      requireReason: true,
      reasonPlaceholder: "e.g. Suspicious activity, complaint under review...",
      onConfirm: async (reason) => {
        try {
          await dispatch(disableCustomer({ id: customer.id, reason: reason! })).unwrap();
          message.success("Customer has been suspended.");
        } catch (error: any) {
          console.log("disable error:", error);
          message.error("Failed to suspend customer.");
        }
      },
    });
  };

  const handleEnable = () => {
    showConfirm({
      title: "Activate this customer?",
      description: "This will restore full access to the customer's account.",
      confirmLabel: "Activate",
      danger: false,
      onConfirm: async () => {
        try {
          await dispatch(enableCustomer(customer.id)).unwrap();
          message.success("Customer has been activated.");
        } catch (error: any) {
          console.log("enable error:", error);
          message.error("Failed to activate customer.");
        }
      },
    });
  };

  const handleDelete = () => {
    showConfirm({
      title: "Delete this customer?",
      description: "This action cannot be undone. The customer's data will be permanently removed.",
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          await dispatch(deleteCustomer(customer.id)).unwrap();
          message.success("Customer has been deleted.");
          onClose();
        } catch (error: any) {
          console.log("delete error:", error);
          message.error("Failed to delete customer.");
        }
      },
    });
  };

  // ─── Status-aware action buttons ───────────────────────────────────────────
  const renderStatusActions = () => {
    switch (customer.status) {

      case "blocked":
        return (
          <Space wrap className="mb-3">
            <Button
              icon={<CheckCircleOutlined />}
              style={{ borderColor: "green", color: "green" }}
              loading={actionLoading}
              onClick={handleUnblock}
            >
              Unblock
            </Button>
            <Button danger icon={<CloseCircleOutlined />} loading={actionLoading} onClick={handleDelete}>
              Delete
            </Button>
          </Space>
        );

      case "inactive":
        return (
          <Space wrap className="mb-3">
            <Button
              icon={<CheckCircleOutlined />}
              style={{ borderColor: "green", color: "green" }}
              loading={actionLoading}
              onClick={handleEnable}
            >
              Activate
            </Button>
            <Button danger icon={<StopOutlined />} loading={actionLoading} onClick={handleBlock}>
              Block
            </Button>
          </Space>
        );
      case "suspended":
        return (
          <Space wrap className="mb-3">
            <Button
              icon={<CheckCircleOutlined />}
              style={{ borderColor: "green", color: "green" }}
              loading={actionLoading}
              onClick={handleEnable}
            >
              Activate
            </Button>
            <Button danger icon={<StopOutlined />} loading={actionLoading} onClick={handleBlock}>
              Block
            </Button>
          </Space>
        );

      default: // active
        return (
          <Space wrap className="mb-3">
            <Button
              type="default"
              danger
              icon={<StopOutlined />}
              loading={actionLoading}
              onClick={handleBlock}
            >
              Block
            </Button>
            <Button
              type="dashed"
              danger
              icon={<CloseCircleOutlined />}
              loading={actionLoading}
              onClick={handleDisable}
            >
              Suspend
            </Button>
            {/* <Button icon={<EditOutlined />}>Edit</Button> */}
          </Space>
        );
    }
  };

  // ─── Tab content ────────────────────────────────────────────────────────────
  const basicInfo = (
    <Card
      title="Basic Information"
      bordered={false}
      className="rounded-2xl shadow-md"
      extra={
        <Tag color={customer.status === "active" ? "green" : "red"} className="rounded-xl">
          {capitalize(customer.status)}
        </Tag>
      }
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text type="secondary">Full Name</Text>
          <p className="text-md font-medium">{customer.full_name}</p>
        </div>
        {customer.role && (
          <Tag color="blue" className="rounded-xl">{capitalize(customer.role)}</Tag>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <p><PhoneOutlined className="mr-2 text-gray-500" />{customer.phone_number}</p>
        <p><MailOutlined className="mr-2 text-gray-500" />{customer.email}</p>
        {customer.gender && (
          <p><UserOutlined className="mr-2 text-gray-500" />{capitalize(customer.gender)}</p>
        )}
      </div>

      {customer.emergency_contacts && customer.emergency_contacts.length > 0 && (
        <div className="mt-4">
          <Divider plain style={{ margin: '12px 0' }}>
            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Emergency Contacts
            </Text>
          </Divider>
          <div className="space-y-3">
            {customer.emergency_contacts.map((contact, index) => (
              <div key={index} className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                <div className="flex items-center gap-2 mb-1">
                  <UserOutlined className="text-blue-600 text-sm" />
                  <span className="font-semibold text-sm text-gray-800">{contact.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 ml-5">
                  <PhoneOutlined className="text-[10px]" />
                  <span>{contact.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Divider />

      <div className="flex justify-between">
        <div>
          <Text type="secondary">Joined</Text>
          <p>{dayjs(customer.created_at).format("MMMM D, YYYY")}</p>
        </div>
        <div>
          <Text type="secondary">Last Update</Text>
          <p>{dayjs(customer.updated_at).format("MMMM D, YYYY")}</p>
        </div>
      </div>
    </Card>
  );

  const activity = (
    <Card title="Activity Log" bordered={false} className="rounded-2xl shadow-md">
      <div className="text-center py-8">
        <ClockCircleOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
        <p className="mt-4 text-gray-500">No recent activity logs available.</p>
      </div>
    </Card>
  );

  const segments = [
    {
      label: <Tooltip title="Basic Information"><UserOutlined /></Tooltip>,
      key: "1",
      content: basicInfo,
    },
    {
      label: <Tooltip title="Activity Log"><LineChartOutlined /></Tooltip>,
      key: "2",
      content: activity,
    },
  ];

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar size={60} icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
            <div>
              <div className="mt-4 text-md font-semibold">{customer.full_name}</div>
              <p className="m-0 text-sm text-gray-500">Customer Details</p>
            </div>
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </div>
      }
      placement="right"
      width={480}
      onClose={onClose}
      open={open}
      closable={false}
    >
      <div>{renderStatusActions()}</div>

      <div className="w-full p-3 bg-white rounded-lg shadow">
        <Segmented
          block
          options={segments.map(({ label, key }) => ({ label, value: key }))}
          value={activeKey}
          onChange={(value) => setActiveKey(value as string)}
          className="w-full rounded-lg"
          style={{ backgroundColor: "#f5f5f5", padding: "8px" }}
        />
      </div>

      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        {segments.find((tab) => tab.key === activeKey)?.content}
      </div>
    </Drawer>
  );
};

export default CustomerDetails;