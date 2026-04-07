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
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Radio,
  message,
} from "antd";
import dayjs from "dayjs";
import type { Driver, DriverStatus } from "../../store/slices/driverSlice";
import { useAppDispatch } from "../../store/hooks";
import {
  updateDriverStatus,
  updateDriverProfile,
  updateDocumentStatus,
  resetDriverPassword,
} from "../../store/slices/driverSlice";
const { Text, Title } = Typography;
const { Option } = Select;
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
interface DriverDetailsProps {
  driver: Driver | null;
  onClose: () => void;
  open: boolean;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({
  driver,
  onClose,
  open,
}) => {
  const actionLabels: Record<string, string> = {
    trip_started: "Trip Started",
    trip_completed: "Trip Completed",
    trip_cancelled: "Trip Cancelled",
  };

  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState("1");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVehicleEditModalOpen, setIsVehicleEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    type: string;
  } | null>(null);
  const [rejectModalDoc, setRejectModalDoc] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!driver) {
    return (
      <Drawer
        title="Driver Details"
        placement="right"
        width={480}
        onClose={onClose}
        open={open}
        closable={true}
        destroyOnClose={true}
      >
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <UserOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
          <Title level={4}>Driver Not Found</Title>
          <Text type="secondary">
            We couldn't find the details for this driver. Please try refreshing the list.
          </Text>
          <Button type="primary" onClick={onClose} className="mt-6">
            Close
          </Button>
        </div>
      </Drawer>
    );
  }
  const handleStatusUpdate = (status: DriverStatus) => {
    if (!driver) return;
    Modal.confirm({
      title: `${capitalize(status)} Driver`,
      content: `Are you sure you want to change this driver's status to ${status}?`,
      onOk: async () => {
        setLoadingAction(status);
        try {
          await dispatch(
            updateDriverStatus({ driver_id: driver.driverId || driver.driver_id || driver.id || "", status }),
          ).unwrap();

          message.success(`Driver ${status} successfully`);
        } catch (err: any) {
          message.error(err || `Failed to ${status} driver`);
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  const handleResetPassword = () => {
    if (!driver) return;
    Modal.confirm({
      title: "Reset Password",
      content: "Are you sure you want to send a password reset link?",
      onOk: async () => {
        setLoadingAction("reset-password");
        try {
          await dispatch(resetDriverPassword(driver.driverId || driver.driver_id || driver.id || "")).unwrap();
          message.success("Password reset link sent");
        } catch (err: any) {
          message.error(err || "Failed to send reset link");
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };


  const handleUpdateProfile = async (values: any) => {
    if (!driver) return;
    setLoadingAction("update-profile");
    try {
      await dispatch(
        updateDriverProfile({
          driver_id: driver.driverId || driver.driver_id || driver.id || "",
          data: {
            ...values,
            dob: values.dob ? values.dob.toISOString() : undefined,
          },
        }),
      ).unwrap();

      message.success("Profile updated successfully");
      setIsEditModalOpen(false);
    } catch (err: any) {
      message.error(err || "Failed to update profile");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateVehicle = async (values: any) => {
    if (!driver) return;
    setLoadingAction("update-vehicle");
    try {
      await dispatch(
        updateDriverProfile({
          driver_id: driver.driverId || driver.driver_id || driver.id || "",
          data: {
            vehicle: {
              ...driver.vehicle,
              ...values,
              registration_date: values.registration_date
                ? values.registration_date.toISOString()
                : driver.vehicle?.registration_date,
              insurance_expiry: values.insurance_expiry
                ? values.insurance_expiry.toISOString()
                : driver.vehicle?.insurance_expiry,
            },
          },
        }),
      ).unwrap();

      message.success("Vehicle information updated successfully");
      setIsVehicleEditModalOpen(false);
    } catch (err: any) {
      message.error(err || "Failed to update vehicle info");
    } finally {
      setLoadingAction(null);
    }
  };



  const handleDocumentApprove = (documentId: string) => {
    if (!driver) return;
    Modal.confirm({
      title: "Approve Document",
      content: "Are you sure you want to approve this document?",
      onOk: async () => {
        setLoadingAction(`approve-${documentId}`);
        try {
          await dispatch(
            updateDocumentStatus({
              driver_id: driver.driverId || driver.driver_id || driver.id || "",
              document_id: documentId,
              status: "verified",
            }),
          ).unwrap();

          message.success("Document approved");
        } catch (err: any) {
          message.error(err || "Failed to approve document");
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };


  const handleDocumentReject = async () => {
    if (!rejectModalDoc || !driver) return;
    setLoadingAction(`reject-${rejectModalDoc.id}`);
    try {
      await dispatch(
        updateDocumentStatus({
          driver_id: driver.driverId || driver.driver_id || driver.id || "",
          document_id: rejectModalDoc.id,
          status: "rejected",
          reason: rejectionReason,
        }),
      ).unwrap();

      message.success("Document rejected");
      setRejectModalDoc(null);
      setRejectionReason("");
    } catch (err: any) {
      message.error(err || "Failed to reject document");
    } finally {
      setLoadingAction(null);
    }
  };


  const getStatusColor = (status: any) => {
    if (typeof status !== "string") return "default";
    switch (status.toLowerCase()) {
      case "active":
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "blocked":
      case "rejected":
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const basicInfo = (
    <Card
      title="Basic Information"
      bordered={false}
      className="rounded-2xl shadow-md"
      extra={
        <Space>
          <Tag color={getStatusColor(driver?.status || "")} className="rounded-xl">
            {capitalize(driver?.status || "")}
          </Tag>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              form.setFieldsValue({
                ...driver,
                dob: (driver?.dob || driver?.date_of_birth) ? dayjs(driver.dob || driver.date_of_birth) : null,
              });
              setIsEditModalOpen(true);
            }}
          />

        </Space>
      }
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <Text type="secondary" className="text-xs">
            Full Name
          </Text>
          <p className="text-lg font-bold text-gray-800 m-0">
            {driver?.full_name || "N/A"}
          </p>
          {driver?.vdrive_id && (
            <Text type="secondary" className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
              ID: {driver.vdrive_id}
            </Text>
          )}
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <Tag color="purple" className="rounded-xl px-3 py-1 text-sm m-0">
            {capitalize(driver?.role || "")}
          </Tag>
          {driver?.kyc_status && (
            <Tag color={getStatusColor(driver.kyc_status)} className="rounded-xl px-2 py-0 text-[10px] m-0">
              KYC: {capitalize(driver.kyc_status)}
            </Tag>
          )}
          {driver?.onboarding_status && (
            <Tag color="blue" className="rounded-xl px-2 py-0 text-[10px] m-0">
              {capitalize(driver.onboarding_status)}
            </Tag>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {driver?.availability?.online ? (
          <Tag color="green" icon={<SyncOutlined spin />} className="m-0">
            Online
          </Tag>
        ) : (
          <Tag color="default" className="m-0">
            Offline
          </Tag>
        )}
        <Text type="secondary" className="text-xs">
          Joined:{" "}
          <span className="text-gray-600 font-medium">
            {driver?.created_at
              ? dayjs(driver.created_at).format("MMM D, YYYY")
              : "N/A"}
          </span>

        </Text>
      </div>


      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Text type="secondary" className="text-xs">
            Phone Number
          </Text>
          <p className="font-medium flex items-center m-0">
            <PhoneOutlined className="mr-2 text-blue-500" />
            {driver?.phone_number || "N/A"}
          </p>

        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Email Address
          </Text>
          <p className="font-medium flex items-center m-0">
            <MailOutlined className="mr-2 text-blue-500" />
            {driver?.email || "N/A"}
          </p>
        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Date of Birth
          </Text>
          <p className="font-medium flex items-center m-0">
            <ClockCircleOutlined className="mr-2 text-blue-500" />
            {(driver?.dob || driver?.date_of_birth) ? dayjs(driver.dob || driver.date_of_birth).format("MMM D, YYYY") : "N/A"}
          </p>

        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Address
          </Text>
          <div className="font-medium flex items-start text-sm leading-tight">
            <EnvironmentOutlined className="mr-2 mt-1 text-blue-500" />
            <span>
              {driver?.address?.street}, {driver?.address?.city},<br />
              {driver?.address?.state} - {driver?.address?.pincode}
            </span>
          </div>
        </div>
      </div>


      <Divider />
      <div className="mb-4">
        <Text type="secondary">Credits</Text>
        <div className="flex items-center justify-between mb-1">
          <Text strong>
            {driver?.credit?.balance || 0}/{driver?.credit?.limit || 0}
          </Text>
          <Text type="secondary">
            {driver?.credit?.limit
              ? Math.round(
                  ((driver?.credit?.balance || 0) / driver?.credit?.limit) *
                    100,
                )
              : 0}
            %
          </Text>

        </div>
        <Progress
          percent={Math?.round(
            ((driver?.credit?.balance || 0) / (driver?.credit?.limit || 1)) * 100,
          )}
          showInfo={false}
        />
      </div>
      <Divider />
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
        <div>
          <Text type="secondary" className="text-xs">
            Account Created
          </Text>
          <p className="m-0 text-sm font-medium">
            {driver?.created_at
              ? dayjs(driver.created_at).format("MMMM D, YYYY")
              : "N/A"}
          </p>

        </div>
        <div className="text-right">
          <Text type="secondary" className="text-xs">
            Last Updated
          </Text>
          <p className="m-0 text-sm font-medium">
            {driver?.updated_at
              ? dayjs(driver.updated_at).format("MMMM D, YYYY")
              : "N/A"}
          </p>

        </div>
      </div>

    </Card>
  );

  const vehicleInfo = (
    <Card
      title={
        <div className="flex justify-between items-center">
          Vehicle Information
          <Space>
            <Tag color="green">Active</Tag>
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                form.setFieldsValue({
                  ...driver?.vehicle,
                  registration_date: driver?.vehicle?.registration_date
                    ? dayjs(driver.vehicle.registration_date)
                    : null,
                  insurance_expiry: driver?.vehicle?.insurance_expiry
                    ? dayjs(driver.vehicle.insurance_expiry)
                    : null,
                });
                setIsVehicleEditModalOpen(true);
              }}

            />
          </Space>
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
                {driver?.vehicle.vehicle_number}
              </div>

            </div>
            <div>
              <Text type="secondary">Vehicle Type</Text>
              <div className="font-semibold">
                {capitalize(driver?.vehicle.vehicle_type)}
              </div>

            </div>
          </div>

          <div>
            <Text type="secondary">Model</Text>
            <div className="font-semibold">{driver?.vehicle.vehicle_model}</div>

          </div>

          <div>
            <Text type="secondary">Fuel Type</Text>
            <div className="font-semibold">
              {capitalize(driver?.vehicle.fuel_type)}
            </div>

          </div>
          <Divider />
          <div className="flex justify-between">
            <div>
              <Text type="secondary">Registration</Text>
              <div className="font-semibold">
                {driver?.vehicle?.registration_date ? dayjs(driver.vehicle.registration_date).format(
                  "MMMM D, YYYY",
                ) : "N/A"}
              </div>

            </div>
            <div>
              <Text type="secondary">Insurance Expiry</Text>
              <div className="font-semibold">
                {driver?.vehicle?.insurance_expiry ? dayjs(driver.vehicle.insurance_expiry).format(
                  "MMMM D, YYYY",
                ) : "N/A"}
              </div>

            </div>
          </div>

          <Button type="default" block icon={<DownloadOutlined />}>
            Download RC Document
          </Button>
        </div>
      ) : (
        <Text type="secondary">No Vehicle Assigned</Text>
      )}
    </Card>
  );

  const documents = (
    <div className="grid grid-cols-1 gap-4">
      {(driver?.documents)?.map((doc: any) => (
        <Card
          key={doc?.document_id}
          bordered={false}
          className="rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "20px" }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <Title level={5} className="m-0">
                {capitalize(doc?.document_type)} Document
              </Title>
              <Text type="secondary" className="text-xs">
                Ref: {doc?.document_number}
              </Text>
            </div>
            <Tag color={getStatusColor(doc?.license_status)} className="rounded-lg">
              {capitalize(doc?.license_status)}
            </Tag>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-center border border-dashed border-gray-300 w-32 h-20 overflow-hidden">
              {doc?.document_url ? (
                <img
                  src={doc?.document_url}
                  alt={doc?.document_type}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setPreviewDoc({
                      url: doc?.document_url || doc?.url,
                      type: doc?.document_type || doc?.type,
                    });
                    setIsPreviewModalOpen(true);
                  }}
                />
              ) : (
                <FileTextOutlined className="text-2xl text-gray-300" />
              )}
            </div>
            <div className="flex-grow">
              <Text type="secondary" className="text-xs block">
                Expiry Date
              </Text>
              <Text strong className="text-sm">
                {dayjs(doc?.expiry_date).format("MMMM D, YYYY")}
              </Text>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2">
            <Space>
              <Button
                type="default"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setPreviewDoc({
                    url: doc?.document_url,
                    type: doc?.document_type,
                  });
                  setIsPreviewModalOpen(true);
                }}
              >
                View
              </Button>
              <Button
                type="default"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => window.open(doc?.document_url, "_blank")}
              >
                Download
              </Button>
            </Space>

            {doc?.license_status !== "verified" && (
              <Space>
                <Button
                  type="primary"
                  size="small"
                  className="bg-green-600 hover:bg-green-700 border-none"
                  loading={loadingAction === `approve-${doc.document_id || doc.id}`}
                  onClick={() => handleDocumentApprove(doc.document_id || doc.id)}
                >
                  Approve
                </Button>
                <Button
                  danger
                  size="small"
                  loading={loadingAction === `reject-${doc.document_id || doc.id}`}
                  onClick={() =>
                    setRejectModalDoc({ id: doc.document_id || doc.id, type: doc.document_type || doc.type })
                  }
                >
                  Reject
                </Button>
              </Space>
            )}
          </div>
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
              defaultValue={Math?.round(driver?.performance?.average_rating || 0)}
            />
            <Text strong>{(driver?.performance?.average_rating || 0).toFixed(1)}</Text>
          </div>
        </div>

        <div className="flex justify-between mb-3">
          <div>
            <Text type="secondary">Total Trips</Text>
            <p className="text-lg font-medium">
              {driver?.performance?.total_trips || 0}
            </p>
          </div>
          <div>
            <Text type="secondary">Cancellations</Text>
            <p className="text-lg font-medium text-red-500">
              {driver?.performance?.cancellations || 0}
            </p>
            <Text type="secondary">
              {(driver?.performance?.total_trips || 0) > 0
                ? (
                    ((driver?.performance?.cancellations || 0) /
                      (driver?.performance?.total_trips || 1)) *
                    100
                  )?.toFixed(1)
                : "0.0"}
              % rate
            </Text>
          </div>
        </div>

        <div>
          <Text type="secondary">Last Active</Text>
          <p>
            {driver?.performance?.last_active
              ? dayjs(driver?.performance?.last_active)?.format(
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
              ₹{driver?.payments?.total_earnings?.toLocaleString() || 0}
            </div>
          </div>

          <div className="p-2  rounded-lg">
            <Text type="secondary">Commission Paid</Text>
            <div className="text-lg font-semibold text-gray-800">
              ₹{driver?.payments?.commission_paid?.toLocaleString() || 0}
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
                  ((driver?.credit?.balance || 0) / (driver?.credit?.limit || 1)) * 100,
                )}
                %
              </span>
            </div>
            <Progress
              percent={Math.round(
                ((driver?.credit?.balance || 0) / (driver?.credit?.limit || 1)) * 100,
              )}
              strokeColor="#1677ff"
              showInfo={false}
            />
          </div>
        </div>
      </Card>
    </div>
  );
  const rechargePlanInfo = (
    <Card
      title="Active Recharge Plan"
      bordered={false}
      className="rounded-2xl shadow-md"
      extra={
        driver?.active_subscription?.status === "active" ? (
          <Tag color="success" className="rounded-xl">Active</Tag>
        ) : (
          <Tag color="error" className="rounded-xl">No Active Plan</Tag>
        )
      }
    >
      {driver?.active_subscription ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <Text type="secondary">Plan Name</Text>
              <div className="font-semibold text-lg">{driver.active_subscription.plan_name}</div>
            </div>
            <div className="text-right">
              <Text type="secondary">Billing Cycle</Text>
              <div className="font-semibold capitalize text-lg">{driver.active_subscription.billing_cycle}</div>
            </div>
          </div>
          
          <Divider className="my-2" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text type="secondary" className="text-xs">Start Date</Text>
              <p className="font-medium m-0">
                <ClockCircleOutlined className="mr-2 text-blue-500" />
                {dayjs(driver.active_subscription.start_date).format("MMM D, YYYY")}
              </p>
            </div>
            <div>
              <Text type="secondary" className="text-xs">Expiry Date</Text>
              <p className="font-medium m-0">
                <ClockCircleOutlined className="mr-2 text-red-500" />
                {dayjs(driver.active_subscription.expiry_date).format("MMM D, YYYY")}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
             <Text type="secondary" className="text-xs block mb-1">Status Summary</Text>
             <Text className="text-sm">
               This driver is currently on the <strong>{driver.active_subscription.plan_name}</strong> plan, 
               which expires in <strong>{dayjs(driver.active_subscription.expiry_date).diff(dayjs(), "day")} days</strong>.
             </Text>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
           <StopOutlined style={{ fontSize: 32, marginBottom: 8 }} />
           <p>No active recharge plan found for this driver.</p>
        </div>
      )}
    </Card>
  );
  const activity = (
    <Card
      title="Activity Log"
      bordered={false}
      className="rounded-2xl shadow-md"
    >
      <div className="space-y-4">
        {(driver?.activity_logs || driver?.activityLogs)?.map((log: any) => (
          <div key={log?.log_id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <Text strong>{actionLabels[log?.action] || log?.action}</Text>
            </div>
            <Text type="secondary" className="block ml-5">
              {log?.details}
            </Text>
            <Text type="secondary" className="block ml-5 text-xs">
              <ClockCircleOutlined />{" "}
              {dayjs(log?.created_at).format("MMM D, YYYY, hh:mm A")}
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
        <Tooltip title="Recharge Plan">
          <SyncOutlined />
        </Tooltip>
      ),
      key: "6",
      content: rechargePlanInfo,
    },
    {
      label: (
        <Tooltip title="Activity Log">
          <LineChartOutlined />
        </Tooltip>
      ),
      key: "7",
      content: activity,
    },
  ];

  const renderStatusActions = () => {
    switch (driver?.status) {
      case "pending":
        return (
          <Space wrap className="mb-4">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={loadingAction === "active"}
              onClick={() => handleStatusUpdate("active")}
              className="bg-green-600 hover:bg-green-700 border-none"
            >
              Approve Driver
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              loading={loadingAction === "blocked"}
              onClick={() => handleStatusUpdate("blocked")}
            >
              Reject Driver
            </Button>
            <Button icon={<SendOutlined />} onClick={handleResetPassword}>
              Reset Password
            </Button>
          </Space>
        );
      case "blocked":
      case "suspended":
        return (
          <Space wrap className="mb-4">
            <Button
              icon={<CheckCircleOutlined />}
              style={{ borderColor: "green", color: "green" }}
              loading={loadingAction === "active"}
              onClick={() => handleStatusUpdate("active")}
            >
              Activate Driver
            </Button>
            <Button icon={<SendOutlined />} onClick={handleResetPassword}>
              Reset Password
            </Button>
          </Space>
        );
      default:
        return (
          <div className="mb-4 flex items-center justify-between">
            <Space wrap>
              <Button
                type="default"
                danger
                icon={<StopOutlined />}
                loading={loadingAction === "blocked"}
                onClick={() => handleStatusUpdate("blocked")}
              >
                Block
              </Button>
              <Button
                type="dashed"
                danger
                icon={<SyncOutlined />}
                loading={loadingAction === "suspended"}
                onClick={() => handleStatusUpdate("suspended")}
              >
                Suspend
              </Button>
            </Space>
            <Button
              type="default"
              icon={<SendOutlined />}
              onClick={handleResetPassword}
            >
              Reset Password
            </Button>
          </div>
        );
    }


  };
  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              size={60}
              src={driver?.profilePicUrl || driver?.profile_pic_url}
              icon={<UserOutlined />}
            />
            <div>
              <div className="text-lg font-bold">
                {driver?.full_name || "N/A"}
              </div>
              <p className="m-0 text-xs text-gray-500 font-medium">
                DRIVER ID: {driver?.driverId || driver?.driver_id || driver?.id || "N/A"}
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
      destroyOnClose={true}
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

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Driver Profile"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loadingAction === "update-profile"}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          initialValues={driver || {}}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="full_name"
              label="Full Name"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone_number"
              label="Phone Number"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="dob" label="Date of Birth">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="role" label="Role">
              <Select>
                <Option value="normal">Normal</Option>
                <Option value="premium">Premium</Option>
                <Option value="elite">Elite</Option>
              </Select>
            </Form.Item>
            <Form.Item name="gender" label="Gender">
              <Radio.Group>
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <Divider orientation={"left" as any}>Address</Divider>
          <Form.Item name={["address", "street"]} label="Street">
            <Input />
          </Form.Item>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name={["address", "city"]} label="City">
              <Input />
            </Form.Item>
            <Form.Item name={["address", "state"]} label="State">
              <Input />
            </Form.Item>
            <Form.Item name={["address", "pincode"]} label="Pincode">
              <Input />
            </Form.Item>
            <Form.Item name={["address", "country"]} label="Country">
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        title="Edit Vehicle Information"
        open={isVehicleEditModalOpen}
        onCancel={() => setIsVehicleEditModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loadingAction === "update-vehicle"}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateVehicle}
          initialValues={driver?.vehicle || {}}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="vehicle_number"
              label="Vehicle Number"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="vehicle_type" label="Vehicle Type">
              <Select>
                <Option value="hatchback">Hatchback</Option>
                <Option value="sedan">Sedan</Option>
                <Option value="suv">SUV</Option>
                <Option value="luxury">Luxury</Option>
              </Select>
            </Form.Item>
            <Form.Item name="vehicle_model" label="Vehicle Model">
              <Input />
            </Form.Item>
            <Form.Item name="fuel_type" label="Fuel Type">
              <Select>
                <Option value="petrol">Petrol</Option>
                <Option value="diesel">Diesel</Option>
                <Option value="electric">Electric</Option>
                <Option value="cng">CNG</Option>
              </Select>
            </Form.Item>
            <Form.Item name="registration_date" label="Registration Date">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="insurance_expiry" label="Insurance Expiry">
              <DatePicker className="w-full" />
            </Form.Item>
          </div>
        </Form>
      </Modal>



      {/* Document Preview Modal */}
      <Modal
        title={`${capitalize(previewDoc?.type || "")} Preview`}
        open={isPreviewModalOpen}
        footer={null}
        onCancel={() => setIsPreviewModalOpen(false)}
        width={800}
      >
        <div className="flex justify-center bg-gray-100 p-4 rounded-lg overflow-hidden min-h-[400px]">
          {previewDoc?.url?.endsWith(".pdf") ? (
            <iframe
              src={previewDoc.url}
              className="w-full h-[600px]"
              title="Document PDF"
            />
          ) : (
            <img
              src={previewDoc?.url}
              alt="Preview"
              className="max-w-full max-h-[70vh] object-contain shadow-lg"
            />
          )}
        </div>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        title={`Reject ${capitalize(rejectModalDoc?.type || "")} Document`}
        open={!!rejectModalDoc}
        onCancel={() => {
          setRejectModalDoc(null);
          setRejectionReason("");
        }}
        onOk={handleDocumentReject}
        confirmLoading={loadingAction === `reject-${rejectModalDoc?.id}`}
        okText="Confirm Reject"
        okButtonProps={{ danger: true }}
      >
        <div className="mb-4">
          <Text type="secondary">
            Please provide a reason for rejecting the {rejectModalDoc?.type} document.
            This will be visible to the driver.
          </Text>
        </div>
        <Form layout="vertical">
          <Form.Item label="Rejection Reason" required>
            <Select
              placeholder="Select a common reason"
              onChange={(value) => setRejectionReason(value)}
              className="mb-2"
            >
              <Option value="Blurry/Unreadable">Blurry/Unreadable</Option>
              <Option value="Incorrect Document Type">Incorrect Document Type</Option>
              <Option value="Expired Document">Expired Document</Option>
              <Option value="Information Mismatch">Information Mismatch</Option>
              <Option value="Other">Other</Option>
            </Select>
            <Input.TextArea
              placeholder="Or type a custom reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>

  );
};

export default DriverDetails;
