import React, { useState } from "react";
import {
  Drawer,
  Segmented,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";

/* ---------------- TYPES ---------------- */

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface PageItem {
  id: number;
  name: string;
  url: string;
}

export interface AccessLevel {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;

  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;

  pages: PageItem[];
  setPages: React.Dispatch<React.SetStateAction<PageItem[]>>;

  accessLevels: AccessLevel[];
  setAccessLevels: React.Dispatch<React.SetStateAction<AccessLevel[]>>;

  setTableData: React.Dispatch<React.SetStateAction<any[]>>;
  accessColorMap: Record<string, string>;
}

/* ---------------- COMPONENT ---------------- */

const ManageSettingsDrawer: React.FC<Props> = ({
  open,
  onClose,
  roles,
  setRoles,
  pages,
  setPages,
  accessLevels,
  setAccessLevels,
  setTableData,
  accessColorMap,
}) => {
  type TabKey = "roles" | "pages" | "access";
  const [activeTab, setActiveTab] = useState<TabKey>("roles");

  /* ======================= ROLES ======================= */

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm] = Form.useForm();

  const handleSaveRole = async () => {
    const values = await roleForm.validateFields();

    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, ...values } : r))
      );

      setTableData((prev) =>
        prev.map((p) =>
          p.roleName === editingRole.name
            ? {
                ...p,
                roleName: values.name,
                roleDescription: values.description,
              }
            : p
        )
      );

      message.success("Role updated");
    } else {
      setRoles((prev) => [...prev, { id: Date.now(), ...values }]);
      message.success("Role added");
    }

    setIsRoleModalOpen(false);
    setEditingRole(null);
    roleForm.resetFields();
  };

  const handleDeleteRole = (role: Role) => {
    Modal.confirm({
      title: `Delete role "${role.name}"?`,
      content: "All permissions for this role will be removed",
      okButtonProps: { danger: true },
      onOk() {
        setRoles((prev) => prev.filter((r) => r.id !== role.id));
        setTableData((prev) => prev.filter((p) => p.roleName !== role.name));
        message.success("Role & permissions deleted");
      },
    });
  };

  /* ======================= PAGES ======================= */

  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [pageForm] = Form.useForm();

  const handleSavePage = async () => {
    const values = await pageForm.validateFields();

    if (editingPage) {
      setPages((prev) =>
        prev.map((p) => (p.id === editingPage.id ? { ...p, ...values } : p))
      );

      setTableData((prev) =>
        prev.map((row) => ({
          ...row,
          pageNames: row.pageNames.map((n: string) =>
            n === editingPage.name ? values.name : n
          ),
          pageUrls: row.pageUrls.map((u: string) =>
            u === editingPage.url ? values.url : u
          ),
        }))
      );

      message.success("Page updated");
    } else {
      setPages((prev) => [...prev, { id: Date.now(), ...values }]);
      message.success("Page added");
    }

    setIsPageModalOpen(false);
    setEditingPage(null);
    pageForm.resetFields();
  };

  const handleDeletePage = (page: PageItem) => {
    Modal.confirm({
      title: `Delete page "${page.name}"?`,
      content: "This page will be removed from all permissions",
      okButtonProps: { danger: true },
      onOk() {
        setPages((prev) => prev.filter((p) => p.id !== page.id));
        setTableData((prev) =>
          prev.map((row) => ({
            ...row,
            pageNames: row.pageNames.filter((n: string) => n !== page.name),
            pageUrls: row.pageUrls.filter((u: string) => u !== page.url),
          }))
        );
        message.success("Page deleted");
      },
    });
  };

  /* ======================= ACCESS ======================= */

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessLevel | null>(null);
  const [accessForm] = Form.useForm();

  const handleSaveAccess = async () => {
    const values = await accessForm.validateFields();

    if (editingAccess) {
      setAccessLevels((prev) =>
        prev.map((a) =>
          a.id === editingAccess.id ? { ...a, name: values.name } : a
        )
      );

      setTableData((prev) =>
        prev.map((row) => ({
          ...row,
          accessLevels: row.accessLevels.map((a: string) =>
            a === editingAccess.name ? values.name : a
          ),
        }))
      );

      message.success("Access level updated");
    } else {
      setAccessLevels((prev) => [
        ...prev,
        { id: Date.now(), name: values.name },
      ]);
      message.success("Access level added");
    }

    setIsAccessModalOpen(false);
    setEditingAccess(null);
    accessForm.resetFields();
  };

  const handleDeleteAccess = (access: AccessLevel) => {
    Modal.confirm({
      title: `Delete access "${access.name}"?`,
      content: "This access level will be removed from all permissions",
      okButtonProps: { danger: true },
      onOk() {
        setAccessLevels((prev) => prev.filter((a) => a.id !== access.id));
        setTableData((prev) =>
          prev.map((row) => ({
            ...row,
            accessLevels: row.accessLevels.filter(
              (a: string) => a !== access.name
            ),
          }))
        );
        message.success("Access level deleted");
      },
    });
  };

  /* ======================= JSX ======================= */

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        width="100%"
        title="Manage Settings"
      >
        <div className="w-full max-w-screen-2xl mx-auto px-4 lg:px-8">
          <div className="mb-4 flex justify-center lg:justify-start">
            <Segmented
              value={activeTab}
              onChange={(v) => setActiveTab(v as TabKey)}
              options={[
                { label: "Roles", value: "roles" },
                { label: "Pages", value: "pages" },
                { label: "Access Levels", value: "access" },
              ]}
              style={{ marginBottom: 16 }}
            />
          </div>

          {/* ROLES */}
          {activeTab === "roles" && (
            <div className="w-full grid grid-cols-1 gap-4 mt-4">
              <div className="flex justify-end">
                <Button
                  type="primary"
                  onClick={() => {
                    setEditingRole(null);
                    roleForm.resetFields();
                    setIsRoleModalOpen(true);
                  }}
                >
                  + Add Role
                </Button>
              </div>

              <Table
                rowKey="id"
                pagination={false}
                dataSource={roles}
                columns={[
                  { title: "Role Name", dataIndex: "name" },
                  { title: "Description", dataIndex: "description" },
                  {
                    title: "Actions",
                    render: (_, r) => (
                      <Space>
                        <Button
                          icon={<EditOutlined />}
                          type="text"
                          onClick={() => {
                            setEditingRole(r);
                            roleForm.setFieldsValue(r);
                            setIsRoleModalOpen(true);
                          }}
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          type="text"
                          onClick={() => handleDeleteRole(r)}
                        />
                      </Space>
                    ),
                  },
                ]}
              />
            </div>
          )}

          {/* PAGES */}
          {activeTab === "pages" && (
            <>
              <div className="flex justify-end">
                <Button
                  type="primary"
                  onClick={() => {
                    setEditingPage(null);
                    pageForm.resetFields();
                    setIsPageModalOpen(true);
                  }}
                >
                  + Add Page
                </Button>
              </div>

              <Table
                rowKey="id"
                pagination={false}
                dataSource={pages}
                columns={[
                  { title: "Page Name", dataIndex: "name" },
                  { title: "Page URL", dataIndex: "url" },
                  {
                    title: "Actions",
                    render: (_, r) => (
                      <Space>
                        <Button
                          icon={<EditOutlined />}
                          type="text"
                          onClick={() => {
                            setEditingPage(r);
                            pageForm.setFieldsValue(r);
                            setIsPageModalOpen(true);
                          }}
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          type="text"
                          onClick={() => handleDeletePage(r)}
                        />
                      </Space>
                    ),
                  },
                ]}
              />
            </>
          )}

          {/* ACCESS */}

          {activeTab === "access" && (
            <>
              <div className="flex justify-end">
                <Button
                  type="primary"
                  onClick={() => {
                    setEditingAccess(null);
                    accessForm.resetFields();
                    setIsAccessModalOpen(true);
                  }}
                >
                  + Add Access Level
                </Button>
              </div>

              <Table
                rowKey="id"
                pagination={false}
                dataSource={accessLevels}
                columns={[
                  { title: "Access Level", dataIndex: "name" },
                  {
                    title: "Preview",
                    render: (_, r) => (
                      <Tag color={accessColorMap[r.name]}>{r.name}</Tag>
                    ),
                  },
                  {
                    title: "Actions",
                    render: (_, r) => (
                      <Space>
                        <Button
                          icon={<EditOutlined />}
                          type="text"
                          onClick={() => {
                            setEditingAccess(r);
                            accessForm.setFieldsValue({ name: r.name });
                            setIsAccessModalOpen(true);
                          }}
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          type="text"
                          onClick={() => handleDeleteAccess(r)}
                        />
                      </Space>
                    ),
                  },
                ]}
              />
            </>
          )}
        </div>
      </Drawer>

      {/* ROLE MODAL */}
      <Modal
        open={isRoleModalOpen}
        title={editingRole ? "Edit Role" : "Add Role"}
        onOk={handleSaveRole}
        onCancel={() => setIsRoleModalOpen(false)}
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
            <Input placeholder="Enter Role" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea placeholder="Enter Description" />
          </Form.Item>
        </Form>
      </Modal>

      {/* PAGE MODAL */}
      <Modal
        open={isPageModalOpen}
        title={editingPage ? "Edit Page" : "Add Page"}
        onOk={handleSavePage}
        onCancel={() => setIsPageModalOpen(false)}
      >
        <Form form={pageForm} layout="vertical">
          <Form.Item name="name" label="Page Name" rules={[{ required: true }]}>
            <Input placeholder="Enter Page Name" />
          </Form.Item>
          <Form.Item name="url" label="Page URL" rules={[{ required: true }]}>
            <Input placeholder="Enter Page Url" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ACCESS MODAL */}
      <Modal
        open={isAccessModalOpen}
        title={editingAccess ? "Edit Access Level" : "Add Access Level"}
        onOk={handleSaveAccess}
        onCancel={() => setIsAccessModalOpen(false)}
      >
        <Form form={accessForm} layout="vertical">
          <Form.Item
            name="name"
            label="Access Level"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter access level" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ManageSettingsDrawer;
