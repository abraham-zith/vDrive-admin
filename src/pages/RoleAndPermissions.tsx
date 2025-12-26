import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Select,
  Modal,
  Form,
  message,
  Segmented,
  Input,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import ManageSettingsDrawer from "../components/ManageSettingsDrawer";
import type {
  Role,
  PageItem,
  AccessLevel,
} from "../components/ManageSettingsDrawer";

const { Option } = Select;

/* ================= TYPES ================= */
// permission segment table  type
interface PermissionRow {
  id: number;
  roleName: string;
  roleDescription: string;
  pageNames: string[];
  pageUrls: string[];
  accessLevels: string[];
}

//user segment table type
interface UserRow {
  id: number;
  name: string;
  role: string;
}

/* -------------------- CONSTANTS -------------------- */

const ROLE_DESCRIPTION_MAP: Record<string, string> = {
  ADMIN: "Full system administrator with all permissions",
  SUPER_ADMIN: "Super administrator with elevated privileges",
  MANAGER: "Department manager with team oversight",
  USER: "Standard user with limited access",
  VIEWER: "Read-only access to system",
  DRIVER: "Standard driver with limited access",
  ELITE: "Elite role with full access",
};
const FULL_ACCESS_LEVELS = ["View", "Create", "Edit", "Delete"];

const accessColorMap: Record<string, string> = {
  View: "blue",
  Edit: "geekblue",
  Delete: "red",
  Create: "green",
};

/* ================= COMPONENT ================= */

const RoleAndPermissions: React.FC = () => {
  /* ================= MASTER DATA ================= */

  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: "ADMIN", description: "Full system administrator" },
    { id: 2, name: "SUPER_ADMIN", description: "Super administrator" },
    { id: 3, name: "MANAGER", description: "Department manager" },
    { id: 4, name: "USER", description: "Standard user" },
    { id: 5, name: "VIEWER", description: "Read only user" },
    { id: 6, name: "DRIVER", description: "Driver access" },
    { id: 7, name: "ELITE", description: "Elite role with full access" },
  ]);

  const [pages, setPages] = useState<PageItem[]>([
    { id: 1, name: "Dashboard", url: "/dashboard" },
    { id: 2, name: "Users", url: "/users" },
    { id: 3, name: "Drivers", url: "/drivers" },
    { id: 4, name: "Reports", url: "/reports" },
    { id: 5, name: "Settings", url: "/settings" },
    { id: 6, name: "Billing", url: "/billing" },
  ]);

  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([
    { id: 1, name: "View" },
    { id: 2, name: "Create" },
    { id: 3, name: "Edit" },
    { id: 4, name: "Delete" },
  ]);

  /* ================= TABLE DATA ================= */

  const dataSource: PermissionRow[] = [
    {
      id: 1,
      roleName: "ADMIN",
      roleDescription: ROLE_DESCRIPTION_MAP.ADMIN,
      pageNames: ["Dashboard"],
      pageUrls: ["/dashboard"],
      accessLevels: ["View", "Edit", "Create", "Delete"],
    },
    {
      id: 2,
      roleName: "ADMIN",
      roleDescription: "Full system administrator with all permissions",
      pageNames: ["Users"],
      pageUrls: ["/users"],
      accessLevels: ["View", "Edit", "Delete", "Create"],
    },

    {
      id: 3,
      roleName: "SUPER_ADMIN",
      roleDescription: ROLE_DESCRIPTION_MAP.ADMIN,
      pageNames: ["Drivers"],
      pageUrls: ["/drivers"],
      accessLevels: ["View", "Edit", "Delete", "Create"],
    },
    {
      id: 4,
      roleName: "MANAGER",
      roleDescription: ROLE_DESCRIPTION_MAP.ADMIN,
      pageNames: ["Reports"],
      pageUrls: ["/reports"],
      accessLevels: ["View", "Edit", "Create"],
    },
    {
      id: 5,
      roleName: "USER",
      roleDescription: ROLE_DESCRIPTION_MAP.ADMIN,
      pageNames: ["Reports"],
      pageUrls: ["/reports"],
      accessLevels: ["View", "Create"],
    },
    {
      id: 6,
      roleName: "VIEWER",
      roleDescription: ROLE_DESCRIPTION_MAP.ADMIN,
      pageNames: ["Settings"],
      pageUrls: ["/settings"],
      accessLevels: ["View"],
    },
    {
      id: 7,
      roleName: "SUPER_ADMIN",
      roleDescription: ROLE_DESCRIPTION_MAP.ADMIN,
      pageNames: ["Drivers"],
      pageUrls: ["/drivers"],
      accessLevels: ["View", "Edit", "Delete", "Create"],
    },
    {
      id: 8,
      roleName: "DRIVER",
      roleDescription: ROLE_DESCRIPTION_MAP.ADMIN,
      pageNames: ["Billing"],
      pageUrls: ["/billing"],
      accessLevels: ["View"],
    },

    {
      id: 9,
      roleName: "MANAGER",
      roleDescription: ROLE_DESCRIPTION_MAP.ADMIN,
      pageNames: ["Reports"],
      pageUrls: ["/reports"],
      accessLevels: ["View", "Edit", "Create"],
    },
    {
      id: 10,
      roleName: "VIEWER",
      roleDescription: ROLE_DESCRIPTION_MAP.ADMIN,
      pageNames: ["Settings"],
      pageUrls: ["/settings"],
      accessLevels: ["View"],
    },
  ];

  /* ================= FILTER STATE ================= */
  const [tableData, setTableData] = useState<PermissionRow[]>(dataSource);

  const [selectedRole, setSelectedRole] = useState<"all" | string>("all");
  const [selectedPage, setSelectedPage] = useState<"all" | string>("all");
  const [selectedAccess, setSelectedAccess] = useState<"all" | string>("all");

  /* ================= MODAL STATE ================= */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<PermissionRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);

  const [form] = Form.useForm();
  const selectedRoleInForm = Form.useWatch("roleName", form);
  const selectedPagesInForm = Form.useWatch("pageNames", form);

  const [users, setUsers] = useState<UserRow[]>([
    { id: 1, name: "John", role: "ADMIN" },
  ]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const [isUserDeleteOpen, setIsUserDeleteOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const [userForm] = Form.useForm();

  /* ================= SEGMENTED ================= */
  const [activeSegment, setActiveSegment] = useState<"permissions" | "users">(
    "permissions"
  );

  const [selectedUserFilter, setSelectedUserFilter] = useState<"all" | string>(
    "all"
  );

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | string>(
    "all"
  );

  /* ================= HELPERS ================= */

  const getPageUrl = (name: string) =>
    pages.find((p) => p.name === name)?.url || "/";

  useEffect(() => {
    if (
      selectedRoleInForm === "ELITE" &&
      selectedPagesInForm?.includes("FULL_ACCESS")
    ) {
      form.setFieldsValue({
        accessLevels: FULL_ACCESS_LEVELS,
      });
    }
  }, [selectedRoleInForm, selectedPagesInForm, form]);

  /* --------------------Front HANDLERS -------------------- */

  const handleEdit = (id: number) => {
    const row = tableData.find((i) => i.id === id);
    if (!row) return;

    setEditingRow(row);
    form.setFieldsValue({
      roleName: row.roleName,
      pageNames: row.pageNames,
      accessLevels: row.accessLevels,
    });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    setTableData((prev) => prev.filter((i) => i.id !== deletingId));
    message.success("Permission deleted");
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const handleSavePermission = async () => {
    try {
      const values = await form.validateFields();
      const { roleName, pageNames, accessLevels } = values;

      //  ROLE update in table
      const roleMeta = roles.find((r) => r.name === roleName);

      // FULL_ACCESS remove
      const cleanPages = pageNames.filter((p: string) => p !== "FULL_ACCESS");

      if (editingRow) {
        setTableData((prev) =>
          prev.map((item) =>
            item.id === editingRow.id
              ? {
                  ...item,
                  roleName,
                  roleDescription: roleMeta?.description || "",
                  pageNames: cleanPages, //  FULL REPLACE
                  pageUrls: cleanPages.map(getPageUrl), //  URL update
                  accessLevels,
                }
              : item
          )
        );

        message.success("Permission updated");
      } else {
        /* ============ ELITE + FULL ACCESS ============ */
        if (roleName === "ELITE" && pageNames.includes("FULL_ACCESS")) {
          // const allPages = Object.keys(PAGE_URL_MAP);
          const allPages = pages.map((p) => p.name);

          const newRow: PermissionRow = {
            id: Date.now(),
            roleName,
            roleDescription: roleMeta?.description || "",
            pageNames: allPages,
            //pageUrls: allPages.map((p: string) => PAGE_URL_MAP[p]),
            pageUrls: allPages.map(getPageUrl),
            accessLevels: FULL_ACCESS_LEVELS,
          };

          setTableData((prev) => [...prev, newRow]);
          message.success("ELITE role granted FULL ACCESS");
          setIsModalOpen(false);
          form.resetFields();
          return;
        }

        /* ============ NORMAL ROLES ============ */
        const existingPagesForRole = tableData
          .filter((item) => item.roleName === roleName)
          .flatMap((item) => item.pageNames);

        const newPagesToAdd = cleanPages.filter(
          (page: string) => !existingPagesForRole.includes(page)
        );

        if (newPagesToAdd.length === 0) {
          message.error("Selected pages already exist for this role");
          return;
        }

        const newRow: PermissionRow = {
          id: Date.now(),
          roleName,
          roleDescription: roleMeta?.description || "",
          pageNames: newPagesToAdd,
          pageUrls: newPagesToAdd.map(getPageUrl),
          accessLevels,
        };

        setTableData((prev) => [...prev, newRow]);
        message.success("Permission added");
      }

      setIsModalOpen(false);
      setEditingRow(null);
      form.resetFields();
    } catch (error) {
      console.log("handleSavePermission:", error);
    }
  };

  /* ================= TABLE ================= */

  const columns: ColumnsType<PermissionRow> = [
    {
      title: "Role Name",
      dataIndex: "roleName",
      render: (t) => <b>{t}</b>,
    },
    {
      title: "Role Description",
      dataIndex: "roleDescription",
    },
    {
      title: "Pages",
      dataIndex: "pageNames",
      render: (pages: string[]) => (
        <>
          {pages.map((p) => (
            <Tag key={p}>{p}</Tag>
          ))}
        </>
      ),
    },
    {
      title: "Page URLs",
      dataIndex: "pageUrls",
      render: (urls: string[]) => (
        <Space direction="vertical">
          {urls.map((u) => (
            <span key={u} style={{ fontFamily: "monospace" }}>
              {u}
            </span>
          ))}
        </Space>
      ),
    },
    {
      title: "Access Levels",
      dataIndex: "accessLevels",
      render: (levels: string[]) => (
        <>
          {levels.map((l) => (
            <Tag key={l} color={accessColorMap[l]}>
              {l}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Actions",
      render: (_, r) => (
        <>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(r.id)}
          />
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => {
              setDeletingId(r.id);
              setIsDeleteModalOpen(true);
            }}
          />
        </>
      ),
    },
  ];
  /* -------------------- FILTERS -------------------- */

  const filteredPermissions = tableData.filter((item) => {
    const roleMatch = selectedRole === "all" || item.roleName === selectedRole;

    const pageMatch =
      selectedPage === "all" || item.pageNames.includes(selectedPage);

    const accessMatch =
      selectedAccess === "all" || item.accessLevels.includes(selectedAccess);

    return roleMatch && pageMatch && accessMatch;
  });

  const handleClearFilters = () => {
    setSelectedRole("all");
    setSelectedPage("all");
    setSelectedAccess("all");
    //setTableData(masterData); // optional reset
  };

  const isFilterApplied =
    selectedRole !== "all" ||
    selectedPage !== "all" ||
    selectedAccess !== "all";

  /* =================users Segment ================= */
  const userTableColumns: ColumnsType<UserRow> = [
    {
      title: "User",
      dataIndex: "name",
      render: (t) => <b>{t}</b>,
    },
    {
      title: "Permission",
      dataIndex: "role",
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              userForm.setFieldsValue(record);
              setIsUserModalOpen(true);
            }}
          />
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => {
              setDeletingUserId(record.id);
              setIsUserDeleteOpen(true);
            }}
          />
        </>
      ),
    },
  ];

  const filteredUsers = users.filter((u) => {
    const userMatch =
      selectedUserFilter === "all" || u.name === selectedUserFilter;

    const roleMatch =
      selectedRoleFilter === "all" || u.role === selectedRoleFilter;

    return userMatch && roleMatch;
  });

  /* ================= JSX ================= */
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 lg:px-8">
      <TitleBar
        icon={<SafetyCertificateOutlined />}
        title="Access Control Management"
        description="Manage roles, pages, and access levels across the system."
        extraContent={
          <div className="flex flex-wrap gap-2 items-center justify-end">
            {/* SEGMENTED */}
            <Segmented
              value={activeSegment}
              onChange={(val) =>
                setActiveSegment(val as "permissions" | "users")
              }
              options={[
                { label: "Permissions", value: "permissions" },
                { label: "Users", value: "users" },
              ]}
            />

            <Button
              icon={<SettingOutlined />}
              onClick={() => setIsManageDrawerOpen(true)}
            >
              Manage
            </Button>

            {activeSegment === "permissions" && (
              <Button
                type="primary"
                onClick={() => {
                  setEditingRow(null);
                  form.resetFields();
                  setIsModalOpen(true);
                }}
              >
                + Add Permission
              </Button>
            )}
          </div>
        }
      />

      {activeSegment === "permissions" && (
        <>
          {/* FILTERS */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <Select value={selectedRole} onChange={setSelectedRole}>
              <Option value="all">All Roles</Option>
              {roles.map((r) => (
                <Option key={r.name} value={r.name}>
                  {r.name}
                </Option>
              ))}
            </Select>

            <Select value={selectedPage} onChange={setSelectedPage}>
              {/* <Option value="all">All Pages</Option>
          <Option value="Dashboard">Dashboard</Option>
          <Option value="Users">Users</Option>
          <Option value="Drivers">Drivers</Option>
          <Option value="Reports">Reports</Option>
          <Option value="Settings">Settings</Option> */}
              <Option value="all">All Pages</Option>
              {pages.map((p) => (
                <Option key={p.name} value={p.name}>
                  {p.name}
                </Option>
              ))}
            </Select>

            <Select value={selectedAccess} onChange={setSelectedAccess}>
              <Option value="all">All Access Levels</Option>
              {accessLevels.map((a) => (
                <Option key={a.name} value={a.name}>
                  {a.name}
                </Option>
              ))}
            </Select>

            {isFilterApplied && (
              <Button danger onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="w-full overflow-x-auto mt-4">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredPermissions}
              bordered
              pagination={{ pageSize: 8, size: "small" }}
              size="small"
              style={{ marginTop: 20 }}
              components={{
                header: {
                  cell: (props: any) => (
                    <th
                      {...props}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        //borderBottom: "2px solid #d1d5db",
                        fontWeight: 600,
                        background: "#f9fafb",
                      }}
                    />
                  ),
                },
                body: {
                  cell: (props: any) => (
                    <td
                      {...props}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    />
                  ),
                },
              }}
            />
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            Showing {filteredPermissions.length} of {filteredPermissions.length}{" "}
            permissions
          </div>
        </>
      )}

      {activeSegment === "users" && (
        <>
          <Space style={{ marginBottom: 12 }} wrap>
            {/* USER FILTER */}
            <Select
              style={{ width: 200 }}
              value={selectedUserFilter}
              onChange={setSelectedUserFilter}
            >
              <Option value="all">All Users</Option>
              {users.map((u) => (
                <Option key={u.id} value={u.name}>
                  {u.name}
                </Option>
              ))}
            </Select>

            {/* ROLE / PERMISSION FILTER */}
            <Select
              style={{ width: 200 }}
              value={selectedRoleFilter}
              onChange={setSelectedRoleFilter}
            >
              <Option value="all">All Permissions</Option>
              {roles.map((r) => (
                <Option key={r.name} value={r.name}>
                  {r.name}
                </Option>
              ))}
            </Select>

            {/* CLEAR FILTER */}
            {(selectedUserFilter !== "all" || selectedRoleFilter !== "all") && (
              <Button
                danger
                onClick={() => {
                  setSelectedUserFilter("all");
                  setSelectedRoleFilter("all");
                }}
              >
                Clear
              </Button>
            )}

            {/* ADD USER */}
            <Button
              type="primary"
              onClick={() => {
                setEditingUser(null);
                userForm.resetFields();
                setIsUserModalOpen(true);
              }}
            >
              + Add User
            </Button>
          </Space>

          <div className="w-full overflow-x-auto">
            <Table
              rowKey="id"
              columns={userTableColumns}
              dataSource={filteredUsers}
              bordered
              pagination={false}
              size="small"
            />
          </div>
        </>
      )}

      {/* ADD / EDIT permissions MODAL */}
      <Modal
        title={editingRow ? "Edit Permission" : "Add Permission"}
        open={isModalOpen}
        onOk={handleSavePermission}
        okText={editingRow ? "Change Save" : "Add"}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form layout="vertical" form={form}>
          {/* <Form.Item name="roleName" label="Role" rules={[{ required: true }]}>
            <Select>
              {Object.keys(ROLE_DESCRIPTION_MAP).map((r) => (
                <Option key={r} value={r}>
                  {r}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

          <Form.Item name="roleName" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select role">
              {roles.map((r) => (
                <Option key={r.name} value={r.name}>
                  {r.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="pageNames"
            label="Pages"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="Select Page">
              {pages.map((p) => (
                <Option key={p.name} value={p.name}>
                  {p.name}
                </Option>
              ))}

              {/*  ELITE role-ku mattum */}
              {selectedRoleInForm === "ELITE" && (
                <Option value="FULL_ACCESS">Full Access</Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="accessLevels"
            label="Access Levels"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="Select access levels">
              {accessLevels.map((a) => (
                <Option key={a.id} value={a.name}>
                  {a.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* DELETE & EDIT users segment*/}
      <Modal
        title="Delete this permission?"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={handleDelete}
        okButtonProps={{ danger: true }}
      >
        This action cannot be undone.
      </Modal>

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isUserModalOpen}
        onCancel={() => setIsUserModalOpen(false)}
        onOk={async () => {
          const values = await userForm.validateFields();

          setUsers((prev) => {
            const userWithSameName = prev.find(
              (u) => u.name.toLowerCase() === values.name.toLowerCase()
            );

            //  ADD MODE
            if (!editingUser) {
              if (userWithSameName) {
                message.error("User already exists");
                return prev; //  duplicate add block
              }

              return [...prev, { id: Date.now(), ...values }];
            }

            //  EDIT MODE → same user role update allowed
            return prev.map((u) =>
              u.id === editingUser.id
                ? { ...u, name: values.name, role: values.role } // role editable
                : u
            );
          });

          setIsUserModalOpen(false);
          setEditingUser(null);
          userForm.resetFields();
        }}
      >
        <Form layout="vertical" form={userForm}>
          <Form.Item
            name="name"
            label="User Name"
            rules={[{ required: true, message: "Please enter user name" }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Permission"
            rules={[{ required: true }]}
          >
            <Select placeholder="select role">
              {roles.map((r) => (
                <Option key={r.name} value={r.name}>
                  {r.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Delete this user?"
        open={isUserDeleteOpen}
        okButtonProps={{ danger: true }}
        onCancel={() => setIsUserDeleteOpen(false)}
        onOk={() => {
          setUsers((prev) => prev.filter((u) => u.id !== deletingUserId));
          message.success("User deleted");
          setIsUserDeleteOpen(false);
          setDeletingUserId(null);
        }}
      >
        This action cannot be undone.
      </Modal>

      {/* MANAGE DRAWER */}
      <ManageSettingsDrawer
        open={isManageDrawerOpen}
        onClose={() => setIsManageDrawerOpen(false)}
        roles={roles}
        setRoles={setRoles}
        pages={pages}
        setPages={setPages}
        accessLevels={accessLevels}
        setAccessLevels={setAccessLevels}
        setTableData={setTableData}
        accessColorMap={accessColorMap}
      />
    </div>
  );
};

export default RoleAndPermissions;
