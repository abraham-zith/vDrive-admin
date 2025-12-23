import { useEffect, useState } from "react";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import { Button, Input, Table, Card, Modal, Form, Select, Tag } from "antd";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  ExclamationCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import {
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import type { ColumnType } from "antd/es/table";

import { format, toZonedTime } from "date-fns-tz";

export interface Location {
  id: string;
  area_name: string;
  pincode: string;
  district: string;
  state: string;
  country: string;
  type: string;
  created_at: string;
  updated_at: string;
  checked?: boolean;
}

const DATA: Location[] = [
  {
    id: "A001",
    area_name: "Muthialpet",
    pincode: "605003",
    district: "Puducherry",
    state: "Puducherry",
    country: "India",
    type: "manual",
    created_at: "2025-01-10T10:15:30Z",
    updated_at: "2025-01-10T10:15:30Z",
  },
  {
    id: "A002",
    area_name: "White Town",
    pincode: "605001",
    district: "Puducherry",
    state: "Puducherry",
    country: "India",
    type: "manual",
    created_at: "2025-01-11T09:20:00Z",
    updated_at: "2025-01-11T09:20:00Z",
  },
  {
    id: "A003",
    area_name: "Lawspet",
    pincode: "605008",
    district: "Puducherry",
    state: "Puducherry",
    country: "India",
    type: "manual",
    created_at: "2025-01-12T11:45:10Z",
    updated_at: "2025-01-12T11:45:10Z",
  },
  {
    id: "A004",
    area_name: "Reddiarpalayam",
    pincode: "605010",
    district: "chennai",
    state: "TamilNadu",
    country: "India",
    type: "manual",
    created_at: "2025-01-13T14:30:00Z",
    updated_at: "2025-01-13T14:30:00Z",
  },
  {
    id: "A005",
    area_name: "Ariyankuppam",
    pincode: "605007",
    district: "villupuram",
    state: "TamilNadu",
    country: "India",
    type: "manual",
    created_at: "2025-01-14T16:10:45Z",
    updated_at: "2025-01-14T16:10:45Z",
  },
  {
    id: "A006",
    area_name: "Oulgaret",
    pincode: "605009",
    district: "Puducherry",
    state: "Puducherry",
    country: "India",
    type: "manual",
    created_at: "2025-01-15T08:55:00Z",
    updated_at: "2025-01-15T08:55:00Z",
  },
  {
    id: "A007",
    area_name: "Villiyanur",
    pincode: "605110",
    district: "cuddalore",
    state: "TamilNadu",
    country: "India",
    type: "manual",
    created_at: "2025-01-16T12:40:20Z",
    updated_at: "2025-01-16T12:40:20Z",
  },
  {
    id: "A008",
    area_name: "Kalapet",
    pincode: "605014",
    district: "Puducherry",
    state: "Puducherry",
    country: "India",
    type: "manual",
    created_at: "2025-01-17T15:05:00Z",
    updated_at: "2025-01-17T15:05:00Z",
  },
  {
    id: "A009",
    area_name: "Thattanchavady",
    pincode: "605009",
    district: "selam",
    state: "TamilNadu",
    country: "India",
    type: "manual",
    created_at: "2025-01-18T10:00:00Z",
    updated_at: "2025-01-18T10:00:00Z",
  },
  {
    id: "A010",
    area_name: "Mudaliarpet",
    pincode: "605004",
    district: "bihar",
    state: "AndhraPradesh",
    country: "India",
    type: "manual",
    created_at: "2025-01-19T18:25:35Z",
    updated_at: "2025-01-19T18:25:35Z",
  },
];

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "India"];
const searchCat = [
  "puducherry",
  "TamilNadu",
  "AndhraPradesh",
  "Arunachal Pradesh",
];

export const ManageLocation = () => {
  const [locationdetails, setLocationDetails] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [selectedRow, setSelectedRow] = useState<Location | null>(null);
  const [editingRecord, setEditingRecord] = useState<Location | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    setLocationDetails(DATA?.map((item) => ({ ...item, checked: false })));
  }, []);

  const handleEdit = (rowData: Location) => {
    setIsModalOpen(true);
    setEditingRecord(rowData);
    form.setFieldsValue({
      area_name: rowData?.area_name,
      pincode: rowData?.pincode,
      district: rowData?.district,
      state: rowData?.state,
      country: rowData?.country,
    });
  };

  const handleDelete = () => {
    if (!selectedRow) return;

    setLocationDetails((prev) =>
      prev.filter((item) => item?.id !== selectedRow?.id)
    );

    setSelectedRow(null);
    setIsDeleteModal(false);
  };

  const handleAddAndEdit = (values: Omit<Location, "id">) => {
    const now = new Date().toISOString();
    if (editingRecord) {
      setLocationDetails((prev) =>
        prev.map((item) =>
          item.id === editingRecord.id
            ? {
                ...item,
                ...values,
                updated_at: now,
              }
            : item
        )
      );
    } else {
      const newData: Location = {
        id: `A${Date.now()}`,
        ...values,
        type: "manual",
        created_at: now,
        updated_at: now,
      };

      setLocationDetails((prev) => [newData, ...prev]);
    }

    form.resetFields();
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const filteredData = locationdetails?.filter((item) => {
    const mathSearch = Object.values(item).some((data) =>
      String(data)?.toLowerCase()?.includes(searchText.toLowerCase())
    );
    const matcheState = selectedState
      ? item?.state.toLowerCase() === selectedState.toLowerCase()
      : true;

    return mathSearch && matcheState;
  });

  const handleExportExcel = () => {
    const exportData = filteredData?.map((item) => ({
      ID: item?.id,
      Area: item?.area_name,
      Pincode: item?.pincode,
      District: item?.district,
      State: item?.state,
      Country: item?.country,
      Type: item?.type,
      "Created At": format(
        toZonedTime(new Date(item?.created_at), "Asia/Kolkata"),
        "dd MMM, HH:mm"
      ),
      "Updated At": format(
        toZonedTime(new Date(item?.updated_at), "Asia/Kolkata"),
        "dd MMM, HH:mm"
      ),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, `Manage_Locations_${Date.now()}.xlsx`);
  };

  const columns: ColumnType<Location>[] = [
    {
      title: "Area",
      dataIndex: "area_name",
    },
    {
      title: "Pincode",
      dataIndex: "pincode",
    },
    {
      title: "District",
      dataIndex: "district",
    },
    {
      title: "State",
      dataIndex: "state",
    },
    {
      title: "Type",
      dataIndex: "type",

      render: (type: string) => (
        <Tag
          style={{
            border: "1px solid #ff9f43",
            color: "#ff9f43", // light orange text
            background: "#fff7ee",
            boxShadow: "0 1px 3px rgba(31, 58, 138, 0.25)",
            fontSize: "9px",
            padding: "0 8px",
            lineHeight: "20px",
            borderRadius: "6px",
          }}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record: Location) => (
        <div style={{ display: "flex", gap: "20px" }}>
          <EditOutlined onClick={() => handleEdit(record)} />

          <DeleteOutlined
            onClick={() => {
              setSelectedRow(record);
              setIsDeleteModal(true);
            }}
            style={{ color: "red", cursor: "pointer" }}
          />
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <TitleBar
        title="Manage Locations"
        description="Add and manage custom locations for your app"
        extraContent={
          <div className="flex items-center gap-2">
            <div>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search Location....."
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div>
              <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
                Export CSV
              </Button>
            </div>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            position: "relative",
            right: "400px",
            justifyContent: "flex-end",
            marginBottom: "10px",
          }}
        >
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            + Add New
          </Button>
          <div style={{ boxShadow: "10px" }}>
            <Select
              placeholder="All State"
              allowClear
              style={{ minWidth: 180 }}
              options={searchCat?.map((state) => ({
                label: state,
                value: state,
              }))}
              onChange={(value) => setSelectedState(value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: "70%" }}>
            <Table
              columns={columns}
              dataSource={filteredData}
              size="small"
              rowKey="id"
              pagination={{
                pageSize: 10,
                current: 1,
              }}
            />
          </div>

          <div
            style={{ width: "30%", position: "sticky", top: 20, bottom: 10 }}
          >
            <Card title="Recently Added" size="small">
              {locationdetails?.slice(0, 5).map((item) => (
                <div key={item.id} style={{ marginBottom: 12 }}>
                  <Card size="small">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px" }}>
                        <strong>{item.area_name}</strong>
                        <p>{item?.pincode}</p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <Tag
                          style={{
                            border: "1px solid #34D399",
                            color: "#059669",
                            background: "#ECFDF5",
                            boxShadow: "0 1px 3px rgba(16, 185, 129, 0.25)",
                            fontSize: "9px",
                            padding: "0 8px",
                            lineHeight: "14px",
                            borderRadius: "6px",
                          }}
                        >
                          {format(
                            toZonedTime(
                              new Date(item.created_at),
                              "Asia/Kolkata"
                            ),
                            "dd MMM, HH:mm"
                          )}
                        </Tag>

                        <Tag
                          style={{
                            border: "1px solid #1F3A8A",
                            color: "#1F3A8A",
                            background: "#F0F5FF",
                            boxShadow: "0 1px 3px rgba(31, 58, 138, 0.25)",
                            fontSize: "9px",
                            padding: "0 8px",
                            lineHeight: "18px",
                            borderRadius: "6px",
                          }}
                        >
                          {item?.type}
                        </Tag>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </Card>
          </div>
        </div>
        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText={editingRecord ? "Update Location" : "Add Location"}
          cancelText="Cancel"
          centered
          width={600}
          bodyStyle={{ paddingTop: 12 }}
          title={
            <div
              style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
            >
              <div
                style={{
                  background: "#EEF2FF",
                  color: "#1F3A8A",
                  borderRadius: "10px",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EnvironmentOutlined style={{ fontSize: 20 }} />
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                  {editingRecord ? "Edit Location" : "Add New Location"}
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  Please fill all required location details
                </div>
              </div>
            </div>
          }
        >
          <Form form={form} layout="vertical" onFinish={handleAddAndEdit}>
            <Form.Item
              label="Area Name"
              name="area_name"
              rules={[{ required: true, message: "Please input area name" }]}
            >
              <Input placeholder="e.g. Koramangala" />
            </Form.Item>

            <div style={{ display: "flex", gap: "20px" }}>
              <Form.Item
                label="Pincode"
                name="pincode"
                rules={[
                  { required: true, message: "Please input pincode" },
                  {
                    pattern: /^\d{6}$/,
                    message: "Pincode must be exactly 6 digits",
                  },
                ]}
                style={{ flex: 1 }}
              >
                <Input
                  placeholder="560034"
                  maxLength={6}
                  inputMode="numeric"
                  onInput={(e) =>
                    (e.currentTarget.value = e.currentTarget.value.replace(
                      /\D/g,
                      ""
                    ))
                  }
                />
              </Form.Item>

              <Form.Item
                label="District"
                name="district"
                rules={[{ required: true, message: "Please input district" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="Bangalore Urban" />
              </Form.Item>
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
              <Form.Item
                label="State"
                name="state"
                rules={[{ required: true, message: "Please select state" }]}
                style={{ flex: 1 }}
              >
                <Select
                  placeholder="Select State"
                  options={indianStates.map((state) => ({
                    label: state,
                    value: state,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Country"
                name="country"
                rules={[{ required: true, message: "Please select country" }]}
                style={{ flex: 1 }}
              >
                <Select
                  placeholder="Select Country"
                  options={indianStates.map((state) => ({
                    label: state,
                    value: state,
                  }))}
                />
              </Form.Item>
            </div>
          </Form>
        </Modal>

        <Modal
          open={isDeleteModal}
          onCancel={() => setIsDeleteModal(false)}
          onOk={handleDelete}
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          centered
        >
          <div
            style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
          >
            <ExclamationCircleOutlined
              style={{ fontSize: "28px", color: "#FF4D4F" }}
            />

            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                Delete this location?
              </h3>

              <p style={{ marginTop: 6, color: "#6B7280", fontSize: "13px" }}>
                This action will permanently remove this location.
                <br />
                You won’t be able to undo this.
              </p>
            </div>
          </div>
        </Modal>
      </TitleBar>
    </div>
  );
};
