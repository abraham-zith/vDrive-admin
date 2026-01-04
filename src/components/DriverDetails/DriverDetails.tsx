import React, { useState } from "react";
import {
  Drawer,
  Card,
  Tag,
  Typography,
  Progress,
  Button,
  Space,
  Tooltip,
  Segmented,
  Avatar,
  Divider,
  Rate,
} from "antd";
import dayjs from "dayjs";
import type { Driver } from "../../pages/Drivers";
const { Text } = Typography;
import {
  UserOutlined,
  CarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  LineChartOutlined,
  EditOutlined,
  CloseOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  StopOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { capitalize } from "../../utilities/capitalize";
import AddDriverModal from "./AddDriver";
import { message } from "antd";
import axiosIns from "../../api/axios";
interface DriverDetailsProps {
  driver: Driver | null;
  onClose: () => void;
  open: boolean;
  onUpdate?: () => void;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({
  driver,
  onClose,
  open,
  onUpdate,
}) => {
  if (!driver) return null;
  const actionLabels: Record<string, string> = {
    trip_started: "Trip Started",
    trip_completed: "Trip Completed",
    trip_cancelled: "Trip Cancelled",
  };

  const [activeKey, setActiveKey] = useState("1");
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!driver) return;
    try {
      await axiosIns.put(`/api/drivers/${driver.driverId}`, {
        status: newStatus,
      });
      message.success(`Driver status updated to ${newStatus}`);
      
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      message.error("Failed to update driver status");
    }
  };

  const handleResetPassword = async () => {
    if (!driver) return;
    try {
      await axiosIns.post(`/api/drivers/${driver.driverId}/reset-password`);
      message.success(`Password reset link sent to ${driver.email}`);
    } catch (error) {
      console.error("Failed to reset password:", error);
      message.error("Failed to reset password");
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    if (!url) {
      message.error("Document URL not available");
      return;
    }
    const hide = message.loading("Downloading...", 0);
    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Delay cleanup to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      hide();
      message.success("Download started");
    } catch (error) {
      hide();
      console.error("Download failed:", error);
      message.error("Direct download failed. Opening document in new tab.");
      // Fallback to opening in new tab if fetch fails
      window.open(url, "_blank");
    }
  };

  const basicInfo = (
    <Card
      title="Basic Information"
      bordered={false}
      className="rounded-2xl shadow-md"
      extra={
        <Tag color="green" className="rounded-xl">
          {capitalize(driver?.status)}
        </Tag>
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <Text type="secondary">Full Name</Text>
          <p className="text-md font-medium">{driver?.fullName}</p>
        </div>
        <Tag color="purple" className="rounded-xl">
          {capitalize(driver?.role)}
        </Tag>
      </div>

      <div className="space-y-2 mb-4">
        <p>
          <PhoneOutlined className="mr-2 text-gray-500" />
          {driver?.phoneNumber}
        </p>
        <p>
          <MailOutlined className="mr-2 text-gray-500" />
          {driver?.email}
        </p>
        <p>
          <EnvironmentOutlined className="mr-2 text-gray-500" />
          {driver?.address?.city}, {driver?.address?.state}
        </p>
      </div>
      <Divider />
      <div className="mb-4">
        <Text type="secondary">Credits</Text>
        <div className="flex items-center justify-between mb-1">
          <Text strong>
            {driver?.credit?.balance}/{driver?.credit?.limit}
          </Text>
          <Text type="secondary">
            {Math?.round(
              (driver?.credit?.balance / driver?.credit?.limit) * 100,
            )}
            %
          </Text>
        </div>
        <Progress
          percent={Math?.round(
            (driver?.credit?.balance / driver?.credit?.limit) * 100,
          )}
          showInfo={false}
        />
      </div>
      <Divider />
      <div className="flex justify-between">
        <div>
          <Text type="secondary">Joined</Text>
          <p>{dayjs(driver?.createdAt).format("MMMM D, YYYY")}</p>
        </div>
        <div>
          <Text type="secondary">Last Update</Text>
          <p>{dayjs(driver?.updatedAt).format("MMMM D, YYYY")}</p>
        </div>
      </div>
    </Card>
  );

  const vehicleInfo = (
    <Card
      title={
        <div className="flex justify-between items-center">
          Vehicle Information
          <Tag color="green">Active</Tag>
        </div>
      }
      bordered={false}
      className="rounded-2xl shadow-md"
    >
      {driver?.vehicle ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <Text type="secondary">Vehicle Number</Text>
              <div className="font-semibold">
                {driver?.vehicle.vehicleNumber}
              </div>
            </div>
            <div>
              <Text type="secondary">Vehicle Type</Text>
              <div className="font-semibold">{driver?.vehicle.vehicleType}</div>
            </div>
          </div>

          <div>
            <Text type="secondary">Model</Text>
            <div className="font-semibold">{driver?.vehicle.vehicleModel}</div>
          </div>

          <div>
            <Text type="secondary">Fuel Type</Text>
            <div className="font-semibold">{driver?.vehicle.fuelType}</div>
          </div>
          <Divider />
          <div className="flex justify-between">
            <div>
              <Text type="secondary">Registration</Text>
              <div className="font-semibold">
                {dayjs(driver?.vehicle.registrationDate).format("MMMM D, YYYY")}
              </div>
            </div>
            <div>
              <Text type="secondary">Insurance Expiry</Text>
              <div className="font-semibold">
                {dayjs(driver?.vehicle.insuranceExpiry).format("MMMM D, YYYY")}
              </div>
            </div>
          </div>

          <Button
            type="default"
            block
            icon={<DownloadOutlined />}
            onClick={() =>
              handleDownload(
                driver.vehicle?.rcDocumentUrl || "",
                "RC_Document.pdf"
              )
            }
          >
            Download RC Document
          </Button>
        </div>
      ) : (
        <Text type="secondary">No Vehicle Assigned</Text>
      )}
    </Card>
  );

  const documents = (
    <div className="space-y-4">
      {driver?.documents?.map((doc) => (
        <Card
          title={
            <div className="flex justify-between items-center mb-4">
              {capitalize(doc?.documentType)} Document
              <Tag color="green">Verified</Tag>
            </div>
          }
          key={doc?.documentId}
          bordered={false}
          className="rounded-2xl shadow-md"
          bodyStyle={{ padding: "16px" }}
        >
          <div className="space-y-2">
            <div>
              <Text type="secondary">Document Number</Text>
              <div className="font-semibold">{doc?.documentNumber}</div>
            </div>

            {doc?.documentType === "license" && (
              <div>
                <Text type="secondary">Expiry Date</Text>
                <div className="font-semibold">
                  {dayjs(doc?.expiryDate).format("MMMM D, YYYY")}
                </div>
              </div>
            )}
          </div>


          <Space className="mt-4">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => {
                if (doc?.documentUrl) {
                  window.open(doc.documentUrl, "_blank");
                } else {
                  message.error("Document URL not available");
                }
              }}
            >
              View
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() =>
                handleDownload(
                  doc.documentUrl,
                  `${doc.documentType}_${doc.documentNumber}.pdf`
                )
              }
            >
              Download
            </Button>
          </Space>
        </Card>
      ))}
    </div>
  );

  const performance = (
    <div className="space-y-4">
      <Card
        title="Performance Statistics"
        bordered={false}
        className="rounded-2xl shadow-md"
      >
        <div className="mb-3">
          <Text type="secondary">Average Rating</Text>
          <div className="flex items-center gap-2">
            <Rate
              disabled
              defaultValue={Math?.round(driver?.performance?.averageRating)}
            />
            <Text strong>{driver?.performance?.averageRating?.toFixed(1)}</Text>
          </div>
        </div>

        <div className="flex justify-between mb-3">
          <div>
            <Text type="secondary">Total Trips</Text>
            <p className="text-lg font-medium">
              {driver?.performance?.totalTrips}
            </p>
          </div>
          <div>
            <Text type="secondary">Cancellations</Text>
            <p className="text-lg font-medium text-red-500">
              {driver?.performance?.cancellations}
            </p>
            <Text type="secondary">
              {(
                (driver?.performance?.cancellations /
                  driver?.performance?.totalTrips) *
                100
              )?.toFixed(1)}
              % rate
            </Text>
          </div>
        </div>

        <div>
          <Text type="secondary">Last Active</Text>
          <p>
            {driver?.performance?.lastActive
              ? dayjs(driver?.performance?.lastActive)?.format(
                  "MMM D, YYYY, hh:mm A",
                )
              : "N/A"}
          </p>
        </div>
      </Card>
    </div>
  );

  const payments = (
    <div className="space-y-4">
      <Card
        title="Payment Summary"
        bordered={false}
        className="rounded-2xl shadow-md"
      >
        <div className="space-y-4">
          <div className="p-2 rounded-lg">
            <Text type="secondary">Total Earnings</Text>
            <div className="text-lg font-semibold text-green-600">
              ₹{driver?.payments?.totalEarnings?.toLocaleString()}
            </div>
          </div>

          <div className="p-2  rounded-lg">
            <Text type="secondary">Commission Paid</Text>
            <div className="text-lg font-semibold text-gray-800">
              ₹{driver?.payments?.commissionPaid?.toLocaleString()}
            </div>
          </div>

          <div className="p-2 rounded-lg">
            <Text type="secondary">Credits</Text>
            <div className="flex justify-between items-center">
              <span>
                {driver?.credit?.balance}/{driver?.credit?.limit}
              </span>
              <span>
                {Math.round(
                  (driver?.credit?.balance / driver?.credit?.limit) * 100,
                )}
                %
              </span>
            </div>
            <Progress
              percent={Math.round(
                (driver?.credit?.balance / driver?.credit?.limit) * 100,
              )}
              strokeColor="#1677ff"
              showInfo={false}
            />
          </div>
        </div>
      </Card>
    </div>
  );
  const activity = (
    <Card
      title="Activity Log"
      bordered={false}
      className="rounded-2xl shadow-md"
    >
      <div className="space-y-4">
        {driver?.activityLogs?.map((log) => (
          <div key={log?.logId} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <Text strong>{actionLabels[log?.action] || log?.action}</Text>
            </div>
            <Text type="secondary" className="block ml-5">
              {log?.details}
            </Text>
            <Text type="secondary" className="block ml-5 text-xs">
              <ClockCircleOutlined />{" "}
              {dayjs(log?.createdAt).format("MMM D, YYYY, hh:mm A")}
            </Text>
            <Divider className="my-2" />
          </div>
        ))}
      </div>
    </Card>
  );
  const segments = [
    {
      label: (
        <Tooltip title="Basic Information">
          <UserOutlined />
        </Tooltip>
      ),
      key: "1",
      content: basicInfo,
    },
    {
      label: (
        <Tooltip title="Vehicle">
          <CarOutlined />
        </Tooltip>
      ),
      key: "2",
      content: vehicleInfo,
    },
    {
      label: (
        <Tooltip title="Documents">
          <FileTextOutlined />
        </Tooltip>
      ),
      key: "3",
      content: documents,
    },
    {
      label: (
        <Tooltip title="Performance">
          <BarChartOutlined />
        </Tooltip>
      ),
      key: "4",
      content: performance,
    },
    {
      label: (
        <Tooltip title="Payments">
          <CreditCardOutlined />
        </Tooltip>
      ),
      key: "5",
      content: payments,
    },
    {
      label: (
        <Tooltip title="Activity Log">
          <LineChartOutlined />
        </Tooltip>
      ),
      key: "6",
      content: activity,
    },
  ];

  const renderStatusActions = () => {
    switch (driver?.status) {
      case "pending":
        return (
          <Space wrap>
            <Button
              icon={<CheckCircleOutlined />}
              style={{ borderColor: "green", color: "green" }}
              onClick={() => handleStatusUpdate("active")}
            >
              Approve
            </Button>
            <Button
              type="default"
              icon={<CloseCircleOutlined />}
              style={{ borderColor: "red", color: "red" }}
              onClick={() => handleStatusUpdate("blocked")}
            >
              Reject
            </Button>
            <Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
              Edit
            </Button>
            <Button icon={<SendOutlined />} onClick={handleResetPassword}>
              Reset Password
            </Button>
          </Space>
        );
      case "blocked":
      case "suspended":
        return (
          <>
            <Space wrap className="flex items-center gap-3 mb-3">
              <Button
                icon={<CheckCircleOutlined />}
                style={{ borderColor: "green", color: "green" }}
                onClick={() => handleStatusUpdate("active")}
              >
                Activate
              </Button>
              <Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
                Edit
              </Button>
              <Button
                type="default"
                icon={<SendOutlined />}
                className="mb-4"
                onClick={handleResetPassword}
              >
                Reset Password
              </Button>
            </Space>
          </>
        );
      default:
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Button
                type="default"
                danger
                icon={<StopOutlined />}
                onClick={() => handleStatusUpdate("blocked")}
              >
                Block
              </Button>
              <Button
                type="dashed"
                danger
                icon={<SyncOutlined />}
                onClick={() => handleStatusUpdate("suspended")}
              >
                Suspend
              </Button>
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => setEditModalOpen(true)}
              >
                Edit
              </Button>
            </div>
            <Button
              type="default"
              icon={<SendOutlined />}
              className="mb-4"
              onClick={handleResetPassword}
            >
              Reset Password
            </Button>{" "}
          </>
        );
    }
  };
  return (
    <Drawer
      title={
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <Avatar
              size={60}
              src={driver?.profilePicUrl}
              icon={<UserOutlined />}
            />
            <div>
              <div className="mt-4 text-md font-semibold">
                {driver?.fullName}
              </div>
              <p className="m-0 text-sm text-gray-500 font-weight: 100">
                Driver Details
              </p>
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
          options={segments.map(({ label, key }) => ({
            label,
            value: key,
          }))}
          value={activeKey}
          onChange={(value) => setActiveKey(value as string)}
          className="w-full rounded-lg"
          style={{
            backgroundColor: "#f5f5f5",
            padding: "8px",
          }}
        />
      </div>

      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        {segments.find((tab) => tab.key === activeKey)?.content}
      </div>

      <AddDriverModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={() => {
          setEditModalOpen(false);
          message.success("Driver updated successfully");
          if (onUpdate) onUpdate();
        }}
        initial={driver || undefined}
        mode="edit"
      />
    </Drawer>
  );
};

export default DriverDetails;
