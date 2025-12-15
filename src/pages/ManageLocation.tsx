import { useEffect, useState } from "react";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import { Button, Input, Table, Card, Modal, Form, Select } from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import AdvancedFilters, {
  type FilterField,
} from "../components/AdvancedFilters/AdvanceFilters";

import type { ColumnType } from "antd/es/table";

const fields: FilterField[] = [
  {
    name: "states",
    label: "States",
    type: "select",
  },
];

export interface Location {
  locationId: string;
  area_name: string;
  pincode: string;
  district: string;
  state: string;
  country: string;
  type: string;
  created_at: string;
  updated_at: string;
}

const DATA: Location[] = [
  {
    locationId: "123",
    area_name: "Andheri West",
    pincode: "400053",
    district: "Mumbai Suburban",
    state: "Maharashtra",
    country: "Tamilnadu",
    type: "manual",
    created_at: "678",
    updated_at: "567",
  },
];

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh"];

const applyFilters = () => {};

export const ManageLocation = () => {
  const [locationdetails, setLocationDetails] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  useEffect(() => {
    setLocationDetails(DATA);
  }, []);

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
    },
    {
      title: "Actions",
      render: (_) => (
        <div style={{ display: "flex", gap: "20px" }}>
          <EditOutlined onClick={() => setIsModalOpen(true)} />
          <DeleteOutlined
            onClick={() => setIsDeleteModal(true)}
            style={{ color: "red", cursor: "pointer" }}
          />
        </div>
      ),
    },
  ];

  return (
    <TitleBar
      title="Manage Locations"
      description="Add and manage custom locations for your app"
      extraContent={
        <div className="flex items-center gap-2">
          <div>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search Location....."
            />
          </div>
          <div>
            <Button icon={<DownloadOutlined />}>Export CSV</Button>
          </div>
        </div>
      }
    >
      <div>
        <AdvancedFilters filterFields={fields} applyFilters={applyFilters} />
      </div>
      <Button type="primary" onClick={() => setIsModalOpen(true)}>
        + Add New
      </Button>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ width: "70%" }}>
          <Table
            columns={columns}
            dataSource={locationdetails}
            rowKey="locationId"
            pagination={{
              pageSize: 5,
            }}
          />
        </div>

        <div style={{ width: "30%", position: "sticky", top: 24 }}>
          <Card title="Recently Added">
            {locationdetails?.slice(0, 5).map((item) => (
              <div key={item.locationId} style={{ marginBottom: 12 }}>
                <Card>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <strong>{item.area_name}</strong>
                      <p>{item?.pincode}</p>
                    </div>
                    <div>
                      <p
                        style={{
                          border: "1px solid #021945",
                          borderRadius: "5px",
                          padding: "3px",
                          background: "#021945",
                          color: "white",
                        }}
                      >
                        {item?.type}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <Modal
        title="Add New Location"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form layout="vertical">
          <Form.Item
            label="Area Name"
            name="area_name"
            rules={[{ required: true, message: "please input areaname" }]}
          >
            <Input placeholder="e.g,. Koramangala" />
          </Form.Item>

          <div style={{ display: "flex", gap: "40px" }}>
            <Form.Item
              label="Pincode"
              name="pincode"
              rules={[{ required: true, message: "please input pincode" }]}
            >
              <Input placeholder="560034" />
            </Form.Item>

            <Form.Item
              label="District"
              name="district"
              rules={[{ required: true, message: "please input district" }]}
            >
              <Input placeholder="Bangalore Urban" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: "50px" }}>
            <Form.Item
              label="State"
              name="state"
              rules={[{ required: true, message: "please input State" }]}
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
              rules={[{ required: true, message: "please input Country" }]}
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
        title="Delete this location?"
        open={isDeleteModal}
        onCancel={() => setIsDeleteModal(false)}
      >
        <p>
          This will permanently delete this location. This action cannot be
          undone.
        </p>
      </Modal>
    </TitleBar>
  );
};
