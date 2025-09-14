import { useState, useRef } from "react";
import { Button, Modal, Form, Input, Table, Tag, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useGetHeight } from "../utilities/customheightWidth";
import { EditOutlined } from "@ant-design/icons";
import { IoPersonAddOutline } from "react-icons/io5";
import { format } from "date-fns";
import { IoMdRefresh } from "react-icons/io";
import TitleBar from "../components/TitleBarCommon/TitleBar";
type User = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  alternativePhone?: string;
  role: string;
  status: string;
  password: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useGetHeight(contentRef);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      fullName: "John Doe",
      email: "john@example.com",
      phoneNumber: "1234567890",
      alternativePhone: "9876543210",
      role: "Admin",
      status: "Active",
      password: "password123",
      createdAt: "2025-08-22T14:22:33.000Z",
      updatedAt: "2025-08-22T14:22:33.000Z",
    },
  ]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString();

      if (editingUser) {
        setUsers(
          users.map((u) =>
            u.id === editingUser.id ? { ...u, ...values, updatedAt: now } : u
          )
        );
      } else {
        const newUser: User = {
          id: Date.now(),
          ...values,
          createdAt: now,
          updatedAt: now,
        };
        setUsers([...users, newUser]);
      }

      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      minWidth: 70,
      sorter: (a: User, b: User) => a.id - b.id,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      minWidth: 160,
      sorter: (a: User, b: User) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      minWidth: 160,
      sorter: (a: User, b: User) => a.email.localeCompare(b.email),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      minWidth: 160,
      sorter: (a: User, b: User) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Alternative Phone",
      dataIndex: "alternativePhone",
      key: "alternativePhone",
      minWidth: 160,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color="blue">{role}</Tag>,
      minWidth: 100,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "green";
        if (status === "Inactive") color = "orange";
        if (status === "Suspended") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
      minWidth: 100,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => format(new Date(text), "MMMM do yyyy, h:mm a"),
      minWidth: 160,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text: string) => format(new Date(text), "MMMM do yyyy, h:mm a"),
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      minWidth: 160,
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      render: (_, user) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => showEditModal(user)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <TitleBar
      title="Admin Management"
      description="Manage your admin users here"
      extraContent={
        <div className="flex items-center gap-2">
          <div>
            <Button
              icon={<IoPersonAddOutline />}
              type="primary"
              onClick={showAddModal}
            >
              Create Admin User
            </Button>
          </div>
          <div>
            <Button
              icon={<IoMdRefresh />}
              loading={false}
              type="primary"
              onClick={() => {}}
            >
              Refresh
            </Button>
          </div>
        </div>
      }
    >
      {" "}
      <div ref={contentRef} className="h-full w-full">
        <Table
          key={tableHeight}
          dataSource={users}
          columns={columns}
          rowKey="id"
          pagination={false}
          showSorterTooltip={false}
          tableLayout="auto"
          scroll={{ y: Math.floor(tableHeight || 0) }}
        />
        <Modal
          title={editingUser ? "Edit Admin User" : "Create Admin User"}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={editingUser ? "Update" : "Create"}
        >
          <Form form={form} layout="vertical" validateTrigger="onSubmit">
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter valid email",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="alternativePhone" label="Alternative Phone">
              <Input />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select>
                <Select.Option value="Admin">Admin</Select.Option>
                <Select.Option value="Manager">Manager</Select.Option>
                <Select.Option value="Developer">Developer</Select.Option>
                <Select.Option value="Tester">Tester</Select.Option>
                <Select.Option value="Support">Support</Select.Option>
                <Select.Option value="Designer">Designer</Select.Option>
                <Select.Option value="Analyst">Analyst</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select>
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
                <Select.Option value="Suspended">Suspended</Select.Option>
              </Select>
            </Form.Item>
            {!editingUser && (
              <>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Please enter password" }]}
                  hasFeedback
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </div>
    </TitleBar>
  );
}
