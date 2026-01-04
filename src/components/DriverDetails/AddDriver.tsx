import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Row,
  Col,
  message,
  InputNumber,
  Divider,
  Space,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  LeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";
import type { Driver } from "../../pages/Drivers";
import axiosIns from "../../api/axios";
import axios from "axios";


const { Step } = Steps;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (driver: Driver) => void;
  initial?: Partial<Driver>;
  mode?: "add" | "edit";
};

export default function AddDriverModal({
  open,
  onClose,
  onSubmit,
  initial,
  mode = "add",
}: Props) {
  const [current, setCurrent] = useState<number>(0);
  const [form] = Form.useForm();
  const [profileFile, setProfileFile] = useState<UploadFile | null>(null);
  const [rcFile, setRcFile] = useState<UploadFile | null>(null);
  const [licenseFile, setLicenseFile] = useState<UploadFile | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<UploadFile | null>(null);
  const [panFile, setPanFile] = useState<UploadFile | null>(null);

  // Helper to create UploadFile from URL
  const createUploadFile = (url: string, name: string): UploadFile => ({
    uid: Math.random().toString(36).substring(7),
    name: name,
    status: "done",
    url: url,
    response: { url }, // For fileUrlOrDefault to work
  });

  // Populate form and files when opening in edit mode
  useEffect(() => {
    if (open && initial && mode === "edit") {
      // 1. Set simple fields
      const formValues: any = {
        ...initial,
        dob: initial.dob ? dayjs(initial.dob) : undefined,
        vehicle: initial.vehicle
          ? {
              ...initial.vehicle,
              registrationDate: initial.vehicle.registrationDate
                ? dayjs(initial.vehicle.registrationDate)
                : undefined,
              insuranceExpiry: initial.vehicle.insuranceExpiry
                ? dayjs(initial.vehicle.insuranceExpiry)
                : undefined,
            }
          : undefined,
        kyc: initial.kyc
          ? {
              ...initial.kyc,
              verifiedAt: initial.kyc.verifiedAt
                ? dayjs(initial.kyc.verifiedAt)
                : undefined,
            }
          : undefined,
        licenseExpiry: undefined, // Will extract from documents
        licenseNumber: undefined,
        aadhaarNumber: undefined,
        panNumber: undefined,
      };

      // 2. Extract document data
      if (initial.documents) {
        const licenseDoc = initial.documents.find(
          (d) => d.documentType === "license"
        );
        const aadhaarDoc = initial.documents.find(
          (d) => d.documentType === "aadhaar"
        );
        const panDoc = initial.documents.find((d) => d.documentType === "pan");

        if (licenseDoc) {
          formValues.licenseNumber = licenseDoc.documentNumber;
          formValues.licenseExpiry = licenseDoc.expiryDate
            ? dayjs(licenseDoc.expiryDate)
            : undefined;
          if (licenseDoc.documentUrl) {
            setLicenseFile(
              createUploadFile(licenseDoc.documentUrl, "License.pdf")
            );
          }
        }

        if (aadhaarDoc) {
          formValues.aadhaarNumber = aadhaarDoc.documentNumber;
          if (aadhaarDoc.documentUrl) {
            setAadhaarFile(
              createUploadFile(aadhaarDoc.documentUrl, "Aadhaar.pdf")
            );
          }
        }

        if (panDoc) {
          formValues.panNumber = panDoc.documentNumber;
          if (panDoc.documentUrl) {
            setPanFile(createUploadFile(panDoc.documentUrl, "PAN.pdf"));
          }
        }
      }

      // 3. Set other files
      if (initial.profilePicUrl) {
        setProfileFile(
          createUploadFile(initial.profilePicUrl, "Profile.jpg")
        );
      }

      if (initial.vehicle?.rcDocumentUrl) {
        setRcFile(
          createUploadFile(initial.vehicle.rcDocumentUrl, "RC.pdf")
        );
      }

      form.setFieldsValue(formValues);
    }
  }, [open, initial, mode, form]);
  const steps = [
    { title: "Basic", description: "Personal information" },
    { title: "Address & KYC", description: "Address and KYC data" },
    { title: "Vehicle", description: "Vehicle details & RC" },
    { title: "Credit & Payments", description: "Credit and financials" },
    { title: "Docs & Activity", description: "Documents and logs" },
    { title: "Summary", description: "Review & submit" },
  ];

  const stepValidationFields: (any[] | undefined)[] = [
    ["fullName", "phoneNumber", "dob", "gender", "status", "role", "email", "password"],
    [
      ["address", "street"],
      ["address", "city"],
      ["address", "state"],
      ["address", "country"],
      ["address", "pincode"],
      ["kyc", "overallStatus"],
      ["kyc", "verifiedAt"],
    ],
    [
      ["vehicle", "vehicleNumber"],
      ["vehicle", "vehicleModel"],
      ["vehicle", "vehicleType"],
      ["vehicle", "fuelType"],
      ["vehicle", "registrationDate"],
      ["vehicle", "insuranceExpiry"],
    ],
    [
      ["credit", "limit"],
      ["credit", "balance"],
      ["credit", "totalRecharged"],
      ["payments", "totalEarnings"],
      ["payments", "pendingPayout"],
      ["payments", "commissionPaid"],
    ],
    ["licenseNumber", "aadhaarNumber", "panNumber"],
    undefined,
  ];

  const next = async () => {
    try {
      const keys = stepValidationFields[current] ?? [];
      if (keys.length) {
        await form.validateFields(keys);
      }

      // Custom validation for files
      if (current === 2 && !rcFile) {
        message.error("Please upload RC Document");
        return;
      }

      if (current === 4) {
        if (!licenseFile) {
          message.error("Please upload License Document");
          return;
        }
        if (!aadhaarFile) {
          message.error("Please upload Aadhaar Document");
          return;
        }
        if (!panFile) {
          message.error("Please upload PAN Document");
          return;
        }
      }

      setCurrent((c) => Math.min(c + 1, steps.length - 1));
    } catch (err) {
    }
  };

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const customUpload = async ({ file, onSuccess, onError, onProgress }: any): Promise<any> => {
    try {
      // 1. Get presigned URL from the backend
      const presignedResponse = await axiosIns.post("/api/generate-presigned-url", {
        key: file.name,
        contentType: file.type,
      });

      // Assuming the response structure is { data: { uploadUrl: string, fileUrl: string } }
      // Adjust based on your actual backend response
      const { presignedUrl, blobUrl } = presignedResponse.data?.data?.data|| {};

      if (!presignedUrl) {
        throw new Error("Failed to get upload URL from server");
      }

      // 2. Upload the file directly to S3/R2 using the presigned URL
      // Use plain axios here to avoid interceptors that might add Authorization headers
      // which would invalidate the presigned URL signature.
      await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          onProgress({ percent });
        },
      });

      // 3. Prepare the response in a format the rest of the component expects
      // The component expects the permanent URL to be in response.data.url or response.data.file
      const successResponse = { data: { url: blobUrl } };
      
      onSuccess(successResponse);
      message.success(`${file.name} uploaded successfully`);
      
      return successResponse;
    } catch (err: any) {
      console.error("Upload error details:", err);
      onError(err);
      message.error(`${file.name} upload failed: ${err.response?.data?.message || err.message}`);
      throw err;
    }
  };



  const fileUrlOrDefault = (
    file: UploadFile | undefined | null,
    fallback?: string
  ) => {
    if (!file) return fallback ?? "";
    // Check for URL in response.data.url (from upload endpoint)
    if ((file as any).response?.data?.url) return (file as any).response.data.url;
    // Check for URL in response.data.file
    if ((file as any).response?.data?.file) return (file as any).response.data.file;
    // Check for direct URL in response
    if ((file as any).response?.url) return (file as any).response.url;
    // Check for URL property
    if ((file as any).url) return (file as any).url as string;
    // Fallback to blob URL for preview
    if ((file as any).originFileObj)
      return URL.createObjectURL((file as any).originFileObj as Blob);
    return fallback ?? "";
  };

  const mapFormToDriver = (values: any): Driver => {
    const now = new Date().toISOString();

    const documents = [
      {
        documentId: `doc-lic-${Math.random().toString(36).slice(2, 8)}`,
        documentType: "license",
        documentNumber: values.licenseNumber ?? "",
        documentUrl: fileUrlOrDefault(licenseFile) ?? "",
        licenseStatus: "pending",
        expiryDate: values.licenseExpiry
          ? dayjs(values.licenseExpiry).toISOString()
          : "",
      },
      {
        documentId: `doc-aad-${Math.random().toString(36).slice(2, 8)}`,
        documentType: "aadhaar",
        documentNumber: values.aadhaarNumber ?? "",
        documentUrl: fileUrlOrDefault(aadhaarFile) ?? "",
        licenseStatus: "pending",
        expiryDate: "",
      },
      {
        documentId: `doc-pan-${Math.random().toString(36).slice(2, 8)}`,
        documentType: "pan",
        documentNumber: values.panNumber ?? "",
        documentUrl: fileUrlOrDefault(panFile) ?? "",
        licenseStatus: "pending",
        expiryDate: "",
      },
    ];

    const vehicle =
      values.vehicle &&
      (values.vehicle.vehicleNumber || values.vehicle.vehicleModel)
        ? {
            vehicleId:
              values.vehicle.vehicleId ??
              `v-${Math.random().toString(36).slice(2, 8)}`,
            vehicleNumber: values.vehicle.vehicleNumber ?? "",
            vehicleModel: values.vehicle.vehicleModel ?? "",
            vehicleType: values.vehicle.vehicleType ?? "",
            fuelType: values.vehicle.fuelType ?? "",
            registrationDate: values.vehicle.registrationDate
              ? dayjs(values.vehicle.registrationDate).toISOString()
              : "",
            insuranceExpiry: values.vehicle.insuranceExpiry
              ? dayjs(values.vehicle.insuranceExpiry).toISOString()
              : "",
            rcDocumentUrl: fileUrlOrDefault(rcFile) ?? "",
            status: !!values.vehicle.status,
          }
        : null;

    const driver: Driver = {
      driverId:
        values.driverId ?? `drv-${Math.random().toString(36).slice(2, 9)}`,
      fullName: values.fullName ?? "",
      phoneNumber: values.phoneNumber ?? "",
      email: values.email ?? "",
      profilePicUrl: fileUrlOrDefault(profileFile) ?? "",
      dob: values.dob ? dayjs(values.dob).toISOString() : values.dob ?? "",
      gender: values.gender ?? "male",
      address: {
        street: values.address?.street ?? "",
        city: values.address?.city ?? "",
        state: values.address?.state ?? "",
        country: values.address?.country ?? "",
        pincode: values.address?.pincode ?? "",
      },
      role: (values.role as any) ?? "normal",
      status: (values.status as any) ?? "pending",
      rating: Number(values.rating ?? 0),
      totalTrips: Number(values.totalTrips ?? 0),
      availability: {
        online: !!values.availability?.online,
        lastActive: values.availability?.lastActive
          ? dayjs(values.availability.lastActive).toISOString()
          : null,
      },
      kyc: {
        overallStatus: values.kyc?.overallStatus ?? "pending",
        verifiedAt: values.kyc?.verifiedAt
          ? dayjs(values.kyc.verifiedAt).toISOString()
          : null,
      },
      credit: {
        limit: Number(values.credit?.limit ?? 0),
        balance: Number(values.credit?.balance ?? 0),
        totalRecharged: Number(values.credit?.totalRecharged ?? 0),
        totalUsed: Number(values.credit?.totalUsed ?? 0),
        lastRechargeAt: values.credit?.lastRechargeAt
          ? dayjs(values.credit.lastRechargeAt).toISOString()
          : null,
      },
      recharges: (values.recharges ?? []).map((r: any) => ({
        transactionId:
          r.transactionId ?? `txn-${Math.random().toString(36).slice(2, 8)}`,
        amount: Number(r.amount ?? 0),
        paymentMethod: r.paymentMethod ?? "",
        reference: r.reference ?? "",
        status: r.status ?? "pending",
        createdAt: r.createdAt ? dayjs(r.createdAt).toISOString() : now,
      })),
      creditUsage: (values.creditUsage ?? []).map((u: any) => ({
        usageId: u.usageId ?? `use-${Math.random().toString(36).slice(2, 8)}`,
        tripId: u.tripId ?? "",
        amount: Number(u.amount ?? 0),
        type: u.type ?? "",
        description: u.description ?? "",
        createdAt: u.createdAt ? dayjs(u.createdAt).toISOString() : now,
      })),
      createdAt: initial?.createdAt ?? now,
      updatedAt: new Date().toISOString(),
      vehicle,
      documents,
      performance: {
        averageRating: Number(values.performance?.averageRating ?? 0),
        totalTrips: Number(values.performance?.totalTrips ?? 0),
        cancellations: Number(values.performance?.cancellations ?? 0),
        lastActive: values.performance?.lastActive
          ? dayjs(values.performance.lastActive).toISOString()
          : null,
      },
      payments: {
        totalEarnings: Number(values.payments?.totalEarnings ?? 0),
        pendingPayout: Number(values.payments?.pendingPayout ?? 0),
        commissionPaid: Number(values.payments?.commissionPaid ?? 0),
      },
      activityLogs:
        (values.activityLogs ?? []).map((a: any) => ({
          logId: a.logId ?? `log-${Math.random().toString(36).slice(2, 8)}`,
          action: a.action ?? "",
          details: a.details ?? "",
          createdAt: a.createdAt ? dayjs(a.createdAt).toISOString() : now,
        })) ?? [],
    };

    return driver;
  };

  const handleFinish = async (values: any) => {
    console.log("Form values received:", values);
    try {
      const driver = mapFormToDriver(values);
      console.log("Mapped driver object:", driver);
      
      // Call the API endpoint to create or update the driver
      let response;
      const payload = { ...driver, password: values.password };

      if (mode === "edit" && initial?.driverId) {
        console.log("Updating driver:", initial.driverId);
        // Only send password if provided during edit
        const updatePayload = values.password ? payload : driver;
        response = await axiosIns.put(`/api/drivers/${initial.driverId}`, updatePayload);
        message.success("Driver updated successfully");
      } else {
        console.log("Creating new driver");
        response = await axiosIns.post("/api/drivers", payload);
        message.success("Driver created successfully");
      }
      
      console.log("Driver saved successfully:", response.data);
      
      // Call the parent's onSubmit callback with the response data
      onSubmit(response.data?.data || driver);
      
      // Reset form and state
      form.resetFields();
      setProfileFile(null);
      setRcFile(null);
      setLicenseFile(null);
      setAadhaarFile(null);
      setPanFile(null);
      setCurrent(0);
      onClose();
    } catch (err: any) {
      console.error("Failed to save driver:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to save driver";
      message.error(errorMessage);
    }
  };

  const StepSidePanel = ({ children }: { children?: ReactNode }) => (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      {children}
    </div>
  );

  const StepLayout = ({
    leftChildren,
    rightChildren,
  }: {
    leftChildren: ReactNode;
    rightChildren?: ReactNode;
  }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 grid grid-cols-2 gap-4">{leftChildren}</div>
        <div className="col-span-1">{rightChildren}</div>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        setCurrent(0);
        setProfileFile(null);
        setRcFile(null);
        setLicenseFile(null);
        setAadhaarFile(null);
        setPanFile(null);
        onClose();
      }}
      footer={null}
      width={1200}
      title={<div className="text-lg font-semibold">{mode === 'edit' ? 'Edit Driver' : 'Add / Create Driver'}</div>}
      centered
      maskClosable={false}
      bodyStyle={{ maxHeight: "82vh", overflowY: "auto" }}
      className="ant-modal--add-driver"
    >
      <Steps current={current} size="small" style={{ marginBottom: 20 }}>
        {steps.map((s) => (
          <Step key={s.title} title={s.title} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          role: "normal",
          status: "pending",
          credit: { limit: 0, balance: 0, totalRecharged: 0, totalUsed: 0 },
          payments: { totalEarnings: 0, pendingPayout: 0, commissionPaid: 0 },
          performance: { averageRating: 0, totalTrips: 0, cancellations: 0 },
          availability: { online: false },
        }}
      >
        {current === 0 && (
          <StepLayout
            leftChildren={
              <>
                <Form.Item
                  label="Full name"
                  name="fullName"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Full name" />
                </Form.Item>

                <Form.Item
                  label="Phone number"
                  name="phoneNumber"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="+91-9876543210" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="email@example.com" />
                </Form.Item>

                <Form.Item
                  label={mode === "edit" ? "Password (leave blank to keep current)" : "Password"}
                  name="password"
                  rules={[{ required: mode === "add", message: "Please enter a password" }]}
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>

                <Form.Item
                  label="Date of birth"
                  name="dob"
                  rules={[{ required: true }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Pending", value: "pending" },
                      { label: "Suspended", value: "suspended" },
                      { label: "Blocked", value: "blocked" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { label: "Normal", value: "normal" },
                      { label: "Premium", value: "premium" },
                      { label: "Elite", value: "elite" },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Driver ID" name="driverId">
                  <Input placeholder="Optional (auto-generated if empty)" />
                </Form.Item>
              </>
            }
            rightChildren={
              <StepSidePanel>
                <div className="text-sm font-medium">Profile photo</div>

                <div onClick={() => console.log("Upload area clicked")}>
                  <Upload
                    listType="picture-card"
                    action="" 
                    customRequest={(options) => {
                      customUpload(options).then((responseData) => {
                        // Manually update file state with response data after upload
                        const file = options.file as any;
                        const fileWithResponse = {
                          uid: file.uid || Date.now().toString(),
                          name: file.name || 'file',
                          status: 'done' as const,
                          response: responseData, // Use the returned response data
                        } as UploadFile;
                        setProfileFile(fileWithResponse);
                      });
                    }}
                    fileList={profileFile ? [profileFile] : []}
                    onRemove={() => {
                      setProfileFile(null);
                    }}
                    showUploadList={true}
                    maxCount={1}
                  >
                    {!profileFile && (
                      <div className="flex flex-col items-center justify-center">
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                </div>

                <Divider />
                <div>
                  <div className="text-sm text-gray-600">Quick tips</div>
                  <ul className="text-xs text-gray-500 list-disc ml-5">
                    <li>Use a clear headshot for profile</li>
                    <li>Phone number with country code</li>
                  </ul>
                </div>
              </StepSidePanel>
            }
          />
        )}

        {current === 1 && (
          <StepLayout
            leftChildren={
              <>
                <Form.Item
                  name={["address", "street"]}
                  label="Street"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["address", "city"]}
                  label="City"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["address", "state"]}
                  label="State"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["address", "country"]}
                  label="Country"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["address", "pincode"]}
                  label="Pincode"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["kyc", "overallStatus"]}
                  label="KYC status"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { label: "verified", value: "verified" },
                      { label: "pending", value: "pending" },
                      { label: "rejected", value: "rejected" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name={["kyc", "verifiedAt"]}
                  label="KYC verified at"
                  rules={[{ required: true }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>
              </>
            }
            rightChildren={
              <StepSidePanel>
                <div className="text-sm font-medium">KYC documents</div>
                <div className="text-xs text-gray-500">
                  Upload your Driving License, Aadhaar Card, and PAN Card in the Docs & Activity step.
                </div>
              </StepSidePanel>
            }
          />
        )}

        {current === 2 && (
          <StepLayout
            leftChildren={
              <>
                <Form.Item
                  name={["vehicle", "vehicleNumber"]}
                  label="Vehicle number"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="TN09AB1234" />
                </Form.Item>

                <Form.Item
                  name={["vehicle", "vehicleModel"]}
                  label="Model"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["vehicle", "vehicleType"]}
                  label="Type"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { label: "Sedan", value: "Sedan" },
                      { label: "SUV", value: "SUV" },
                      { label: "Hatchback", value: "Hatchback" },
                      { label: "Bike", value: "Bike" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name={["vehicle", "fuelType"]}
                  label="Fuel type"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { label: "Petrol", value: "Petrol" },
                      { label: "Diesel", value: "Diesel" },
                      { label: "Electric", value: "Electric" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name={["vehicle", "registrationDate"]}
                  label="Registration date"
                  rules={[{ required: true }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item
                  name={["vehicle", "insuranceExpiry"]}
                  label="Insurance expiry"
                  rules={[{ required: true }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>
              </>
            }
            rightChildren={
              <StepSidePanel>
                <div className="text-sm font-medium">RC / Vehicle Docs</div>
                <Upload
                  customRequest={(options) => {
                    customUpload(options).then((responseData) => {
                      const file = options.file as any;
                      const fileWithResponse = {
                        uid: file.uid || Date.now().toString(),
                        name: file.name || "file",
                        status: "done" as const,
                        response: responseData,
                      } as UploadFile;
                      setRcFile(fileWithResponse);
                    });
                  }}
                  fileList={rcFile ? [rcFile] : []}
                  onRemove={() => setRcFile(null)}
                >
                  <Button icon={<UploadOutlined />}>Upload RC</Button>
                </Upload>
                <div className="text-xs text-gray-500">
                  Upload RC as PDF or image (max 5MB).
                </div>
              </StepSidePanel>
            }
          />
        )}

        {current === 3 && (
          <div className="space-y-6">
            <Row gutter={24}>
              {/* Credit Management */}
              <Col span={12}>
                <div className="border p-4 rounded-lg bg-white h-full">
                  <h3 className="font-medium mb-4 text-gray-700 border-b pb-2">
                    Credit Management
                  </h3>
                  <div className="space-y-4">
                    <Form.Item
                      name={["credit", "limit"]}
                      label="Credit Limit"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        className="w-full"
                        min={0}
                        prefix="₹"
                        placeholder="0"
                      />
                    </Form.Item>

                    <Form.Item
                      name={["credit", "balance"]}
                      label="Current Balance"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        className="w-full"
                        min={0}
                        prefix="₹"
                        placeholder="0"
                      />
                    </Form.Item>

                    <Form.Item
                      name={["credit", "totalRecharged"]}
                      label="Total Recharged"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        className="w-full"
                        min={0}
                        prefix="₹"
                        placeholder="0"
                      />
                    </Form.Item>
                  </div>
                </div>
              </Col>

              {/* Payment Statistics */}
              <Col span={12}>
                <div className="border p-4 rounded-lg bg-white h-full">
                  <h3 className="font-medium mb-4 text-gray-700 border-b pb-2">
                    Payment Statistics
                  </h3>
                  <div className="space-y-4">
                    <Form.Item
                      name={["payments", "totalEarnings"]}
                      label="Total Earnings"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        className="w-full"
                        min={0}
                        prefix="₹"
                        placeholder="0"
                      />
                    </Form.Item>

                    <Form.Item
                      name={["payments", "pendingPayout"]}
                      label="Pending Payout"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        className="w-full"
                        min={0}
                        prefix="₹"
                        placeholder="0"
                      />
                    </Form.Item>

                    <Form.Item
                      name={["payments", "commissionPaid"]}
                      label="Commission Paid"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        className="w-full"
                        min={0}
                        prefix="₹"
                        placeholder="0"
                      />
                    </Form.Item>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {current === 4 && (
          <div className="space-y-6">
            <div className="border p-4 rounded-lg bg-gray-50">
              <h3 className="font-medium mb-4">Driving License</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="licenseNumber"
                    label="License Number"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="DL Number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="licenseExpiry"
                    label="Expiry Date"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="License Document">
                    <Upload
                      customRequest={(options) => {
                        customUpload(options).then((responseData) => {
                          const file = options.file as any;
                          const fileWithResponse = {
                            uid: file.uid || Date.now().toString(),
                            name: file.name || "file",
                            status: "done" as const,
                            response: responseData,
                          } as UploadFile;
                          setLicenseFile(fileWithResponse);
                        });
                      }}
                      fileList={licenseFile ? [licenseFile] : []}
                      onRemove={() => setLicenseFile(null)}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Upload License</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="border p-4 rounded-lg bg-gray-50">
              <h3 className="font-medium mb-4">Aadhaar Card</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="aadhaarNumber"
                    label="Aadhaar Number"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Aadhaar Number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Aadhaar Document">
                    <Upload
                      customRequest={(options) => {
                        customUpload(options).then((responseData) => {
                          const file = options.file as any;
                          const fileWithResponse = {
                            uid: file.uid || Date.now().toString(),
                            name: file.name || "file",
                            status: "done" as const,
                            response: responseData,
                          } as UploadFile;
                          setAadhaarFile(fileWithResponse);
                        });
                      }}
                      fileList={aadhaarFile ? [aadhaarFile] : []}
                      onRemove={() => setAadhaarFile(null)}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Upload Aadhaar</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="border p-4 rounded-lg bg-gray-50">
              <h3 className="font-medium mb-4">PAN Card</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="panNumber"
                    label="PAN Number"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="PAN Number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="PAN Document">
                    <Upload
                      customRequest={(options) => {
                        customUpload(options).then((responseData) => {
                          const file = options.file as any;
                          const fileWithResponse = {
                            uid: file.uid || Date.now().toString(),
                            name: file.name || "file",
                            status: "done" as const,
                            response: responseData,
                          } as UploadFile;
                          setPanFile(fileWithResponse);
                        });
                      }}
                      fileList={panFile ? [panFile] : []}
                      onRemove={() => setPanFile(null)}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Upload PAN</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>
        )}

        {current === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <Form.Item shouldUpdate>
                  {() => {
                    const vals = form.getFieldsValue(true);
                    return (
                      <div className="space-y-3">
                        <div>
                          <strong>Name:</strong> {vals.fullName}
                        </div>
                        <div>
                          <strong>Phone:</strong> {vals.phoneNumber}
                        </div>
                        <div>
                          <strong>Email:</strong> {vals.email}
                        </div>
                        <div>
                          <strong>Address:</strong> {vals?.address?.street},{" "}
                          {vals?.address?.city}, {vals?.address?.state} -{" "}
                          {vals?.address?.pincode}
                        </div>
                        <div>
                          <strong>Vehicle:</strong>{" "}
                          {vals?.vehicle?.vehicleNumber} (
                          {vals?.vehicle?.vehicleModel})
                        </div>
                        <div>
                          <strong>Credit limit:</strong> {vals?.credit?.limit}
                        </div>
                        <div>
                          <strong>Documents count:</strong>{" "}
                          {(vals?.documents || []).length}
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>
              </div>

              <div className="col-span-1">
                <StepSidePanel>
                  <div className="text-sm font-medium">Preview</div>
                  <div className="mt-3">
                    {profileFile ? (
                      <img
                        src={fileUrlOrDefault(profileFile)}
                        alt="profile preview"
                        style={{ width: "100%", borderRadius: 8 }}
                      />
                    ) : (
                      <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Make sure everything looks correct before you submit.
                  </div>
                </StepSidePanel>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div>
            {current > 0 && (
              <Button onClick={prev} icon={<LeftOutlined />}>
                Back
              </Button>
            )}
          </div>

          <Space>
            {current < steps.length - 1 && (
              <Button type="primary" onClick={next} icon={<ArrowRightOutlined />}>
                Next
              </Button>
            )}

            {current === steps.length - 1 && (
              <Button 
                type="primary" 
                onClick={() => {
                  const allValues = form.getFieldsValue(true);
                  console.log("All form values:", allValues);
                  handleFinish(allValues);
                }}
              >
                {mode === 'edit' ? 'Update Driver' : 'Create Driver'}
              </Button>
            )}

            <Button
              onClick={() => {
                form.resetFields();
                setCurrent(0);
                setProfileFile(null);
                setRcFile(null);
                // setDocFiles([]);
                onClose();
              }}
            >
              Cancel
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
