import { useEffect, useRef } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { IoPersonAddOutline } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { format } from "date-fns";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import { useGetHeight } from "../utilities/customheightWidth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  type AdminUser,
} from "../store/slices/adminSlice";
import { messageApi } from "../utilities/antdStaticHolder";
import { useState } from "react";

type ModalMode = "create" | "edit";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{5,18}$/;
const phoneRegex = /^\+?[0-9]{6,15}$/;

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { admins, loading, submitting } = useAppSelector(
    (state) => state.admin
  );
  const currentRole = useAppSelector((state) => state.auth.role);
  const isSuperAdmin = currentRole === "super_admin";

  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useGetHeight(contentRef);

  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingAdmin(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setModalMode("edit");
    setEditingAdmin(admin);
    form.setFieldsValue({
      name: admin.name,
      email: admin.email,
      contact: admin.contact ?? "",
      role: admin.role,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    form.validateFields().then(async (values) => {
      if (modalMode === "create") {
        const payload: {
          name: string;
          email: string;
          password: string;
          role: "admin" | "super_admin";
          contact?: string;
        } = {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        };
        if (values.contact) payload.contact = values.contact;

        const result = await dispatch(createAdminUser(payload));
        if (createAdminUser.fulfilled.match(result)) {
          messageApi?.success("Admin user created successfully");
          setIsModalOpen(false);
          form.resetFields();
        }
      } else if (editingAdmin) {
        const payload: {
          name?: string;
          email?: string;
          contact?: string;
          role?: "admin" | "super_admin";
        } = {};
        if (values.name !== editingAdmin.name) payload.name = values.name;
        if (values.email !== editingAdmin.email) payload.email = values.email;
        if ((values.contact || null) !== editingAdmin.contact)
          payload.contact = values.contact || undefined;
        if (values.role !== editingAdmin.role) payload.role = values.role;

        if (Object.keys(payload).length === 0) {
          setIsModalOpen(false);
          return;
        }

        const result = await dispatch(
          updateAdminUser({ id: editingAdmin.id, data: payload })
        );
        if (updateAdminUser.fulfilled.match(result)) {
          messageApi?.success("Admin user updated successfully");
          setIsModalOpen(false);
          form.resetFields();
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(deleteAdminUser(id));
    if (deleteAdminUser.fulfilled.match(result)) {
      messageApi?.success("Admin user deleted successfully");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const roleTagColor: Record<string, string> = {
    super_admin: "purple",
    admin: "blue",
  };

  const roleLabel: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      minWidth: 160,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      minWidth: 200,
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      minWidth: 140,
      render: (contact: string | null) => contact || "—",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      minWidth: 120,
      render: (role: string) => (
        <Tag color={roleTagColor[role] ?? "default"}>
          {roleLabel[role] ?? role}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      minWidth: 180,
      render: (text: string) => format(new Date(text), "MMM d, yyyy h:mm a"),
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      minWidth: 180,
      render: (text: string) => format(new Date(text), "MMM d, yyyy h:mm a"),
      sorter: (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    },
    ...(isSuperAdmin
      ? [
          {
            title: "Action",
            key: "action",
            width: 160,
            render: (_: unknown, admin: AdminUser) => (
              <div className="flex items-center gap-1">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(admin)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete admin user"
                  description="Are you sure you want to delete this admin user?"
                  onConfirm={() => handleDelete(admin.id)}
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            ),
          } as ColumnsType<AdminUser>[number],
        ]
      : []),
  ];

  return (
    <TitleBar
      title="Admin Management"
      description="Manage your admin users here"
      extraContent={
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button
              icon={<IoPersonAddOutline />}
              type="primary"
              onClick={openCreateModal}
            >
              Create Admin User
            </Button>
          )}
          <Button
            icon={<IoMdRefresh />}
            loading={loading}
            type="primary"
            onClick={() => dispatch(fetchAdminUsers())}
          >
            Refresh
          </Button>
        </div>
      }
    >
      <div ref={contentRef} className="h-full w-full">
        <Table
          key={tableHeight}
          dataSource={admins}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          showSorterTooltip={false}
          tableLayout="auto"
          scroll={{ y: Math.floor(tableHeight || 0) }}
        />

        <Modal
          title={
            modalMode === "create" ? "Create Admin User" : "Edit Admin User"
          }
          open={isModalOpen}
          onOk={handleModalSubmit}
          onCancel={handleCancel}
          okText={modalMode === "create" ? "Create" : "Update"}
          confirmLoading={submitting}
          destroyOnHidden
        >
          <Form form={form} layout="vertical" validateTrigger="onSubmit">
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Name is required" },
                { min: 2, message: "Name must be at least 2 characters" },
                { max: 100, message: "Name must not exceed 100 characters" },
              ]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email address" },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item
              name="contact"
              label="Contact (Phone)"
              rules={[
                {
                  pattern: phoneRegex,
                  message:
                    "Enter a valid phone number (6–15 digits, optional +)",
                },
                { max: 15, message: "Contact must not exceed 15 characters" },
              ]}
            >
              <Input placeholder="e.g. +911234567890 (optional)" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Role is required" }]}
              initialValue="admin"
            >
              <Select placeholder="Select role">
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="super_admin">Super Admin</Select.Option>
              </Select>
            </Form.Item>

            {modalMode === "create" && (
              <>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Password is required" },
                    {
                      pattern: passwordRegex,
                      message:
                        "Password must be 5–18 characters with at least 1 uppercase, 1 number, and 1 special character",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="Enter password" />
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
                          new Error("Passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Re-enter password" />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </div>
    </TitleBar>
  );
}
