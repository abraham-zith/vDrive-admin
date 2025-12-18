import React, { useState } from "react";
import {
  Button,
  Table,
  Input,
  Select,
  Modal,
  Form,
  Switch,
  DatePicker,
} from "antd";

import type { ColumnsType } from "antd/es/table";
import { FaRegFileExcel } from "react-icons/fa";
import { MdOutlinePerson } from "react-icons/md";
import * as XLSX from "xlsx";
import TitleBar from "../components/TitleBarCommon/TitleBar";

import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

import { WhatsAppOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

type Driver = {
  id: string;
  driver_name: string;
  phone: string;
  mail: string;
  account: boolean;
  onboarding: boolean;
  pincode: string;
  dob: string;
  area: string;
  street: string;
  district: string;
  state: string;
  country: string;
};

type ExcelCell = string | number | boolean | null | undefined;
type RawExcelRow = Record<string, ExcelCell>;

const DriversReconciliation: React.FC = () => {
  const [allData, setAllData] = useState<Driver[]>([]);
  const [searchText, setSearchText] = useState("");

  const [hasAccount, setHasAccount] = useState<"all" | "yes" | "no">("all");
  const [isOnboarded, setIsOnboarded] = useState<"all" | "yes" | "no">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [form] = Form.useForm();

  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // checkbox selected keys
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // single driver id
  const [singleDriverId, setSingleDriverId] = useState<string | null>(null);

  // multiple driver ids
  const [multipleDriverIds, setMultipleDriverIds] = useState<string[]>([]);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappDrivers, setWhatsappDrivers] = useState<Driver[]>([]);

  //const WHATSAPP_MESSAGE = `Hello! You have not yet created your account. Please create your account in the app and complete the onboarding process.`;

  const columns: ColumnsType<Driver> = [
    { title: "Driver Name", dataIndex: "driver_name" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Email", dataIndex: "mail" },
    {
      title: "Account",
      dataIndex: "account",
      fixed: "right",
      width: 100,
      render: (value: boolean) => (
        <span
          style={{
            padding: "2px 6px",
            borderRadius: "6px",
            fontSize: "12px",
            border: value ? "1px solid #52c41a" : "1px solid #ff4d4f",
            backgroundColor: value ? "#52c41a" : "#ff4d4f",
            color: "#fff",
          }}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      title: "Onboarding",
      dataIndex: "onboarding",
      render: (v: boolean) => (
        <span
          style={{
            padding: "2px 6px",
            borderRadius: "6px",
            fontSize: "12px",
            border: v ? "1px solid #52c41a" : "1px solid #ff4d4f",
            backgroundColor: v ? "#52c41a" : "#ff4d4f",
            color: "#fff",
          }}
        >
          {v ? "Yes" : "No"}
        </span>
      ),
    },
    { title: "Pincode", dataIndex: "pincode" },
    { title: "DOB", dataIndex: "dob" },
    { title: "Area", dataIndex: "area" },
    { title: "Street", dataIndex: "street" },
    { title: "District", dataIndex: "district" },
    { title: "State", dataIndex: "state" },
    { title: "Country", dataIndex: "country" },
    {
      title: "Actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <>
          <EditOutlined
            style={{ marginRight: 12, cursor: "pointer" }}
            onClick={() => handleEdit(record)}
          />

          <WhatsAppOutlined
            style={{
              marginRight: 12,
              cursor: "pointer",
              color: "#25D366",
              fontSize: 16,
            }}
            onClick={() => openWhatsAppModal([record])}
          />

          <DeleteOutlined
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => {
              setSelectedDriverId(record.id);
              setIsDeleteModal(true);
            }}
          />
        </>
      ),
    },
  ];

  const tableData = allData.filter((item) => {
    //  search
    const searchMatch =
      item.driver_name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone.includes(searchText) ||
      item.mail.toLowerCase().includes(searchText.toLowerCase());

    //  account filter
    const accountMatch =
      hasAccount === "all" ||
      (hasAccount === "yes" && item.account) ||
      (hasAccount === "no" && !item.account);

    //  onboarding filter
    const onboardingMatch =
      isOnboarded === "all" ||
      (isOnboarded === "yes" && item.onboarding) ||
      (isOnboarded === "no" && !item.onboarding);
    //   const onboardingMatch =
    // isOnboarded === "all"
    //   ? true
    //   : item.account && // onboarding valid only when account = true
    //     ((isOnboarded === "yes" && item.onboarding) ||
    //       (isOnboarded === "no" && !item.onboarding));

    return searchMatch && accountMatch && onboardingMatch;
  });

  const handleSaveDriver = async () => {
    const values = await form.validateFields();

    const newDriver: Driver = {
      ...values,
      id: editingDriver ? editingDriver.id : crypto.randomUUID(),
      dob: values.dob ? values.dob.format("YYYY-MM-DD") : "", 
    };

    if (editingDriver) {
      setAllData((prev) =>
        prev.map((d) => (d.id === editingDriver.id ? newDriver : d))
      );
    } else {
      setAllData((prev) => [...prev, newDriver]);
    }

    setHasAccount("all");
    setIsOnboarded("all");

    setIsModalOpen(false);
    setEditingDriver(null);
    form.resetFields();
  };

  const handleEdit = (item: Driver) => {
    setEditingDriver(item);
    setIsModalOpen(true);
    form.setFieldsValue({
      ...item,
      dob: item.dob ? dayjs(item.dob) : null, 
    });
  };

  const handleDelete = () => {
    if (!selectedDriverId) return;

    setAllData((prev) => prev.filter((d) => d.id !== selectedDriverId));
    setIsDeleteModal(false);
    setSelectedDriverId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target?.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rawData: RawExcelRow[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });

      const parsed: Driver[] = rawData.map((row) => ({
        id: crypto.randomUUID(),
        driver_name: String(row["driver_name"] ?? row["Driver Name"] ?? ""),
        phone: String(row["phone"] ?? row["Phone"] ?? ""),
        mail: String(row["mail"] ?? row["Email"] ?? ""),
        account: false,
        onboarding: false,
        pincode: String(row["pincode"] ?? ""),
        dob: String(row["dob"] ?? ""),
        area: String(row["area"] ?? ""),
        street: String(row["street"] ?? ""),
        district: String(row["district"] ?? ""),
        state: String(row["state"] ?? ""),
        country: String(row["country"] ?? ""),
      }));

      console.log(parsed);
      setAllData(parsed);
    };

    reader.readAsBinaryString(file);
  };

  const totalDrivers = allData.length;

  const withAccountCount = allData.filter((d) => d.account === true).length;

  const onboardedCount = allData.filter((d) => d.onboarding === true).length;

  const handleExport = () => {
    const exportData = tableData.map((d) => ({
      "Driver Name": d.driver_name,
      Phone: d.phone,
      Email: d.mail,
      "Has Account": d.account ? "Yes" : "No",
      Onboarded: d.onboarding ? "Yes" : "No",
      Pincode: d.pincode,
      DOB: d.dob,
      Area: d.area,
      Street: d.street,
      District: d.district,
      State: d.state,
      Country: d.country,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData); 
    const workbook = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(workbook, worksheet, "Drivers"); 
    XLSX.writeFile(workbook, "drivers_reconciliation.xlsx"); 
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: Driver[]) => {
      setSelectedRowKeys(keys);

      if (rows.length === 1) {
        setSingleDriverId(rows[0].id);
        setMultipleDriverIds([]);
      } else if (rows.length > 1) {
        setSingleDriverId(null);
        setMultipleDriverIds(rows.map((r) => r.id));
      } else {
        setSingleDriverId(null);
        setMultipleDriverIds([]);
      }
    },
  };

  const openWhatsAppModal = (drivers: Driver[]) => {
    // only NOT-accounted drivers
    const notAccounted = drivers.filter((d) => !d.account);

    if (notAccounted.length === 0) {
      Modal.warning({
        title: "Not Allowed",
        content:
          "WhatsApp message can be sent only to drivers without an account.",
      });
      return;
    }

    setWhatsappDrivers(notAccounted);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div>
      <TitleBar
        title="Driver Reconciliation"
        description="Manage and track driver onboarding status"
        extraContent={
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 8 }}>
              <h4>Total Drivers</h4>
              <TeamOutlined style={{ color: "#7cb9f9ff", fontSize: 22 }} />
              <span>{totalDrivers}</span>
            </div>

            <div style={{ background: "#fff", borderRadius: 8 }}>
              <h4>With Account</h4>

              <UserSwitchOutlined style={{ color: "#52c41a", fontSize: 20 }} />
              <span>{withAccountCount}</span>
            </div>

            <div style={{ background: "#fff", borderRadius: 8 }}>
              <h4>Onboarded</h4>
              <UserAddOutlined style={{ color: "#fcc866ff", fontSize: 20 }} />
              <span>{onboardedCount}</span>
            </div>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Input
          placeholder="Search by name,phone, or email..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />

        <Button type="primary" icon={<FaRegFileExcel />}>
          <label style={{ cursor: "pointer" }}>
            Import Excel
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </label>
        </Button>

        <Button
          type="primary"
          icon={<MdOutlinePerson />}
          onClick={() => {
            setEditingDriver(null);
            setIsModalOpen(true);
            form.resetFields();
          }}
        >
          Add Driver
        </Button>

        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          Export All
        </Button>
        <Select
          value={hasAccount}
          onChange={setHasAccount}
          style={{ width: 150 }}
        >
          <Option value="all">All Accounts</Option>
          <Option value="yes">Has Account</Option>
          <Option value="no">No Account</Option>
        </Select>

        <Select
          value={isOnboarded}
          onChange={setIsOnboarded}
          style={{ width: 170 }}
        >
          <Option value="all">All Onboarding</Option>
          <Option value="yes">Onboarded</Option>
          <Option value="no">Not Onboarded</Option>
        </Select>
        {(singleDriverId || multipleDriverIds.length > 0) && (
          <Button
            type="primary"
            icon={<WhatsAppOutlined />}
            style={{ backgroundColor: "#25D366" }}
            onClick={() => {
              const selectedDrivers = singleDriverId
                ? allData.filter((d) => d.id === singleDriverId)
                : allData.filter((d) => multipleDriverIds.includes(d.id));

              openWhatsAppModal(selectedDrivers);
            }}
          >
            {singleDriverId ? "Send WhatsApp" : "Send Bulk WhatsApp"}
          </Button>
        )}
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        size="small"
        scroll={{ x: "max-content" }}
        bordered
        style={{
          marginTop: 20,
          border: "1px solid #c3bebeff",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(45, 44, 44, 0.1)",
        }}
      />

      <Modal
        title={editingDriver ? "Edit Driver" : "Add New Driver"}
        open={isModalOpen}
        onOk={handleSaveDriver}
        width={400}
        centered
        bodyStyle={{ padding: 12 }}
        okText={editingDriver ? "Save Changes" : "Add Driver"}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingDriver(null);
          form.resetFields();
        }}
      >
        <Form layout="vertical" form={form}>
          <div style={{ display: "flex", gap: 10 }}>
            <Form.Item
              name="driver_name"
              label="Driver Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g, john doe" />
            </Form.Item>

            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input placeholder="6732882912" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Form.Item name="mail" label="Email">
              <Input placeholder="john123@gmail.com" />
            </Form.Item>

            <Form.Item name="dob" label="Date of Birth">
              <DatePicker style={{ width: "100%" }} placeholder="Select DOB" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Form.Item name="area" label="Area">
              <Input placeholder="velachery" />
            </Form.Item>

            <Form.Item name="street" label="Street">
              <Input placeholder="123 Main St" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Form.Item name="district" label="District">
              <Input placeholder="Central District" />
            </Form.Item>

            <Form.Item
              name="pincode"
              label="Pincode"
              rules={[
                {
                  pattern: /^[0-9]{6}$/,
                  message: "Pincode must be exactly 6 digits",
                },
              ]}
            >
              <Input maxLength={6} placeholder="101001" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Form.Item name="state" label="State">
              <Input placeholder="Tamilnadu" />
            </Form.Item>

            <Form.Item name="country" label="Country">
              <Input placeholder="India" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 100 }}>
            {editingDriver && (
              <>
                <Form.Item
                  name="account"
                  label="Has Account"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>

                <Form.Item
                  name="onboarding"
                  label="Onboarded"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </>
            )}
          </div>
        </Form>
      </Modal>

      <Modal
        title="Delete this driver?"
        open={isDeleteModal}
        onCancel={() => {
          setIsDeleteModal(false);
          setSelectedDriverId(null);
        }}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          This will permanently delete this driver. This action cannot be
          undone.
        </p>
      </Modal>
      
      <Modal
        title="Send WhatsApp Message"
        open={isWhatsAppModalOpen}
        onCancel={() => setIsWhatsAppModalOpen(false)}
        onOk={() => {
          console.log("Drivers:", whatsappDrivers);
          setIsWhatsAppModalOpen(false);
        }}
        okText="Send Message"
      >
        <div style={{display: 'flex', gap: 6, marginBottom: 8}}>
        {whatsappDrivers.slice(0, 3).map((d, index, arr) => (
          <span key={d.id}>
            {d.driver_name}
            {index < arr.length - 1 && ", "}
          </span>
        ))}

        {whatsappDrivers.length > 3 && (
          <p style={{ margin: 0, color: "#888", fontStyle: "italic" }}>
            +{whatsappDrivers.length - 3} others
          </p>
        )}
        </div>

        <Input.TextArea
          rows={4}
          style={{ marginBottom: 12, width: "100%", height: "60px" }}
        />
      </Modal>
    </div>
  );
};

export default DriversReconciliation;
