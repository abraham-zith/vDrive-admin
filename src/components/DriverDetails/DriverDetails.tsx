import React from "react";
import {
  Drawer,
  Card,
  Tag,
  Typography,
  Progress,
  Button,
  Tabs,
  Space,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Driver } from "../../pages/Drivers";

const { Text } = Typography;

interface DriverDetailsProps {
  driver: Driver | null;
  onClose: () => void;
  open: boolean;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({ driver, onClose, open }) => {
  if (!driver) return null;

  // ===== Basic Info =====
  const basicInfo = (
    <Card
      title={<Text strong>Basic Information</Text>}
      bordered={false}
      className="rounded-2xl shadow-md"
      extra={<Tag color="green" className="rounded-xl">{driver.status}</Tag>}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <Text type="secondary">Full Name</Text>
          <p className="text-lg font-medium">{driver.fullName}</p>
        </div>
        <Tag color="purple" className="rounded-xl">{driver.role}</Tag>
      </div>

      <div className="space-y-2 mb-4">
        <p><PhoneOutlined className="mr-2 text-gray-500" />{driver.phoneNumber}</p>
        <p><MailOutlined className="mr-2 text-gray-500" />{driver.email}</p>
        <p><EnvironmentOutlined className="mr-2 text-gray-500" />{driver.address.city}, {driver.address.state}</p>
      </div>

      <div className="mb-4">
        <Text type="secondary">Credits</Text>
        <div className="flex items-center justify-between mb-1">
          <Text strong>{driver.credit.balance}/{driver.credit.limit}</Text>
          <Text type="secondary">
            {Math.round((driver.credit.balance / driver.credit.limit) * 100)}%
          </Text>
        </div>
        <Progress percent={Math.round((driver.credit.balance / driver.credit.limit) * 100)} showInfo={false} />
      </div>

      <div className="flex justify-between">
        <div>
          <Text type="secondary">Joined</Text>
          <p>{dayjs(driver.createdAt).format("MMMM D, YYYY")}</p>
        </div>
        <div>
          <Text type="secondary">Last Update</Text>
          <p>{dayjs(driver.updatedAt).format("MMMM D, YYYY")}</p>
        </div>
      </div>
    </Card>
  );

  // ===== Vehicle Info =====
  const vehicleInfo = (
    <Card title={<Text strong>Vehicle Information</Text>} bordered={false} className="rounded-2xl shadow-md">
      {driver.vehicle ? (
        <div className="space-y-2">
          <p><b>Vehicle Number:</b> {driver.vehicle.vehicleNumber}</p>
          <p><b>Vehicle Type:</b> {driver.vehicle.vehicleType}</p>
          <p><b>Model:</b> {driver.vehicle.vehicleModel}</p>
          <p><b>Fuel Type:</b> {driver.vehicle.fuelType}</p>
          <div className="flex justify-between">
            <div>
              <Text type="secondary">Registration</Text>
              <p>{dayjs(driver.vehicle.registrationDate).format("MMMM D, YYYY")}</p>
            </div>
            <div>
              <Text type="secondary">Insurance Expiry</Text>
              <p>{dayjs(driver.vehicle.insuranceExpiry).format("MMMM D, YYYY")}</p>
            </div>
          </div>
          <Button type="default" block className="mt-3">Download RC Document</Button>
        </div>
      ) : (
        <p>No Vehicle Assigned</p>
      )}
    </Card>
  );

  // ===== Documents =====
  const documents = (
    <div className="space-y-3">
      {driver.documents.map((doc) => (
        <Card
          key={doc.documentId}
          title={<Text strong>{doc.documentType} Document</Text>}
          bordered={false}
          className="rounded-2xl shadow-md"
          extra={<Tag color="green">Verified</Tag>}
        >
          <p><b>Document Number:</b> {doc.documentNumber}</p>
          <p><b>Expiry Date:</b> {dayjs(doc.expiryDate).format("MMMM D, YYYY")}</p>
          <div className="flex gap-2 mt-2">
            <Button type="default">View</Button>
            <Button type="primary">Download</Button>
          </div>
        </Card>
      ))}
    </div>
  );

  // ===== Performance =====
  const performance = (
    <Card title={<Text strong>Performance Statistics</Text>} bordered={false} className="rounded-2xl shadow-md">
      <p><b>Average Rating:</b> ⭐ {driver.performance.averageRating}</p>
      <p><b>Total Trips:</b> {driver.performance.totalTrips}</p>
      <p><b>Cancellations:</b> {driver.performance.cancellations}</p>
      <p><b>Last Active:</b> {driver.performance.lastActive ? dayjs(driver.performance.lastActive).format("MMM D, YYYY, hh:mm A") : "N/A"}</p>
    </Card>
  );

  // ===== Payments =====
  const payments = (
    <Card title={<Text strong>Payment Summary</Text>} bordered={false} className="rounded-2xl shadow-md">
      <p><b>Total Earnings:</b> ₹{driver.payments.totalEarnings}</p>
      <p><b>Commission Paid:</b> ₹{driver.payments.commissionPaid}</p>
      <Progress
        percent={(driver.credit.balance / driver.credit.limit) * 100}
        format={() => `${driver.credit.balance}/${driver.credit.limit}`}
      />
    </Card>
  );

  // ===== Activity Log =====
  const activity = (
    <div className="space-y-2">
      {driver.activityLogs.map((log) => (
        <Card key={log.logId} bordered={false} className="rounded-2xl shadow-md">
          <p><b>{log.action}</b></p>
          <p>{log.details}</p>
          <p><ClockCircleOutlined /> {dayjs(log.createdAt).format("MMM D, YYYY, hh:mm A")}</p>
        </Card>
      ))}
    </div>
  );

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <img
            src={driver.profilePicUrl}
            alt={driver.fullName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="m-0 font-semibold">{driver.fullName}</h3>
            <p className="text-gray-500 m-0">Driver Details</p>
          </div>
        </div>
      }
      placement="right"
      width={420}
      onClose={onClose}
      open={open}
    >
      <Space className="mb-3">
        <Button danger>Block</Button>
        <Button danger type="dashed">Suspend</Button>
        <Button type="default" icon={<EditOutlined />}>Edit</Button>
      </Space>
      <Button type="link" className="mb-3">Reset Password</Button>

      <Tabs
        defaultActiveKey="1"
        items={[
          { key: "1", label: "Basic Information", children: basicInfo },
          { key: "2", label: "Vehicle", children: vehicleInfo },
          { key: "3", label: "Documents", children: documents },
          { key: "4", label: "Performance", children: performance },
          { key: "5", label: "Payments", children: payments },
          { key: "6", label: "Activity Log", children: activity },
        ]}
      />
    </Drawer>
  );
};

export default DriverDetails;
